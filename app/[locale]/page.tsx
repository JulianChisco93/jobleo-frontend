import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export const metadata: Metadata = {
  title: "Your Next Job, Delivered to WhatsApp",
};
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Link } from "@/i18n/navigation";

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function LandingContent() {
  const t = useTranslations("landing");
  const tNav = useTranslations("nav");

  return (
    <div className="flex flex-col min-h-screen bg-bg-page">
      <PublicNavbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="flex gap-12 px-12 py-20 bg-bg-card"
        style={{ borderBottom: "2px solid #000000" }}
      >
        <div className="flex flex-col gap-6 flex-1 justify-center">
          <span className="text-xs font-bold tracking-widest font-mono text-accent-red uppercase">
            {t("heroTag")}
          </span>
          <h1 className="text-5xl font-bold leading-tight font-heading text-text-primary">
            {t("heroTitle")}
          </h1>
          <p className="text-base font-heading text-text-secondary max-w-md leading-relaxed">
            {t("heroSubtitle")}
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              href="/login"
              className="px-6 py-3 text-sm font-bold font-heading text-text-on-dark bg-accent-red border-2 border-border-color hover:opacity-90 transition-opacity"
            >
              {t("heroCtaPrimary")}
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3 text-sm font-bold font-heading text-text-primary bg-bg-card border-2 border-border-color hover:bg-bg-page transition-colors"
            >
              {t("heroCtaSecondary")}
            </a>
          </div>
        </div>

        {/* Hero mockup */}
        <div
          className="flex-1 hidden md:flex items-center justify-center"
          style={{
            border: "2px solid #000000",
            minHeight: 320,
            backgroundColor: "#FAFAFA",
          }}
        >
          <div className="flex flex-col gap-3 p-6 w-full max-w-sm">
            {/* WhatsApp-style preview card */}
            <div
              className="p-4 rounded-sm"
              style={{ backgroundColor: "#DCF8C6", border: "1px solid #b2dfb2" }}
            >
              <p className="text-xs font-bold font-mono text-text-primary mb-1">⚡ {t("mockupHeader")}</p>
              <p className="text-sm font-bold font-heading text-text-primary">{t("mockupTitle")}</p>
              <p className="text-xs font-heading text-text-secondary">{t("mockupCompany")}</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className="px-2 py-0.5 text-xs font-bold font-mono text-white"
                  style={{ backgroundColor: "#4CAF50" }}
                >
                  87%
                </span>
                <span className="text-xs font-heading text-text-secondary">{t("mockupScore")}</span>
              </div>
              <p
                className="mt-2 text-xs font-bold font-heading"
                style={{ color: "#1E88E5" }}
              >
                {t("mockupApply")}
              </p>
            </div>
            <p className="text-center text-xs font-mono text-text-muted">
              {t("mockupCaption")}
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="flex flex-col items-center gap-12 px-12 py-20 bg-bg-page"
        style={{ borderBottom: "2px solid #000000" }}
      >
        <h2 className="text-3xl font-bold font-heading text-text-primary text-center">
          {t("howItWorksTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {[
            {
              num: "1",
              color: "#E53935",
              title: t("step1Title"),
              desc: t("step1Desc"),
            },
            {
              num: "2",
              color: "#1E88E5",
              title: t("step2Title"),
              desc: t("step2Desc"),
            },
            {
              num: "3",
              color: "#FFC107",
              title: t("step3Title"),
              desc: t("step3Desc"),
            },
          ].map((step) => (
            <div
              key={step.num}
              className="flex flex-col gap-4 p-8 bg-bg-card"
              style={{ border: "2px solid #000000" }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center text-base font-bold font-mono"
                style={{ backgroundColor: step.color, color: "#ffffff" }}
              >
                {step.num}
              </div>
              <h3 className="text-lg font-bold font-heading text-text-primary">
                {step.title}
              </h3>
              <p className="text-sm font-heading text-text-secondary leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section
        id="features"
        className="flex flex-col items-center gap-12 px-12 py-20 bg-text-primary"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-bold tracking-widest font-mono text-accent-red uppercase">
            {t("featuresTag")}
          </span>
          <h2 className="text-3xl font-bold font-heading text-text-on-dark text-center">
            {t("featuresTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {[
            {
              icon: "🧠",
              title: t("feature1Title"),
              desc: t("feature1Desc"),
            },
            {
              icon: "🔍",
              title: t("feature2Title"),
              desc: t("feature2Desc"),
            },
            {
              icon: "⚡",
              title: t("feature3Title"),
              desc: t("feature3Desc"),
            },
            {
              icon: "📲",
              title: t("feature4Title"),
              desc: t("feature4Desc"),
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-4 p-8"
              style={{ border: "2px solid #ffffff33" }}
            >
              <span className="text-3xl">{f.icon}</span>
              <h3 className="text-base font-bold font-heading text-text-on-dark">
                {f.title}
              </h3>
              <p className="text-sm font-heading leading-relaxed" style={{ color: "#999999" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social Proof ──────────────────────────────────────── */}
      <section
        className="flex flex-col items-center gap-12 px-12 py-20 bg-bg-card"
        style={{ borderBottom: "2px solid #000000" }}
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-bold tracking-widest font-mono text-accent-red uppercase">
            {t("socialProofTag")}
          </span>
          <h2 className="text-3xl font-bold font-heading text-text-primary text-center">
            {t("socialProofTitle")}
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 w-full max-w-3xl">
          {[
            { value: t("stat1Value"), label: t("stat1Label"), color: "#E53935" },
            { value: t("stat2Value"), label: t("stat2Label"), color: "#1E88E5" },
            { value: t("stat3Value"), label: t("stat3Label"), color: "#FFC107" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 p-8"
              style={{ border: "2px solid #000000" }}
            >
              <span
                className="text-4xl font-bold font-mono"
                style={{ color: stat.color }}
              >
                {stat.value}
              </span>
              <span className="text-sm font-heading text-text-secondary text-center">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {[
            { text: t("testimonial1"), author: t("testimonial1Author") },
            { text: t("testimonial2"), author: t("testimonial2Author") },
            { text: t("testimonial3"), author: t("testimonial3Author") },
          ].map((testimonial, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-6 bg-bg-page"
              style={{ border: "2px solid #000000" }}
            >
              <p className="text-sm font-heading text-text-secondary leading-relaxed italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              <span className="text-xs font-bold font-mono text-text-muted">
                {testimonial.author}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────── */}
      <section
        className="flex flex-col items-center gap-6 px-12 py-16 bg-accent-red"
      >
        <h2 className="text-3xl font-bold font-heading text-text-on-dark text-center">
          {t("ctaTitle")}
        </h2>
        <p className="text-base font-heading text-text-on-dark text-center opacity-90">
          {t("ctaSubtitle")}
        </p>
        <Link
          href="/login"
          className="px-8 py-3 text-sm font-bold font-heading text-text-primary bg-bg-card border-2 border-border-color hover:opacity-90 transition-opacity"
        >
          {t("ctaButton")}
        </Link>

      </section>

      <PublicFooter />
    </div>
  );
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingContent />;
}
