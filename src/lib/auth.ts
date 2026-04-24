import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import { checkRateLimit } from "./rateLimit";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, { databaseName: "binayah_web_new_dev" }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const email = credentials.email.toLowerCase().trim();

          // Brute-force protection: 10 attempts per 15 min per email
          if (!(await checkRateLimit("login", email, 10, 15 * 60 * 1000))) {
            throw new Error("TooManyRequests");
          }

          const client = await clientPromise;
          const db = client.db("binayah_web_new_dev");
          const user = await db.collection("users").findOne(
            { email },
            { projection: { _id: 1, email: 1, name: 1, image: 1, passwordHash: 1, emailVerified: 1 } }
          );
          if (!user || !user.passwordHash) return null;
          if (!user.emailVerified) return null;
          const valid = await bcrypt.compare(credentials.password, user.passwordHash);
          if (!valid) return null;
          return {
            id: String(user._id),
            email: user.email as string,
            name: (user.name as string) || null,
            image: (user.image as string) || null,
          };
        } catch (err: any) {
          if (err?.message === "TooManyRequests") throw err;
          return null;
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      // On subsequent requests (not first sign-in), check if password was changed after token issued
      if (token.sub && !user) {
        try {
          const client = await clientPromise;
          const db = client.db("binayah_web_new_dev");
          const dbUser = await db.collection("users").findOne(
            { _id: new ObjectId(token.sub) },
            { projection: { passwordChangedAt: 1 } }
          );
          if (dbUser?.passwordChangedAt && token.iat) {
            const changedAtSec = Math.floor(new Date(dbUser.passwordChangedAt).getTime() / 1000);
            if (changedAtSec > (token.iat as number)) {
              // Password changed after this token was issued — force sign-out
              return null as any;
            }
          }
        } catch { /* allow session on transient DB error */ }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
  pages: { signIn: "/signin" },
};
