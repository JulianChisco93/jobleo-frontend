"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { LangToggle } from "@/components/ui/LangToggle";

export function PublicNavbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <header
      className="flex items-center justify-between px-12 h-16 bg-bg-card"
      style={{ borderBottom: "2px solid #000000" }}
    >
      {/* Left: Logo + nav links */}
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

      {/* Right: Lang toggle + Login + Get Started */}
      <div className="flex items-center gap-4">
        <LangToggle variant="light" />
        <Link
          href={`${prefix}/login`}
          className="px-6 py-2.5 text-sm font-bold font-heading text-text-primary border-2 border-border-color hover:bg-text-primary hover:text-text-on-dark transition-colors"
        >
          {t("login")}
        </Link>
        <Link
          href={`${prefix}/login`}
          className="hidden md:inline-flex px-6 py-2.5 text-sm font-bold font-heading text-text-on-dark bg-accent-red border-2 border-border-color hover:opacity-90 transition-opacity"
        >
          {t("getStarted")}
        </Link>
      </div>
    </header>
  );
}
