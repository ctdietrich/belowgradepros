import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { resolveSiteUrl, site } from "@/lib/config";
import "./globals.css";

function metadataBaseUrl(): URL {
  try {
    return new URL(resolveSiteUrl());
  } catch {
    return new URL("https://belowgradepros.com");
  }
}

const sans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
});

const display = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const url = resolveSiteUrl();
  return {
    metadataBase: metadataBaseUrl(),
    title: {
      default: `${site.name} — ${site.tagline}`,
      template: `%s · ${site.name}`,
    },
    description: site.description,
    openGraph: {
      title: site.name,
      description: site.description,
      url,
      siteName: site.name,
      locale: "en_US",
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-page font-sans text-slate">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
