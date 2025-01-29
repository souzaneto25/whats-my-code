import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const mulish = Mulish({
  subsets: ["latin-ext"],
});

export const metadata: Metadata = {
  title: "Whats my code",
  description: "What is my code?",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className={`${mulish.className} dark antialiased`}>
        <Analytics />
        <SpeedInsights />
        <div className="flex h-full flex-col overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
