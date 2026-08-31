import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { HorizonLimits } from "@/components/billing/HorizonLimits";
import { HORIZON_OPTIONS, RECOMMENDED_HORIZON } from "@/lib/plans";
import PricingShader from "./PricingShader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("pricingTitle") };
}

function PricingContent() {
  const t = useTranslations("pricing");

  const includedFeatures = [
    t("included1"),
    t("included2"),
    t("included3"),
    t("included4"),
    t("included5"),
  ];

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#0a1628' }}>
      {/* Shader cubre toda la página */}
      <PricingShader speed={0.6} intensity={0.55} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <PublicNavbar variant="dark" />

        {/* Header */}
        <section className="flex flex-col items-center gap-3 px-8 py-16">
          <span className="text-xs font-bold tracking-widest text-secondary uppercase">
            {t("tag")}
          </span>
          <h1 className="text-4xl font-display font-bold text-white text-center">
            {t("title")}
          </h1>
          <p className="text-base text-white/70 text-center max-w-xl">
            {t("subtitle")}
          </p>
        </section>

        {/* Pass cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 px-8 max-w-6xl mx-auto w-full">
          {HORIZON_OPTIONS.map((option) => {
            const recommended = option.horizon === RECOMMENDED_HORIZON;
            return (
              <div
                key={option.horizon}
                className={`flex flex-col gap-5 p-6 rounded-xl border ${
                  recommended
                    ? "bg-primary border-primary shadow-[var(--shadow-card)]"
                    : "bg-white/10 backdrop-blur-md border-white/10"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-[10px] font-bold tracking-widest px-2.5 py-1 self-start rounded-full uppercase ${
                      recommended
                        ? "bg-on-primary/15 text-primary-fixed"
                        : "invisible"
                    }`}
                  >
                    {t("mostPopular")}
                  </span>
                  <h2
                    className={`text-lg font-display font-bold mt-1 ${
                      recommended ? "text-on-primary" : "text-white"
                    }`}
                  >
                    {t(`horizon${option.messageKey}Name`)}
                  </h2>
                  <p
                    className={`text-4xl font-display font-black ${
                      recommended ? "text-on-primary" : "text-white"
                    }`}
                  >
                    ${option.price}
                  </p>
                  <p
                    className={`text-xs font-semibold ${
                      recommended ? "text-on-primary/80" : "text-white/60"
                    }`}
                  >
                    {t("oneTimePayment")}
                  </p>
                </div>

                <HorizonLimits
                  horizon={option.horizon}
                  className={`text-sm leading-relaxed flex-1 ${
                    recommended ? "text-on-primary/90" : "text-white/70"
                  }`}
                />

                <CheckoutButton
                  horizon={option.horizon}
                  label={t("passCta")}
                  className={`w-full py-3 text-sm font-bold rounded-xl transition-colors disabled:opacity-60 ${
                    recommended
                      ? "text-primary bg-surface-container-lowest hover:bg-surface-container-low"
                      : "text-white border border-white/25 hover:bg-white/10"
                  }`}
                />
              </div>
            );
          })}
        </section>

        {/* No auto-renewal note */}
        <p className="text-sm text-white/60 text-center max-w-2xl mx-auto px-8 pt-6">
          {t("noAutoRenewNote")}
        </p>

        {/* What every pass includes */}
        <section className="flex flex-col gap-5 px-8 py-14 max-w-3xl mx-auto w-full">
          <h3 className="text-lg font-display font-bold text-white text-center">
            {t("includedTitle")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
            {includedFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <span
                  className="material-symbols-outlined text-[18px] text-secondary flex-shrink-0"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
                <span className="text-sm text-white/80">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Free plan strip */}
        <section className="px-8 pb-20 max-w-3xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between p-5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase bg-white/10 text-white/70">
                  {t("freeBadge")}
                </span>
                <span className="text-base font-display font-bold text-white">
                  {t("freeName")}
                </span>
              </div>
              <p className="text-sm text-white/60">{t("freeTagline")}</p>
            </div>
            <span className="text-xs text-white/50 font-semibold flex-shrink-0">
              {t("freeNote")}
            </span>
          </div>
        </section>

        <PublicFooter />
      </div>
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
