export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import React from "react";
import SettingsClient from "./SettingsClient";
export default async function AdminSettingsPage() {
  const settingsList = await prisma.siteSetting.findMany();
  
  // Transform list to object for easier client-side handling
  const settingsMap: Record<string, any> = {};
  settingsList.forEach(s => {
    settingsMap[s.key] = s.value;
  });

  const globalSeo = {
    titleTemplate: settingsMap["seo_title_template"] || "",
    defaultDescription: settingsMap["seo_meta_description"] || "",
  };

  return (
    <SettingsClient 
      initialSettings={settingsMap} 
      initialGlobalSeo={globalSeo} 
    />
  );
}
