import type { Metadata } from "next";
import Script from "next/script";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "../globals.css";
import { getAnalyticsConfig } from "@/lib/analytics";
import { GoogleTagManager } from "@/components/shared/GoogleTagManager";
import { GoogleAnalytics } from "@/components/shared/GoogleAnalytics";
import { Navbar } from "@/components/public/sections/Navbar";
import { Footer } from "@/components/public/sections/Footer";
import { getMenuItems } from "@/lib/menu";
import { CookieConsent } from "@/components/shared/CookieConsent";
import { BrochureDownloadModal } from "@/components/shared/BrochureDownloadModal";
import { ClientInit } from "@/components/shared/ClientInit";
import { getAllSettings, SETTINGS } from "@/lib/settings";

// ─── CSS: Load ALL original CSS files in exact order from original HTML ──────
import "../../../public/assets/css/bootstrap.min.css";
import "../../../public/assets/lib/font-awesome-pro/css/fontawesome.min.css";
import "../../../public/assets/css/logistic-icons.min.css";
import "../../../public/assets/css/odometer.min.css";
import "../../../public/assets/css/nice-select.css";
import "../../../public/assets/css/swiper.min.css";
import "../../../public/assets/css/venobox.min.css";
import "../../../public/assets/css/slider.css";
import "../../../public/assets/css/common-style.css";
import "../../../public/assets/css/main.css";
import "../../../public/assets/css/premium-enhancements.css";
import "../../../public/assets/css/brochure-widget.css";
import "../../../public/assets/css/header-slider-redesign.css";
import "../../../public/assets/css/critical-sections.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getAllSettings();
  const titleTemplate = s[SETTINGS.SEO_TITLE_TEMPLATE];
  const siteName = s[SETTINGS.SITE_NAME] || 'TSV Global Solutions Pvt Ltd';
  const metaDesc = s[SETTINGS.SEO_META_DESC] || 'TSV Global Solutions - 11+ years of NVOCC, Freight Forwarding, Project Cargo and Custom Clearance expertise across 140+ global routes.';
  const ogImage = s[SETTINGS.SEO_OG_IMAGE];
  return {
    title: titleTemplate
      ? { template: titleTemplate, default: siteName + ' | Excellence in Logistics' }
      : siteName + ' | Excellence in Logistics',
    description: metaDesc,
    openGraph: {
      siteName,
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
  };
}

