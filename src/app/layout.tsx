import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { fontVariables } from "@/lib/fonts";
import { getSiteSettings } from "@/content";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSiteSettings();
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — ${site.tagline}`,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    openGraph: {
      type: "website",
      locale: site.locale,
      url: site.url,
      siteName: site.name,
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
    },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#08080a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fontVariables} h-full antialiased`}
      // The head script below adds a `js` class to this element before React
      // hydrates, which React would otherwise flag as a server/client mismatch.
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {/*
          Marks the document as JS-capable before first paint, which is what
          arms the `.js [data-animate]` hide rule in globals.css. Without JS the
          class never lands, nothing is hidden, and the site degrades to plain
          unanimated content instead of a blank page.
        */}
        <Script id="js-capable" strategy="beforeInteractive">
          {`document.documentElement.classList.add('js')`}
        </Script>
        {children}
      </body>
    </html>
  );
}
