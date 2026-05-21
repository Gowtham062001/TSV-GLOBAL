"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Loader2, Database, Upload, Download, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/shared/Toast";
interface SettingsClientProps {
  initialSettings: Record<string, any>;
  initialGlobalSeo: any;
}
export default function SettingsClient({ initialSettings, initialGlobalSeo }: SettingsClientProps) {
  const { success, error: toastError } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [globalSeo, setGlobalSeo] = useState(initialGlobalSeo || {});
  const [isSaving, setIsSaving] = useState(false);

  const [backupStatus, setBackupStatus] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreConfirmed, setRestoreConfirmed] = useState(false);

  const fetchBackupStatus = async () => {
    try {
      const res = await fetch('/api/admin/backup/status');
      if (res.ok) {
        setBackupStatus(await res.json());
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBackupStatus();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  const handleSeoChange = (key: string, value: any) => {
    setGlobalSeo((prev: any) => ({ ...prev, [key]: value }));
  };
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings, globalSeo }),
      });
      if (response.ok) {
        success("Settings saved successfully!");
      } else {
        toastError("Failed to save settings.");
      }
    } catch (error) {
      console.error(error);
      toastError("An error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <div className="admin-shell space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-subtitle">Core configuration & system integrity</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
          <span>Save Settings</span>
        </button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="flex gap-2 mb-6 bg-transparent h-auto p-0 flex-wrap">
          {[
            { value: 'general', label: 'General' },
            { value: 'seo', label: 'SEO' },
            { value: 'integrations', label: 'Integrations' },
            { value: 'privacy', label: 'Privacy' },
            { value: 'social', label: 'Social' },
            { value: 'backups', label: 'Backup & Restore' }
          ].map(tab => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value} 
              className="px-4 py-2 text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:text-[#0f1523] data-[state=active]:border-[#f0f2f8] border border-transparent rounded-[8px] text-[#8a9ab5] data-[state=active]:shadow-sm transition-all"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="max-w-4xl">
          <TabsContent value="general" className="mt-0 outline-none">
            <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Brand Identity</label>
                  <input 
                    type="text" 
                    value={settings.siteName || ""}
                    onChange={(e) => handleSettingChange("siteName", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Contact Email</label>
                  <input 
                    type="email" 
                    value={settings.contactEmail || ""}
                    onChange={(e) => handleSettingChange("contactEmail", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Contact Phone (Primary)</label>
                  <input 
                    type="text" 
                    value={settings.contactPhone || ""}
                    onChange={(e) => handleSettingChange("contactPhone", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    placeholder="+91 88258 26176"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Contact Phone 2 (Secondary)</label>
                  <input 
                    type="text" 
                    value={settings.contactPhone2 || ""}
                    onChange={(e) => handleSettingChange("contactPhone2", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    placeholder="+91 96001 32975"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={settings.whatsappNumber || ""}
                    onChange={(e) => handleSettingChange("whatsappNumber", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    placeholder="919600132980 (digits only)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Address</label>
                  <textarea 
                    rows={2}
                    value={settings.address || ""}
                    onChange={(e) => handleSettingChange("address", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523] resize-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Brochure PDF URL</label>
                  <input 
                    type="text" 
                    value={settings.brochure_pdf_url || ""}
                    onChange={(e) => handleSettingChange("brochure_pdf_url", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    placeholder="/assets/brochure/tsv-brochure.pdf"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Google Maps Embed URL</label>
                  <input 
                    type="text" 
                    value={settings.googleMapUrl || ""}
                    onChange={(e) => handleSettingChange("googleMapUrl", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Copyright Text</label>
                  <input 
                    type="text" 
                    value={settings.copyrightText || ""}
                    onChange={(e) => handleSettingChange("copyrightText", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    placeholder="© 2024 TSV GLOBAL SOLUTIONS PVT LTD , All Rights Reserved."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="mt-0 outline-none">
            <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Title Template</label>
                <input 
                  type="text" 
                  placeholder="%s | TSV Global"
                  value={globalSeo.titleTemplate || ""}
                  onChange={(e) => handleSeoChange("titleTemplate", e.target.value)}
                  className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                />
                <p className="text-[11px] text-[#8a9ab5] pt-1">Note: %s is dynamically injected per page</p>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Universal Meta Description</label>
                <textarea 
                  rows={4}
                  value={globalSeo.defaultDescription || ""}
                  onChange={(e) => handleSeoChange("defaultDescription", e.target.value)}
                  className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523] resize-none"
                />
              </div>
              <div className="pt-6 border-t border-[#f0f2f8] space-y-2">
                <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Robots.txt Content</label>
                <textarea 
                  rows={6}
                  value={settings.robotsTxt || ""}
                  onChange={(e) => handleSettingChange("robotsTxt", e.target.value)}
                  className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] font-mono text-[#0f1523]"
                  placeholder={"User-agent: *\nDisallow: /admin\nDisallow: /api"}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="integrations" className="mt-0 outline-none">
            <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 space-y-6">
              <div>
                <h4 className="text-[13px] font-bold text-[#0f1523] mb-4">Analytics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">GA4 Measurement ID</label>
                    <input 
                      type="text" 
                      placeholder="G-XXXXXXXXXX"
                      value={settings.gaId || ""}
                      onChange={(e) => handleSettingChange("gaId", e.target.value)}
                      className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">GTM Container ID</label>
                    <input 
                      type="text" 
                      placeholder="GTM-XXXXXXX"
                      value={settings.gtmId || ""}
                      onChange={(e) => handleSettingChange("gtmId", e.target.value)}
                      className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-6 border-t border-[#f0f2f8]">
                <h4 className="text-[13px] font-bold text-[#0f1523] mb-4">Email / SMTP</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">SMTP Host</label>
                    <input 
                      type="text" 
                      placeholder="smtp.gmail.com"
                      value={settings.smtpHost || ""}
                      onChange={(e) => handleSettingChange("smtpHost", e.target.value)}
                      className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">SMTP Port</label>
                    <input 
                      type="text" 
                      placeholder="587"
                      value={settings.smtpPort || ""}
                      onChange={(e) => handleSettingChange("smtpPort", e.target.value)}
                      className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">SMTP Email / Username</label>
                    <input 
                      type="text" 
                      placeholder="noreply@tsvglobal.com"
                      value={settings.smtpUser || ""}
                      onChange={(e) => handleSettingChange("smtpUser", e.target.value)}
                      className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">SMTP Password</label>
                    <input 
                      type="password"
                      value={settings.smtpPass || ""}
                      onChange={(e) => handleSettingChange("smtpPass", e.target.value)}
                      className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Lead Notification Email</label>
                    <input 
                      type="email"
                      placeholder="admin@tsvglobal.com"
                      value={settings.notifyEmail || ""}
                      onChange={(e) => handleSettingChange("notifyEmail", e.target.value)}
                      className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    />
                    <p className="text-[11px] text-[#8a9ab5]">New contact leads will be emailed to this address</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="privacy" className="mt-0 outline-none">
            <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 space-y-6">
              <div className="flex items-center justify-between pb-6 border-b border-[#f0f2f8]">
                <div>
                  <h4 className="text-[13px] font-bold text-[#0f1523]">Cookie Consent Banner</h4>
                  <p className="text-[11px] text-[#8a9ab5] mt-1">Manage cookie policy visibility</p>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={settings.cookieConsentEnabled || false} 
                    onChange={(e) => handleSettingChange("cookieConsentEnabled", e.target.checked)}
                    className="w-4 h-4 rounded border-[#f0f2f8]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Banner Headline</label>
                  <input 
                    type="text" 
                    value={settings.cookieConsentHeading || ""}
                    onChange={(e) => handleSettingChange("cookieConsentHeading", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Consent Narrative</label>
                  <textarea 
                    rows={3}
                    value={settings.cookieConsentMessage || ""}
                    onChange={(e) => handleSettingChange("cookieConsentMessage", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523] resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">Privacy Policy Link</label>
                  <input 
                    type="text" 
                    value={settings.cookieConsentLink || ""}
                    onChange={(e) => handleSettingChange("cookieConsentLink", e.target.value)}
                    className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                    placeholder="/privacy-policy"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="social" className="mt-0 outline-none">
            <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'linkedin', label: 'LinkedIn' },
                  { key: 'facebook', label: 'Facebook' },
                  { key: 'twitter', label: 'Twitter / X' },
                  { key: 'instagram', label: 'Instagram' },
                  { key: 'youtube', label: 'YouTube' },
                  { key: 'whatsapp', label: 'WhatsApp' }
                ].map(social => (
                  <div key={social.key} className="space-y-2">
                    <label className="text-[11px] font-bold text-[#8a9ab5] uppercase tracking-wider">{social.label}</label>
                    <input 
                      type="text" 
                      value={settings[social.key] || ""}
                      onChange={(e) => handleSettingChange(social.key, e.target.value)}
                      className="w-full px-4 py-2 border border-[#f0f2f8] rounded-lg outline-none focus:border-[#0f1523] text-[13px] text-[#0f1523]"
                      placeholder="https://..."
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="backups" className="mt-0 outline-none">
            <div className="space-y-6">
              {/* SECTION A - DB Overview */}
              <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6">
                <h3 className="text-[15px] font-bold text-[#0f1523] flex items-center gap-2 mb-4">
                  <Database size={18} className="text-[#8a9ab5]" />
                  Database Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {[
                    { label: "Pages", count: backupStatus?.counts?.pages },
                    { label: "Services", count: backupStatus?.counts?.services },
                    { label: "Blog", count: backupStatus?.counts?.blogPosts },
                    { label: "Case Studies", count: backupStatus?.counts?.caseStudies },
                    { label: "Gallery", count: backupStatus?.counts?.galleryImages },
                    { label: "Menu Items", count: backupStatus?.counts?.menuItems },
                    { label: "Contacts", count: backupStatus?.counts?.contactSubmissions },
                    { label: "Downloads", count: backupStatus?.counts?.brochureDownloads },
                  ].map((item, i) => (
                    <div key={i} className="bg-[#f8f9fb] border border-[#f0f2f8] rounded-lg p-3 flex justify-between items-center">
                      <span className="text-[11px] text-[#8a9ab5] font-bold uppercase tracking-wider">{item.label}</span>
                      <span className="text-[13px] font-semibold text-[#0f1523]">{item.count ?? "-"}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-6 text-[11px] text-[#8a9ab5] border-t border-[#f0f2f8] pt-4">
                  <div>Last backup: <span className="font-semibold text-[#0f1523]">{backupStatus?.lastBackup ? new Date(backupStatus.lastBackup.createdAt).toLocaleDateString() : "Never"}</span></div>
                  <div>Last restore: <span className="font-semibold text-[#0f1523]">{backupStatus?.lastRestore ? new Date(backupStatus.lastRestore.createdAt).toLocaleDateString() : "Never"}</span></div>
                </div>
              </div>

              {/* SECTION B - Export Backup */}
              <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-[15px] font-bold text-[#0f1523] flex items-center gap-2 mb-2">
                      <Download size={18} className="text-[#8a9ab5]" />
                      Export Backup
                    </h3>
                    <p className="text-[13px] text-[#8a9ab5] mb-4">Download a complete snapshot of all your content and settings as a JSON file.</p>
                    <ul className="text-[13px] space-y-2 text-[#0f1523] mb-6">
                      <li className="flex items-center gap-2">✓ Pages & sections content</li>
                      <li className="flex items-center gap-2">✓ Services & service sections</li>
                      <li className="flex items-center gap-2">✓ Blog posts & case studies</li>
                      <li className="flex items-center gap-2">✓ Gallery images metadata</li>
                      <li className="flex items-center gap-2">✓ Menu structure</li>
                      <li className="flex items-center gap-2">✓ Contact & brochure leads</li>
                      <li className="flex items-center gap-2">✓ Site settings & SEO config</li>
                      <li className="flex items-center gap-2 text-[#8a9ab5]">✗ Admin passwords (excluded for security)</li>
                      <li className="flex items-center gap-2 text-[#8a9ab5]">✗ API keys (excluded for security)</li>
                    </ul>
                    <button 
                      disabled={isExporting}
                      onClick={() => {
                        setIsExporting(true);
                        window.location.href = '/api/admin/backup';
                        setTimeout(() => setIsExporting(false), 2000);
                      }}
                      className="px-6 py-2.5 bg-[#dc2626] text-white rounded-lg text-[13px] font-medium hover:bg-[#b91c1c] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                      {isExporting ? "Preparing download..." : "Download Backup"}
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION C - Restore Backup */}
              <div className="bg-white rounded-[10px] border border-[#f0f2f8] p-6">
                <h3 className="text-[15px] font-bold text-[#0f1523] flex items-center gap-2 mb-2">
                  <Upload size={18} className="text-[#8a9ab5]" />
                  Restore from Backup
                </h3>
                <p className="text-[13px] text-[#8a9ab5] mb-6">Upload a TSV backup JSON file to restore your content. Existing data will be merged.</p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 mb-6">
                  <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[13px] text-amber-800 font-medium">
                    ⚠️ This will overwrite existing content with the backup data. This action cannot be undone.
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={restoreConfirmed}
                      onChange={(e) => setRestoreConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#0f1523] focus:ring-[#0f1523]"
                    />
                    <span className="text-[13px] text-[#0f1523] font-medium">I understand this will overwrite existing data</span>
                  </label>

                  <div className="border-2 border-dashed border-[#f0f2f8] rounded-xl p-6 text-center hover:bg-slate-50 transition-colors">
                    <input 
                      type="file" 
                      id="backup-file" 
                      accept=".json" 
                      className="hidden" 
                      onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                    />
                    <label htmlFor="backup-file" className="cursor-pointer flex flex-col items-center gap-2">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-2">
                        <Upload size={20} />
                      </div>
                      <span className="text-[13px] font-semibold text-[#0f1523]">
                        {restoreFile ? restoreFile.name : "Click to upload JSON backup"}
                      </span>
                      <span className="text-[11px] text-[#8a9ab5]">
                        {restoreFile ? `${(restoreFile.size / 1024).toFixed(1)} KB` : "Max file size: 10MB"}
                      </span>
                    </label>
                  </div>

                  <button 
                    disabled={!restoreFile || !restoreConfirmed || isRestoring}
                    onClick={() => {
                      if (!restoreFile || !restoreConfirmed) return;
                      setIsRestoring(true);
                      const reader = new FileReader();
                      reader.onload = async (e) => {
                        try {
                          const json = JSON.parse(e.target?.result as string);
                          const res = await fetch('/api/admin/backup/restore', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(json)
                          });
                          const result = await res.json();
                          if (res.ok) {
                            success(`Restored ${result.totalRecords} records successfully`);
                            setRestoreFile(null);
                            setRestoreConfirmed(false);
                            fetchBackupStatus();
                          } else {
                            toastError(result.error || "Restore Failed.");
                          }
                        } catch (err) {
                          toastError("Invalid JSON file");
                        } finally {
                          setIsRestoring(false);
                        }
                      };
                      reader.readAsText(restoreFile);
                    }}
                    className="w-full px-6 py-2.5 bg-[#0f1523] text-white rounded-lg text-[13px] font-medium hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isRestoring ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {isRestoring ? "Restoring..." : "Restore Database"}
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
