import { AppShell } from "@/components/layout/AppShell";
import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: {
    default: "FakeBank — Cedar Grove Financial",
    template: "%s · FakeBank",
  },
  description:
    "Fictional online banking interface for authorized cybersecurity training.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-CA">
      <body className={`${sourceSans.variable} ${sourceSerif.variable} font-sans antialiased`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
