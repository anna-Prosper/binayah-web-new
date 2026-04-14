import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Binayah Properties — Dubai Real Estate",
  description: "Dubai's trusted property partner. Find luxury homes, off-plan investments, and expert property management services.",
  openGraph: {
    title: "Binayah Properties — Dubai Real Estate",
    description: "Dubai's trusted property partner for buying, selling & renting properties.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${playfair.variable}`}>
      <body className={jakarta.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
