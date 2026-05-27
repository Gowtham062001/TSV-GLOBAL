export const dynamic = "force-dynamic";

import React from "react";
import { getAllSettings, SETTINGS } from "@/lib/settings";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const s = await getAllSettings();
  const ga4Id = (s[SETTINGS.GA4_ID] as string) || null;
  const gtmId = (s[SETTINGS.GTM_ID] as string) || null;

  return <AnalyticsClient ga4Id={ga4Id} gtmId={gtmId} />;
}
