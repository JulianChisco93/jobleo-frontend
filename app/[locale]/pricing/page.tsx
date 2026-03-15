import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";

function CheckIcon({ color = "#4CAF50" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PricingContent() {
  const t = useTranslations("pricing");
  const tNav = useTranslations("nav");

  return (
    <div className="flex flex-col min-h-screen bg-bg-page">
      <PublicNavbar />

      {/* Header */}
      <section className="flex flex-col items-center gap-3 px-12 py-16">
        <span className="text-xs font-bold tracking-widest font-mono text-accent-red uppercase">
          {t("tag")}
        </span>
        <h1 className="text-4xl font-bold font-heading text-text-primary text-center">
          {t("title")}
        </h1>
        <p className="text-base font-heading text-text-secondary text-center">
          {t("subtitle")}
        </p>
      </section>

      {/* Plan Cards */}
      <section className="flex flex-col md:flex-row gap-6 px-12 pb-16 justify-center max-w-5xl mx-auto w-full">
        {/* Starter */}
        <div
          className="flex flex-col gap-6 p-10 bg-bg-card flex-1"
          style={{ border: "2px solid #000000" }}
        >
          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-bold tracking-widest font-mono px-3 py-1 self-start"
              style={{ backgroundColor: "#FFC107", color: "#000000" }}
            >
              {t("starterBadge")}
            </span>
            <h2 className="text-2xl font-bold font-heading text-text-primary mt-2">
              {t("starterName")}
            </h2>
            <p className="text-3xl font-bold font-mono text-text-primary">
              {t("starterPrice")}
            </p>
            <p className="text-sm font-heading text-text-secondary">
              {t("starterTagline")}
            </p>
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
                <span className="text-sm font-heading text-text-secondary">{feature}</span>
              </div>
            ))}
          </div>

          <button
            className="mt-auto w-full py-3 text-sm font-bold font-heading text-text-primary border-2 border-border-color hover:bg-bg-page transition-colors"
          >
            {t("starterCta")}
          </button>
        </div>

        {/* Pro */}
        <div
          className="flex flex-col gap-6 p-10 flex-1"
          style={{ backgroundColor: "#1E88E5", border: "2px solid #000000" }}
        >
          <div className="flex flex-col gap-2">
            <span
              className="text-xs font-bold tracking-widest font-mono px-3 py-1 self-start"
              style={{ backgroundColor: "#000000", color: "#ffffff" }}
            >
              {t("proBadge")}
            </span>
            <h2 className="text-2xl font-bold font-heading text-white mt-2">
              {t("proName")}
            </h2>
            <p className="text-3xl font-bold font-mono text-white">
              {t("proPrice")}
            </p>
            <p className="text-sm font-heading" style={{ color: "rgba(255,255,255,0.85)" }}>
              {t("proTagline")}
            </p>
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
                <CheckIcon color="#ffffff" />
                <span className="text-sm font-heading text-white">{feature}</span>
              </div>
            ))}
          </div>

          <Link
            href="/login"
            className="mt-auto w-full py-3 text-sm font-bold font-heading text-text-primary bg-bg-card border-2 border-border-color hover:opacity-90 transition-opacity text-center"
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
