import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono, PT_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/components/i18n-provider";
import { Footer, Header } from "@/components/site-chrome";
import { SEO, getSiteUrl } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = PT_Serif({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "700"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SEO.title,
    template: SEO.titleTemplate,
  },
  description: SEO.description,
  keywords: SEO.keywords,
  applicationName: SEO.siteName,
  authors: [{ name: SEO.siteName }],
  creator: SEO.siteName,
  alternates: {
    canonical: "/",
    languages: { ru: "/", "x-default": "/" },
  },
  openGraph: {
    type: "website",
    locale: SEO.locale,
    url: siteUrl,
    siteName: SEO.siteName,
    title: SEO.title,
    description: SEO.description,
  },
  twitter: {
    card: "summary_large_image",
    title: SEO.title,
    description: SEO.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "geo.region": "RU",
    "geo.placename": "Russia",
  },
  verification: {
    yandex: process.env.YANDEX_VERIFICATION || undefined,
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <I18nProvider>
            <Header />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">{children}</main>
            <Footer />
            <Toaster richColors position="top-center" />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
