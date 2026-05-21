import { prisma } from '@/lib/db';
import { cache } from 'react';

/**
 * Canonical setting keys used across the app.
 * Changing a key here changes it everywhere.
 */
export const SETTINGS = {
  // General
  SITE_NAME:           'siteName',
  CONTACT_EMAIL:       'contactEmail',
  CONTACT_PHONE:       'contactPhone',
  CONTACT_PHONE_2:     'contactPhone2',
  WHATSAPP_NUMBER:     'whatsappNumber',
  ADDRESS:             'address',
  BROCHURE_PDF_URL:    'brochure_pdf_url',
  GOOGLE_MAP_URL:      'googleMapUrl',
  COPYRIGHT_TEXT:      'copyrightText',

  // SEO
  SEO_TITLE_TEMPLATE:  'seoTitleTemplate',
  SEO_META_DESC:       'seoMetaDescription',
  SEO_OG_IMAGE:        'seoOgImage',
  ROBOTS_TXT:          'robotsTxt',

  // Integrations / Analytics
  GA4_ID:              'gaId',
  GTM_ID:              'gtmId',

  // SMTP
  SMTP_HOST:           'smtpHost',
  SMTP_PORT:           'smtpPort',
  SMTP_USER:           'smtpUser',
  SMTP_PASS:           'smtpPass',
  NOTIFY_EMAIL:        'notifyEmail',

  // Privacy / Cookie banner
  COOKIE_ENABLED:      'cookieConsentEnabled',
  COOKIE_HEADING:      'cookieConsentHeading',
  COOKIE_MESSAGE:      'cookieConsentMessage',
  COOKIE_LINK:         'cookieConsentLink',

  // Social
  SOCIAL_LINKEDIN:     'linkedin',
  SOCIAL_FACEBOOK:     'facebook',
  SOCIAL_TWITTER:      'twitter',
  SOCIAL_INSTAGRAM:    'instagram',
  SOCIAL_YOUTUBE:      'youtube',
  SOCIAL_WHATSAPP:     'whatsapp',
} as const;

/**
 * Fetches ALL site settings and returns them as a key→value object.
 * Cached per-request by React's cache() — safe to call from any Server Component.
 */
export const getAllSettings = cache(async (): Promise<Record<string, any>> => {
  try {
    const rows = await prisma.siteSetting.findMany();
    return rows.reduce((acc: Record<string, any>, row: any) => {
      let val = row.value;
      if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
        try {
          val = JSON.parse(val);
        } catch {
          val = val.slice(1, -1);
        }
      }
      acc[row.key] = val;
      return acc;
    }, {} as Record<string, any>);
  } catch {
    return {};
  }
});

/**
 * Gets a single setting value with a fallback.
 */
export async function getSetting(key: string, fallback = ''): Promise<string> {
  const all = await getAllSettings();
  const val = all[key];
  if (val === null || val === undefined) return fallback;
  return String(val);
}
