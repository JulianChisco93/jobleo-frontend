"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export function PublicFooter() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <footer className="bg-surface-container-low border-t border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-12 py-12 flex flex-col md:flex-row justify-between gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-2">
          <span className="font-display font-black text-xl text-primary tracking-tight">jobleo</span>
          <span className="text-sm text-on-surface-variant">{t("tagline")}</span>
          <span className="text-xs text-on-surface-variant mt-1">Operated by Julian David Chisco Henao</span>
        </div>

        {/* Links */}
        <div className="flex gap-16">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {t("product")}
            </span>
            <Link href={`${prefix}/#features`} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              {t("features")}
            </Link>
            <Link href={`${prefix}/pricing`} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              {t("pricingLink")}
            </Link>
            <Link href={`${prefix}/about`} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              About
            </Link>
            <Link href={`${prefix}/login`} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              {t("loginLink")}
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {t("legal")}
            </span>
            <Link href={`${prefix}/terms`} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              {t("termsOfService")}
            </Link>
            <Link href={`${prefix}/privacy`} className="text-sm text-on-surface-variant hover:text-on-surface transition-colors">
              {t("privacyPolicy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
