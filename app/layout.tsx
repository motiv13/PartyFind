import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PresenceHeartbeat from "@/components/auth/PresenceHeartbeat";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PartyFind — Find your team",
  description: "Find teammates, join groups, and connect with players on PartyFind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <PresenceHeartbeat />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
