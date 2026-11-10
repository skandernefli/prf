import type { Metadata } from "next";
import { Archivo, Geist, Geist_Mono, IBM_Plex_Mono } from "next/font/google";

import { PreloaderProvider } from "@/components/preloader/preloader-provider";
import { SmoothScroll } from "@/components/smooth-scroll/smooth-scroll";

import CustomCursor from "@/components/custom-cursor";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.skandernefli.eu"),
  title: {
    default: "Skander Nefli | Full-Stack Software Engineer",
    template: "%s | Skander Nefli",
  },
  description:
    "Full-Stack Software Engineer and Integration Specialist building digital products from concept to launch.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.skandernefli.eu",
    siteName: "Skander Nefli",
    title: "Skander Nefli | Full-Stack Software Engineer",
    description:
      "Full-Stack Software Engineer and Integration Specialist building digital products from concept to launch.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Skander Nefli — Full-Stack Software Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Skander Nefli | Full-Stack Software Engineer",
    description:
      "Full-Stack Software Engineer and Integration Specialist building digital products from concept to launch.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${archivo.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <noscript>
          <style>{`
            [data-site-preloader] { display: none !important; }
            html, html:has([data-site-preloader]), html[data-preloading] {
              overflow: auto !important;
            }
          `}</style>
        </noscript>
        <PreloaderProvider>
          <CustomCursor />
          <SmoothScroll>
            {children}
            <SiteFooter />
          </SmoothScroll>
        </PreloaderProvider>
      </body>
    </html>
  );
}
