import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

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
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
