import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans_Condensed } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/QueryProvider";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
});

const plexCondensed = IBM_Plex_Sans_Condensed({
  variable: "--font-plex-condensed",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "ATS/OPT · Resume vs. job ad",
  description:
    "Measure how much of a job ad's skill list your resume covers, and what is missing.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${plexMono.variable} ${plexCondensed.variable} font-mono antialiased`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
