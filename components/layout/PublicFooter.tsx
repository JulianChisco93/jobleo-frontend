"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export function PublicFooter() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <footer
      className="flex justify-between items-start p-12 bg-text-primary text-text-on-dark"
    >
      {/* Brand */}
      <div className="flex flex-col gap-2">
        <span className="text-xl font-bold tracking-widest font-heading">JOBLEO</span>
        <span className="text-sm font-heading text-text-secondary">{t("tagline")}</span>
      </div>

      {/* Links */}
      <div className="flex gap-16">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-text-muted">
            {t("product")}
          </span>
          <Link href={`${prefix}/#features`} className="text-sm font-heading text-text-secondary hover:text-white transition-colors">
            {t("features")}
          </Link>
          <Link href={`${prefix}/pricing`} className="text-sm font-heading text-text-secondary hover:text-white transition-colors">
            {t("pricingLink")}
          </Link>
          <Link href={`${prefix}/login`} className="text-sm font-heading text-text-secondary hover:text-white transition-colors">
            {t("loginLink")}
          </Link>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-xs font-bold uppercase tracking-wider font-mono text-text-muted">
            {t("legal")}
          </span>
          <Link href="#" className="text-sm font-heading text-text-secondary hover:text-white transition-colors">
            {t("termsOfService")}
          </Link>
          <Link href="#" className="text-sm font-heading text-text-secondary hover:text-white transition-colors">
            {t("privacyPolicy")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
