"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
    dataLayer: unknown[];
  }
}

interface Props {
  ga4Id: string;
}

/**
 * GA4 analytics component.
 * - Loads gtag.js once with strategy="afterInteractive"
 * - Fires a page_view event on every client-side route change
 */
export function GoogleAnalytics({ ga4Id }: Props) {
  const pathname = usePathname();

  // Fire page_view on every navigation
  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", "page_view", {
      page_path: pathname,
      send_to: ga4Id,
    });
  }, [pathname, ga4Id]);

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ga4Id}', { send_page_view: false });
          `,
        }}
      />
    </>
  );
}
