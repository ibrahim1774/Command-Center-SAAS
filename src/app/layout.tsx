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
    default: "Nurplix — Claude Command Center for Analytics, Brand Deals & Goals",
    template: "%s | Nurplix",
  },
  description:
    "Your Claude command center. See Instagram, YouTube, TikTok, and Facebook analytics in one dashboard. Track brand deals, catch trends, and get AI insights. Try free for 3 days.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://www.nurplix.com"),
  openGraph: {
    title: "Nurplix — Claude Command Center for Analytics, Brand Deals & Goals",
    description: "Your Claude command center. See Instagram, YouTube, TikTok, and Facebook analytics in one dashboard. Track brand deals, catch trends, and get AI insights. Try free for 3 days.",
    type: "website",
    siteName: "Nurplix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nurplix — Claude Command Center for Analytics, Brand Deals & Goals",
    description: "Your Claude command center. See Instagram, YouTube, TikTok, and Facebook analytics in one dashboard. Track brand deals, catch trends, and get AI insights. Try free for 3 days.",
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
        <Script id="meta-pixel" strategy="beforeInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','26490568997297314');fbq('track','PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=26490568997297314&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body>
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
