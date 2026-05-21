/*
 * PAGE: 404-error.html → app/(public)/not-found.tsx
 * ══════════════════════════════════════════════════════════
 * Section 01 | Error 404 Section  → error_404
 * ══════════════════════════════════════════════════════════
 * HTML SECTIONS : 1  |  OUTPUT SECTIONS: 1  ✅ MATCH
 */
import { Error404 } from "@/components/public/sections/Error404";

export default function NotFound() {
  return (
    <Error404
      heading="Page Not Found"
      subHeading="Oops! Looks like you're lost at sea"
      description="The page you're looking for doesn't exist or may have been moved. Let our team navigate you back on course."
      btnText="Return to Home Port"
      btnUrl="/"
    />
  );
}
