import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { PreloaderProvider } from "@/components/preloader/preloader-provider";

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
  title: "Skander Nefli",
  description: "Portfolio of Skander Nefli.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
        <PreloaderProvider>{children}</PreloaderProvider>
      </body>
    </html>
  );
}
