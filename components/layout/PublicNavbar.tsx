"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LangToggle } from "@/components/ui/LangToggle";
import { useState } from "react";

export function PublicNavbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header
      className="relative bg-bg-card"
      style={{ borderBottom: "2px solid #000000" }}
    >
      <div className="flex items-center justify-between px-6 md:px-12 h-16">
        {/* Left: Logo + desktop nav links */}
        <div className="flex items-center gap-8">
          <Link
            href={`${prefix}/`}
            className="text-2xl font-bold tracking-widest font-heading text-text-primary"
          >
            JOBLEO
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={`${prefix}/#features`}
              className="text-sm font-semibold font-heading text-text-secondary hover:text-text-primary transition-colors"
            >
              {t("features")}
            </Link>
            <Link
              href={`${prefix}/pricing`}
              className="text-sm font-semibold font-heading text-text-secondary hover:text-text-primary transition-colors"
            >
              {t("pricing")}
            </Link>
            <Link
              href={`${prefix}/#how-it-works`}
              className="text-sm font-semibold font-heading text-text-secondary hover:text-text-primary transition-colors"
            >
              {t("howItWorks")}
            </Link>
          </nav>
        </div>

        {/* Right: Lang toggle + Login + Get Started (desktop) + Hamburger (mobile) */}
        <div className="flex items-center gap-4">
          <LangToggle variant="light" />
          <Link
            href={`${prefix}/login`}
            className="hidden md:inline-flex px-6 py-2.5 text-sm font-bold font-heading text-text-primary border-2 border-border-color hover:bg-text-primary hover:text-text-on-dark transition-colors"
          >
            {t("login")}
          </Link>
          <Link
            href={`${prefix}/login`}
            className="hidden md:inline-flex px-6 py-2.5 text-sm font-bold font-heading text-text-on-dark bg-accent-red border-2 border-border-color hover:opacity-90 transition-opacity"
          >
            {t("getStarted")}
          </Link>

          {/* Hamburger button — mobile only */}
          <button
            className="md:hidden flex flex-col justify-center items-center gap-1.5 w-8 h-8"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              /* X icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              /* Hamburger icon */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav
          className="md:hidden flex flex-col px-6 pb-6 pt-2 gap-4 bg-bg-card"
          style={{ borderTop: "2px solid #000000" }}
        >
          <Link
            href={`${prefix}/#features`}
            onClick={() => setMenuOpen(false)}
            className="text-sm font-semibold font-heading text-text-secondary hover:text-text-primary transition-colors py-1"
          >
            {t("features")}
          </Link>
          <Link
            href={`${prefix}/pricing`}
            onClick={() => setMenuOpen(false)}
            className="text-sm font-semibold font-heading text-text-secondary hover:text-text-primary transition-colors py-1"
          >
            {t("pricing")}
          </Link>
          <Link
            href={`${prefix}/#how-it-works`}
            onClick={() => setMenuOpen(false)}
            className="text-sm font-semibold font-heading text-text-secondary hover:text-text-primary transition-colors py-1"
          >
            {t("howItWorks")}
          </Link>
          <div className="flex flex-col gap-3 pt-2" style={{ borderTop: "1px solid #e0e0e0" }}>
            <Link
              href={`${prefix}/login`}
              onClick={() => setMenuOpen(false)}
              className="w-full py-2.5 text-sm font-bold font-heading text-text-primary border-2 border-border-color hover:bg-text-primary hover:text-text-on-dark transition-colors text-center"
            >
              {t("login")}
            </Link>
            <Link
              href={`${prefix}/login`}
              onClick={() => setMenuOpen(false)}
              className="w-full py-2.5 text-sm font-bold font-heading text-text-on-dark bg-accent-red border-2 border-border-color hover:opacity-90 transition-opacity text-center"
            >
              {t("getStarted")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
