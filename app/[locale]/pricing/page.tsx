import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
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
          <p className="text-base text-white/70 text-center max-w-lg">
            {t("subtitle")}
          </p>
        </section>

        {/* Plan Cards */}
        <section className="flex flex-col md:flex-row gap-6 px-8 pb-20 justify-center max-w-6xl mx-auto w-full">
          {/* Starter */}
          <div className="flex flex-col gap-6 p-8 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex-1">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold tracking-widest px-3 py-1 self-start bg-white/10 text-white/70 rounded-full uppercase">
                {t("starterBadge")}
              </span>
              <h2 className="text-2xl font-display font-bold text-white mt-2">
                {t("starterName")}
              </h2>
              <p className="text-3xl font-display font-bold text-white">
                {t("starterPrice")}
              </p>
              <p className="text-sm text-white/60">{t("starterTagline")}</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                t("starterFeature1"),
                t("starterFeature2"),
                t("starterFeature3"),
                t("starterFeature4"),
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  <span className="text-sm text-white/70">{feature}</span>
                </div>
              ))}
            </div>

            <button
              disabled
              title={t("starterComingSoonTooltip")}
              className="mt-auto w-full py-3 text-sm font-bold text-white/40 border border-white/20 rounded-xl cursor-not-allowed opacity-60"
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

            <CheckoutButton
              plan="pro"
              label={t("proCta")}
              className="mt-auto w-full py-3 text-sm font-bold text-primary bg-surface-container-lowest rounded-xl hover:bg-surface-container-low transition-colors disabled:opacity-60"
            />
          </div>

          {/* Premium */}
          <div className="flex flex-col gap-6 p-8 bg-secondary rounded-xl shadow-[var(--shadow-card)] flex-1">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold tracking-widest px-3 py-1 self-start bg-on-secondary/10 text-secondary-fixed rounded-full uppercase">
                {t("premiumBadge")}
              </span>
              <h2 className="text-2xl font-display font-bold text-on-secondary mt-2">
                {t("premiumName")}
              </h2>
              <p className="text-3xl font-display font-bold text-on-secondary">
                {t("premiumPrice")}
              </p>
              <p className="text-sm text-on-secondary/80">{t("premiumTagline")}</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                t("premiumFeature1"),
                t("premiumFeature2"),
                t("premiumFeature3"),
                t("premiumFeature4"),
                t("premiumFeature5"),
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[18px] text-secondary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span className="text-sm text-on-secondary">{feature}</span>
                </div>
              ))}
            </div>

            <CheckoutButton
              plan="premium"
              label={t("premiumCta")}
              className="mt-auto w-full py-3 text-sm font-bold text-secondary bg-surface-container-lowest rounded-xl hover:bg-surface-container-low transition-colors disabled:opacity-60"
            />
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
