"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MenuItemWithChildren } from "@/lib/menu";

interface NavbarProps {
  menuItems: MenuItemWithChildren[];
}

export const Navbar: React.FC<NavbarProps> = ({ menuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsSticky(offset > 100);
      
      const n = document.getElementById("tsvNavbar");
      if (n) {
        n.style.boxShadow = offset > 10 ? "0 4px 20px rgba(44, 54, 143, 0.18)" : "0 2px 16px rgba(44, 54, 143, 0.10)";
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      document.body.classList.add("tsv-body-lock");
    } else {
      document.body.classList.remove("tsv-body-lock");
    }
  };

  const toggleMobMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    const btn = e.currentTarget;
    const sub = btn.nextElementSibling as HTMLElement;
    if (!sub) return;
    sub.classList.toggle("open");
    const ic = btn.querySelector("i.fa-chevron-down, i.fa-chevron-up");
    if (ic) {
      ic.className = sub.classList.contains("open") ? "fa-regular fa-chevron-up" : "fa-regular fa-chevron-down";
    }
  };

  const renderDesktopMenu = (items: MenuItemWithChildren[]) => {
    return items.map((item) => (
      <li key={item.id} className={item.children.length > 0 ? "has-dropdown" : ""}>
        <Link href={item.url}>
          {item.icon && <i className={`${item.icon} me-2`}></i>}
          {item.label}
          {item.children.length > 0 && <i className="fa-regular fa-chevron-down nav-arrow ms-1"></i>}
        </Link>
        {item.children.length > 0 && (
          <ul className="tsv-dropdown">
            {item.children.map((child) => (
              <li key={child.id} className={child.children.length > 0 ? "has-submenu" : ""}>
                <Link href={child.url}>
                  {child.icon && <i className={`${child.icon} me-2`}></i>}
                  {child.label}
                  {child.children.length > 0 && <i className="fa-regular fa-chevron-right nav-arrow ms-1"></i>}
                </Link>
                {child.children.length > 0 && (
                  <ul className="tsv-submenu">
                    {child.children.map((subChild) => (
                      <li key={subChild.id}>
                        <Link href={subChild.url}>
                          {subChild.icon && <i className={`${subChild.icon} me-2`}></i>}
                          {subChild.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </li>
    ));
  };

  const renderMobileMenu = (items: MenuItemWithChildren[]) => {
    return items.map((item) => (
      <li key={item.id}>
        {item.children && item.children.length > 0 ? (
          <>
            <button className="tsv-mob-item-toggle" onClick={toggleMobMenu}>
              <span className="flex items-center gap-2">
                {item.icon && <i className={item.icon}></i>}
                {item.label}
              </span>
              <i className="fa-regular fa-chevron-down"></i>
            </button>
            <ul className="tsv-mob-sub">
              {item.children.map((child) => (
                <li key={child.id}>
                  {child.children && child.children.length > 0 ? (
                    <>
                      <button className="tsv-mob-item-toggle" style={{paddingLeft:"36px", fontSize:"13px"}} onClick={toggleMobMenu}>
                        <span className="flex items-center gap-2">
                          {child.icon && <i className={child.icon}></i>}
                          {child.label}
                        </span>
                        <i className="fa-regular fa-chevron-down"></i>
                      </button>
                      <ul className="tsv-mob-sub tsv-mob-sub2" style={{background: "rgba(0,0,0,0.03)"}}>
                        {child.children.map((subChild) => (
                          <li key={subChild.id}>
                            <Link href={subChild.url} onClick={toggleMobileMenu} style={{paddingLeft:"50px", fontSize:"13px"}}>
                              {subChild.icon && <i className={`${subChild.icon} me-2`}></i>}
                              {subChild.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link href={child.url} onClick={toggleMobileMenu} style={{paddingLeft:"36px", fontSize:"14px"}}>
                      {child.icon && <i className={`${child.icon} me-2`}></i>}
                      {child.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Link href={item.url} onClick={toggleMobileMenu}>
            {item.icon && <i className={`${item.icon} me-2`}></i>}
            {item.label}
          </Link>
        )}
      </li>
    ));
  };

  return (
    <>
      {isSticky && <div style={{ height: '90px' }} />}
      <nav className={`tsv-navbar ${isSticky ? 'fixed top-0 left-0 w-full z-[1000] shadow-md' : 'relative'}`} id="tsvNavbar">
        <div className="container">
          <div className="navbar-inner">
            <Link href="/" className="nav-logo">
              <img src="/img/logo.png" alt="TSV Global Solutions Logo" />
            </Link>
            <ul className="tsv-nav-links d-none d-lg-flex">
              {menuItems.map((item) => (
                <li key={item.id}>
                  {item.children && item.children.length > 0 ? (
                    <>
                      <Link href={item.url}>
                        {item.label} <i className="fa-solid fa-chevron-down nav-arrow"></i>
                      </Link>
                      <ul className="tsv-dropdown">
                        {item.children.map((child) => (
                          <li key={child.id} className={child.children && child.children.length > 0 ? "has-submenu" : ""}>
                            <Link href={child.url}>
                              {child.label}
                              {child.icon && (
                                <i
                                  className={child.icon}
                                  style={{ marginLeft: "8px", color: "#ED2224", width: "16px" }}
                                ></i>
                              )}
                              {child.children && child.children.length > 0 && (
                                <i className="fa-solid fa-chevron-right" style={{ fontSize: "10px", color: "#999" }}></i>
                              )}
                            </Link>
                            {child.children && child.children.length > 0 && (
                              <ul className="tsv-submenu">
                                {child.children.map((subChild) => (
                                  <li key={subChild.id}>
                                    <Link href={subChild.url}>
                                      {subChild.label}
                                      {subChild.icon && (
                                        <i
                                          className={subChild.icon}
                                          style={{ marginLeft: "8px", color: "#ED2224" }}
                                        ></i>
                                      )}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <Link href={item.url}>{item.label}</Link>
                  )}
                </li>
              ))}
            </ul>
            <div className="d-flex align-items-center gap-3">
              <button className="dl-search-icon tsv-search-btn d-none d-lg-inline-flex" aria-label="Search">
                <i className="fa-regular fa-magnifying-glass"></i>
              </button>
              <Link href="/contact" className="tsv-nav-cta d-none d-lg-inline-flex">
                <i className="fa-regular fa-paper-plane"></i> Get a Quote
              </Link>
              <button className="tsv-hamburger d-lg-none" id="tsvMenuBtn" aria-label="Open Menu" onClick={toggleMobileMenu}>
                <i className="fa-regular fa-bars"></i>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE DRAWER - Moved out of the nav tag for better fixed positioning */}
      <div className={`tsv-mobile-overlay ${isOpen ? 'open' : ''}`} id="tsvOverlay" onClick={(e) => { if (e.target === e.currentTarget) toggleMobileMenu() }}>
        <div className="tsv-mobile-drawer">
          <div className="tsv-mob-header">
            <img src="/img/logo.png" alt="TSV Global Logo" />
            <button className="tsv-mob-close" id="tsvCloseBtn" aria-label="Close Menu" onClick={toggleMobileMenu}>
              <i className="fa-regular fa-xmark"></i>
            </button>
          </div>
          <ul className="tsv-mob-nav">
            {menuItems.length > 0 ? (
              renderMobileMenu(menuItems)
            ) : (
              <li><Link href="/" onClick={toggleMobileMenu}>Home</Link></li>
            )}
          </ul>
          <div className="tsv-mob-footer">
            <a href="tel:+919600132975"><i className="fa-regular fa-phone"></i>+91 96001 32975</a>
            <a href="mailto:cs@tsvglobal.com"><i className="fa-regular fa-envelope"></i>cs@tsvglobal.com</a>
            <div className="tsv-mob-social">
              <a href="https://www.facebook.com/tsvglobalsolutions/" aria-label="Facebook"><img src="/img/icons/facebook.png" alt="Facebook" style={{width: "24px", height: "24px"}} /></a>
              <a href="https://www.instagram.com/tsv_global_solutions/" aria-label="Instagram"><img src="/img/icons/instagram.png" alt="Instagram" style={{width: "24px", height: "24px"}} /></a>
              <a href="https://www.linkedin.com/company/tsv-global-solutions-pvt-ltd/" aria-label="LinkedIn"><img src="/img/icons/linkedin.png" alt="LinkedIn" style={{width: "24px", height: "24px"}} /></a>
              <a href="https://wa.me/919600132980?text=Hi" aria-label="WhatsApp"><img src="/img/icons/whatsapp.png" alt="WhatsApp" style={{width: "24px", height: "24px"}} /></a>
            </div>
            <Link href="/contact" className="tsv-mob-cta" onClick={toggleMobileMenu}>Get a Free Quote<i className="fa-regular fa-paper-plane" style={{marginLeft:"8px"}}></i></Link>
          </div>
        </div>
      </div>
    </>
  );
};


