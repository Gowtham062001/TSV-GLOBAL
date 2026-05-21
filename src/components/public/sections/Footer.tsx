import React from "react";
import Link from "next/link";
import { getAllSettings, SETTINGS } from "@/lib/settings";
import { getMenuItems } from "@/lib/menu";

export const Footer = async () => {
  const currentYear = new Date().getFullYear();
  const s = await getAllSettings();
  const menuItems = await getMenuItems();

  // Contact info — falls back to original hardcoded values
  const phone    = s[SETTINGS.CONTACT_PHONE]   || '+91 88258 26176';
  const email    = s[SETTINGS.CONTACT_EMAIL]   || 'cs@tsvglobal.com';
  const copyright = s[SETTINGS.COPYRIGHT_TEXT] || `© ${currentYear} TSV GLOBAL SOLUTIONS PVT LTD , All Rights Reserved.`;

  const formatUrl = (url?: string) => {
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return url;
  };

  // Social links — falls back to originals
  const facebook  = formatUrl(s[SETTINGS.SOCIAL_FACEBOOK]  || 'https://www.facebook.com/tsvglobalsolutions/');
  const instagram = formatUrl(s[SETTINGS.SOCIAL_INSTAGRAM] || 'https://www.instagram.com/tsv_global_solutions/?hl=en');
  const linkedin  = formatUrl(s[SETTINGS.SOCIAL_LINKEDIN]  || 'https://www.linkedin.com/company/tsv-global-solutions-pvt-ltd/');
  const whatsapp  = formatUrl(s[SETTINGS.SOCIAL_WHATSAPP]  || 'https://wa.me/919600132980?text=Hi');
  const twitter   = formatUrl(s[SETTINGS.SOCIAL_TWITTER]);
  const youtube   = formatUrl(s[SETTINGS.SOCIAL_YOUTUBE]);

  return (
    <footer className="footer-section">
        <div className="map-pattern"></div>
        <div className="footer-wrapper">
            <div className="container">
                <div className="row gy-lg-0 gy-4">
                    <div className="col-lg-3 col-md-6">
                        <div className="footer-widget">
                            <Link href="/" className="footer-logo"><img src="/img/logo.png" alt="logo" /></Link>
                            <div className="mt-4">
                                <ul className="footer-contact-info">
                                    <li>
                                        <p><a href={`tel:${phone.replace(/\s/g,'')}`}><span>Phone:</span>{phone}</a></p>
                                    </li>
                                    <li>
                                        <p><a href={`mailto:${email}`}><span>Mail Us:</span>{email}</a></p>
                                    </li>
                                </ul>
                                <ul className="social-share mt-4">
                                    <li><a href={facebook} target="_blank" rel="noopener noreferrer"><img src="/img/icons/facebook.png" alt="Facebook" style={{width: "32px", height: "32px"}} /></a></li>
                                    <li><a href={instagram} target="_blank" rel="noopener noreferrer"><img src="/img/icons/instagram.png" alt="Instagram" style={{width: "32px", height: "32px"}} /></a></li>
                                    <li><a href={linkedin} target="_blank" rel="noopener noreferrer"><img src="/img/icons/linkedin.png" alt="LinkedIn" style={{width: "32px", height: "32px"}} /></a></li>
                                    <li><a href={whatsapp} target="_blank" rel="noopener noreferrer"><img src="/img/icons/whatsapp.png" alt="WhatsApp" style={{width: "32px", height: "32px"}} /></a></li>
                                    {twitter && <li><a href={twitter} target="_blank" rel="noopener noreferrer"><img src="/img/icons/twitter.png" alt="Twitter" style={{width: "32px", height: "32px"}} /></a></li>}
                                    {youtube && <li><a href={youtube} target="_blank" rel="noopener noreferrer"><img src="/img/icons/youtube.png" alt="YouTube" style={{width: "32px", height: "32px"}} /></a></li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="footer-widget widget-links">
                            <div className="widget-title">
                                <h3>Company</h3>
                            </div>
                            <ul className="footer-links">
                                {menuItems.map((item) => (
                                    <li key={item.id}>
                                        <Link href={item.url}>{item.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="footer-widget">
                            <div className="widget-title">
                                <h3>Get In Touch</h3>
                            </div>
                            <ul className="footer-contact-info">
                                <li>
                                    <p><span>Corporate Office : </span> No. 101, Ground floor, NSIC STBP Industrial
                                        Estate, Hindustan Teleprinters Staff Quarters, SIDCO Industrial Estate,
                                        Ekkatuthangal, Chennai, Tamil Nadu 600032,INDIA</p>
                                    <p className="mt-3"><span>Branch Office : </span> Foundation Tower, Office #57, Ground Floor,
                                        Sector-11, (Opposite PNB Bank), CBD Belapur, Navi Mumbai - 400614, INDIA</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6">
                        <div className="footer-widget">
                            <div className="widget-title">
                                <h3>Useful Links</h3>
                            </div>
                            <ul className="footer-links">
                                <li><Link href="/terms-and-conditions">Terms &amp; Conditions</Link></li>
                                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                                <li><Link href="/return-refund-policy">Return &amp; Refund Policy</Link></li>
                                <li><Link href="/contact">Contact</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="running-truck">
                <div className="truck"></div>
                <div className="truck-2"></div>
                <div className="truck-3"></div>
            </div>
        </div>
        <div className="copyright-area">
            {copyright}
        </div>
    </footer>
  );
};
