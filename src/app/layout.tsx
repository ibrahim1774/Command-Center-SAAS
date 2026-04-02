import type { Metadata } from "next";
import Script from "next/script";
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
      <head>
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "w5jdq6huun");`}
        </Script>
      </head>
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