export default async function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { gtmId, ga4Id } = await getAnalyticsConfig();
  const menuItems = await getMenuItems();
  const s = await getAllSettings();

  // Cookie banner settings
  const cookieSettings = {
    enabled: s[SETTINGS.COOKIE_ENABLED] !== 'false' && s[SETTINGS.COOKIE_ENABLED] !== false,
    heading: (s[SETTINGS.COOKIE_HEADING] as string) || 'Cookie Policy',
    message: (s[SETTINGS.COOKIE_MESSAGE] as string) || 'We use cookies to enhance your experience. By clicking "Accept", you agree to our use of cookies.',
    link: (s[SETTINGS.COOKIE_LINK] as string) || '/privacy-policy',
  };

  // Pulse button URLs from settings
  const whatsappUrl = (s[SETTINGS.SOCIAL_WHATSAPP] as string) || 'https://wa.me/919600132980';
  const callUrl = `tel:${(s[SETTINGS.CONTACT_PHONE] as string)?.replace(/\s/g,'') || '+919600132975'}`;

  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" type="image/x-icon" href="/assets/img/favicon.png" />
      </head>

      <body>
        <ClientInit />
        {/* ── PULSE BUTTONS: Dynamic from Settings → General ── */}
        {/* WhatsApp — green — bottom: 20px */}
        <a
          href={whatsappUrl}
          className="phone-call"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>

        {/* Phone Call — blue — bottom: 84px */}
        <a
          href={callUrl}
          className="phone-call-2"
          aria-label="Call Us"
        >
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
          </svg>
        </a>

        {/* Pulse button CSS — exact from original spec */}
        <style dangerouslySetInnerHTML={{ __html: `
          .phone-call, .phone-call-2 {
            width: 52px; height: 52px; left: 20px; position: fixed;
            border-radius: 50%; z-index: 9999; display: flex;
            align-items: center; justify-content: center; text-decoration: none;
            will-change: transform; transform: translateZ(0);
          }
          .phone-call { bottom: 20px; background: #10b418; }
          .phone-call-2 { bottom: 84px; background: #1f97f2; }
          .phone-call svg, .phone-call-2 svg { width: 28px; height: 28px; fill: #fff; position: relative; z-index: 2; }
          .phone-call-2 svg { width: 22px; height: 22px; }
          .phone-call::before, .phone-call-2::before,
          .phone-call::after, .phone-call-2::after {
            content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            border-radius: 50%; z-index: 1; opacity: 0;
          }
          .phone-call::before { background: #10b418; animation: tsv-pulse 2s infinite; }
          .phone-call::after  { background: #10b418; animation: tsv-pulse 2s infinite 0.6s; }
          .phone-call-2::before { background: #1f97f2; animation: tsv-pulse 2s infinite 0.3s; }
          .phone-call-2::after  { background: #1f97f2; animation: tsv-pulse 2s infinite 0.9s; }
          @keyframes tsv-pulse {
            0%   { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(2.2); opacity: 0; }
          }
          /* Footer whitespace fix */
          footer { margin-bottom: 0 !important; }
          .copyright-area { margin-bottom: 0 !important; }
          /* Body lock when mobile menu open */
          .tsv-body-lock { overflow: hidden !important; }
        ` }} />

        <BrochureDownloadModal />

        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        {ga4Id && <GoogleAnalytics ga4Id={ga4Id} />}
        <ClientInit />
        {cookieSettings.enabled && (
          <CookieConsent
            heading={cookieSettings.heading}
            message={cookieSettings.message}
            link={cookieSettings.link}
          />
        )}

        {/* Search box overlay (from original HTML) */}
        <div id="popup-search-box">
          <div className="box-inner-wrap d-flex align-items-center">
            <form id="frm-search" method="get" role="search">
              <input
                type="text"
                name="search"
                className="field-search rolling-input"
                placeholder="Search here..."
                autoComplete="off"
              />
            </form>
            <div className="search-close" id="searchbox-close">
              <i className="fa-regular fa-xmark"></i>
            </div>
          </div>
        </div>
        <div id="searchbox-overlay"></div>

        {/* Main layout: Navbar + Page Content + Footer */}
        <Navbar menuItems={menuItems} />
        {children}
        <Footer />
        <SpeedInsights />


        {/* ── JS: All vendor scripts in exact order from original HTML ── */}
        <Script src="/assets/js/vendor/jquary-3.6.0.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/vendor/modernizr-2.8.3-respond-1.4.2.min.js" strategy="beforeInteractive" />
        <Script src="/assets/js/vendor/bootstrap.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/popper.min.js" strategy="afterInteractive" />
        <Script src="/assets/lib/gsap/gsap.min.js" strategy="afterInteractive" />
        <Script src="/assets/lib/gsap/ScrollTrigger.min.js" strategy="afterInteractive" />
        <Script src="/assets/lib/gsap/split-type.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/lenis.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/odometer.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/jquery.nice-select.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/waypoints.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/venobox.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/swiper.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/vendor/wow.min.js" strategy="afterInteractive" />
        <Script src="/assets/js/quote-form.js" strategy="afterInteractive" />
        <Script src="/assets/js/main.js?v=2" strategy="afterInteractive" />
        <Script src="/assets/js/premium-features.js" strategy="afterInteractive" />
        <Script src="/assets/js/brochure-widget.js" strategy="afterInteractive" />
        
        {/* Global AnyChart Map Dependencies - High Priority */}
        <Script src="https://cdn.anychart.com/releases/v8/js/anychart-core.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.anychart.com/releases/v8/js/anychart-map.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.anychart.com/releases/v8/js/anychart-ui.min.js" strategy="afterInteractive" />
        <Script src="https://cdn.anychart.com/geodata/latest/custom/world/world.js" strategy="afterInteractive" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.3.15/proj4.js" strategy="afterInteractive" />
        <Script src="https://cdn.anychart.com/releases/v8/themes/dark_glamour.min.js" strategy="afterInteractive" />
        <Script src="/data/shipping-ports.js" strategy="afterInteractive" />

        {/* Init script — exact copy from original HTML */}
        <Script id="tsv-init" strategy="afterInteractive">{`
          document.addEventListener('DOMContentLoaded', function () {
            if (typeof bootstrap !== 'undefined') {
              var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
              tooltipTriggerList.map(function (el) { return new bootstrap.Tooltip(el); });
            }
            if (typeof $ !== 'undefined') {
              $('.odometer').each(function () {
                var count = $(this).data('count');
                $(this).html(count);
              });
            }
          });
          var yrEl = document.getElementById('currentYear');
          if (yrEl) yrEl.textContent = new Date().getFullYear();
        `}</Script>

        {/* Navbar JS — exact from original HTML inline script */}
        <Script id="tsv-navbar-init" strategy="afterInteractive">{`
          (function() {
            function initNavbar() {
              var btn = document.getElementById("tsvMenuBtn"),
                  ov  = document.getElementById("tsvOverlay"),
                  cl  = document.getElementById("tsvCloseBtn");
              if (btn) btn.addEventListener("click", function() {
                ov && ov.classList.add("open");
                document.body.classList.add("tsv-body-lock");
              });
              if (cl) cl.addEventListener("click", function() {
                ov && ov.classList.remove("open");
                document.body.classList.remove("tsv-body-lock");
              });
              if (ov) ov.addEventListener("click", function(e) {
                if (e.target === ov) {
                  ov.classList.remove("open");
                  document.body.classList.remove("tsv-body-lock");
                }
              });
              window.addEventListener("scroll", function() {
                var n = document.getElementById("tsvNavbar");
                if (n) n.style.boxShadow = window.scrollY > 10
                  ? "0 4px 20px rgba(26,26,46,0.18)"
                  : "0 2px 16px rgba(26,26,46,0.10)";
              });
            }
            // toggleMobMenu must be on window for onclick= attributes
            window.toggleMobMenu = function(btn) {
              var sub = btn.nextElementSibling;
              if (!sub) return;
              sub.classList.toggle("open");
              var ic = btn.querySelector("i.fa-chevron-down, i.fa-chevron-up");
              if (ic) ic.className = sub.classList.contains("open")
                ? "fa-regular fa-chevron-up"
                : "fa-regular fa-chevron-down";
            };
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', initNavbar);
            } else {
              initNavbar();
            }
          })();
        `}</Script>
      </body>
    </html>
  );
}
