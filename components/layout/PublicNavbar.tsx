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
    <header className="sticky top-0 z-10 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20">
      <div className="flex items-center justify-between px-6 md:px-12 h-16">
        {/* Left: Logo + desktop nav */}
        <div className="flex items-center gap-8">
          <Link
            href={`${prefix}/`}
            className="font-display font-black text-xl text-primary tracking-tight"
          >
            jobleo
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href={`${prefix}/#features`}
              className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t("features")}
            </Link>
            <Link
              href={`${prefix}/pricing`}
              className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t("pricing")}
            </Link>
            <Link
              href={`${prefix}/#how-it-works`}
              className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              {t("howItWorks")}
            </Link>
          </nav>
        </div>

        {/* Right: Lang toggle + auth buttons */}
        <div className="flex items-center gap-3">
          <LangToggle />
          <Link
            href={`${prefix}/login`}
            className="hidden md:inline-flex px-4 py-2 text-sm font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
          >
            {t("login")}
          </Link>
          <Link
            href={`${prefix}/login`}
            className="hidden md:inline-flex px-4 py-2 text-sm font-bold text-on-primary bg-primary rounded-xl hover:bg-primary/90 transition-colors"
          >
            {t("getStarted")}
          </Link>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-surface-container-low transition-colors text-on-surface-variant"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span className="material-symbols-outlined text-[22px]">
              {menuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav className="md:hidden flex flex-col px-6 pb-6 pt-2 gap-3 bg-surface-container-lowest border-t border-outline-variant/20">
          <Link
            href={`${prefix}/#features`}
            onClick={() => setMenuOpen(false)}
            className="text-sm font-semibold text-on-surface-variant hover:text-on-surface py-2 transition-colors"
          >
            {t("features")}
          </Link>
          <Link
            href={`${prefix}/pricing`}
            onClick={() => setMenuOpen(false)}
            className="text-sm font-semibold text-on-surface-variant hover:text-on-surface py-2 transition-colors"
          >
            {t("pricing")}
          </Link>
          <Link
            href={`${prefix}/#how-it-works`}
            onClick={() => setMenuOpen(false)}
            className="text-sm font-semibold text-on-surface-variant hover:text-on-surface py-2 transition-colors"
          >
            {t("howItWorks")}
          </Link>
          <div className="flex flex-col gap-2 pt-3 border-t border-outline-variant/20">
            <Link
              href={`${prefix}/login`}
              onClick={() => setMenuOpen(false)}
              className="w-full py-2.5 text-sm font-bold text-on-surface border border-outline-variant rounded-xl text-center hover:bg-surface-container-low transition-colors"
            >
              {t("login")}
            </Link>
            <Link
              href={`${prefix}/login`}
              onClick={() => setMenuOpen(false)}
              className="w-full py-2.5 text-sm font-bold text-on-primary bg-primary rounded-xl text-center hover:bg-primary/90 transition-colors"
            >
              {t("getStarted")}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
