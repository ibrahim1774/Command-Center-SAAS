import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Command Center — Social Media Analytics for Creators",
    template: "%s | Command Center",
  },
  description:
    "AI-powered analytics across Instagram, YouTube, and Facebook with brand deal CRM and personal productivity tools. Built for creators who take their craft seriously.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://commandcenter.app"),
  openGraph: {
    title: "Command Center — Social Media Analytics for Creators",
    description: "AI-powered analytics, brand deal CRM, goal tracking, and journaling for serious creators.",
    type: "website",
    siteName: "Command Center",
  },
  twitter: {
    card: "summary_large_image",
    title: "Command Center — Social Media Analytics for Creators",
    description: "AI-powered analytics, brand deal CRM, and productivity tools for creators.",
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
