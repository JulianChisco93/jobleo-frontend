import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("pricingTitle") };
}

function CheckIcon() {
  return (
    <span className="material-symbols-outlined text-[18px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
      check_circle
    </span>
  );
}

function PricingContent() {
  const t = useTranslations("pricing");

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <PublicNavbar />

      {/* Header */}
      <section className="flex flex-col items-center gap-3 px-8 py-16">
        <span className="text-xs font-bold tracking-widest text-secondary uppercase">
          {t("tag")}
        </span>
        <h1 className="text-4xl font-display font-bold text-on-surface text-center">
          {t("title")}
        </h1>
        <p className="text-base text-on-surface-variant text-center max-w-lg">
          {t("subtitle")}
        </p>
      </section>

      {/* Plan Cards */}
      <section className="flex flex-col md:flex-row gap-6 px-8 pb-20 justify-center max-w-4xl mx-auto w-full">
        {/* Starter */}
        <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-xl shadow-[var(--shadow-card)] flex-1">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-widest px-3 py-1 self-start bg-surface-container-high text-on-surface-variant rounded-full uppercase">
              {t("starterBadge")}
            </span>
            <h2 className="text-2xl font-display font-bold text-on-surface mt-2">
              {t("starterName")}
            </h2>
            <p className="text-3xl font-display font-bold text-on-surface">
              {t("starterPrice")}
            </p>
            <p className="text-sm text-on-surface-variant">{t("starterTagline")}</p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              t("starterFeature1"),
              t("starterFeature2"),
              t("starterFeature3"),
              t("starterFeature4"),
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckIcon />
                <span className="text-sm text-on-surface-variant">{feature}</span>
              </div>
            ))}
          </div>

          <button
            disabled
            title={t("starterComingSoonTooltip")}
            className="mt-auto w-full py-3 text-sm font-bold text-on-surface-variant border border-outline-variant rounded-xl cursor-not-allowed opacity-60"
          >
            {t("starterCta")}
          </button>
        </div>

        {/* Pro */}
        <div className="flex flex-col gap-6 p-8 bg-primary rounded-xl shadow-[var(--shadow-card)] flex-1">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-widest px-3 py-1 self-start bg-on-primary/10 text-primary-fixed rounded-full uppercase">
              {t("proBadge")}
            </span>
            <h2 className="text-2xl font-display font-bold text-on-primary mt-2">
              {t("proName")}
            </h2>
            <p className="text-3xl font-display font-bold text-on-primary">
              {t("proPrice")}
            </p>
            <p className="text-sm text-on-primary/80">{t("proTagline")}</p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              t("proFeature1"),
              t("proFeature2"),
              t("proFeature3"),
              t("proFeature4"),
              t("proFeature5"),
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                <span className="text-sm text-on-primary">{feature}</span>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="mt-auto w-full py-3 text-sm font-bold text-primary bg-surface-container-lowest rounded-xl text-center hover:bg-surface-container-low transition-colors"
          >
            {t("proCta")}
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PricingContent />;
}
