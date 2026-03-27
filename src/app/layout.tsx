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
    default: "Nurplix — Social Media Command Center for Creators",
    template: "%s | Nurplix",
  },
  description:
    "Nurplix is your social media command center — AI-powered analytics across Instagram, YouTube, and Facebook with brand deal CRM and productivity tools for creators.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.nurplix.com"),
  openGraph: {
    title: "Nurplix — Social Media Command Center for Creators",
    description: "AI-powered analytics, brand deal CRM, goal tracking, and journaling for serious creators.",
    type: "website",
    siteName: "Nurplix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nurplix — Social Media Command Center for Creators",
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
