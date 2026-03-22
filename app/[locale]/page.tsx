import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Link } from "@/i18n/navigation";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return { title: t("defaultTitle") };
}

function LandingContent() {
  const t = useTranslations("landing");

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <PublicNavbar />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="flex gap-12 px-8 md:px-16 py-20 max-w-7xl mx-auto w-full">
        <div className="flex flex-col gap-6 flex-1 justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 self-start bg-primary-fixed text-primary rounded-full text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-[14px]">bolt</span>
            {t("heroTag")}
          </span>
          <h1 className="text-5xl font-display font-bold leading-tight text-on-surface">
            {t("heroTitle")}
          </h1>
          <p className="text-base text-on-surface-variant max-w-md leading-relaxed">
            {t("heroSubtitle")}
          </p>
          <div className="flex gap-4 mt-2">
            <Link
              href="/login"
              className="px-6 py-3 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {t("heroCtaPrimary")}
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3 text-sm font-bold text-on-surface border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
            >
              {t("heroCtaSecondary")}
            </a>
          </div>
        </div>

        {/* Hero image */}
        <div className="flex-1 hidden md:flex items-center justify-center relative overflow-hidden rounded-2xl bg-surface-container-low" style={{ minHeight: 320 }}>
          <Image
            src="/hero-image.png"
            alt="Job Match on WhatsApp"
            fill
            style={{ objectFit: "cover", objectPosition: "center top" }}
            priority
          />
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="flex flex-col items-center gap-12 px-8 py-20 bg-surface-container-low"
      >
        <h2 className="text-3xl font-display font-bold text-on-surface text-center">
          {t("howItWorksTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {[
            { num: "1", icon: "upload_file", title: t("step1Title"), desc: t("step1Desc") },
            { num: "2", icon: "manage_search", title: t("step2Title"), desc: t("step2Desc") },
            { num: "3", icon: "notifications_active", title: t("step3Title"), desc: t("step3Desc") },
          ].map((step) => (
            <div
              key={step.num}
              className="flex flex-col gap-4 p-8 bg-surface-container-lowest rounded-xl shadow-[var(--shadow-card)]"
            >
              <div className="w-11 h-11 flex items-center justify-center bg-primary-fixed rounded-xl text-primary">
                <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {step.icon}
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-on-surface">{step.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section
        id="features"
        className="flex flex-col items-center gap-12 px-8 py-20 bg-primary"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-bold tracking-widest text-primary-fixed uppercase">
            {t("featuresTag")}
          </span>
          <h2 className="text-3xl font-display font-bold text-on-primary text-center">
            {t("featuresTitle")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
          {[
            { icon: "psychology", title: t("feature1Title"), desc: t("feature1Desc") },
            { icon: "search", title: t("feature2Title"), desc: t("feature2Desc") },
            { icon: "bolt", title: t("feature3Title"), desc: t("feature3Desc") },
            { icon: "smartphone", title: t("feature4Title"), desc: t("feature4Desc") },
          ].map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-4 p-6 bg-surface-container-lowest/10 rounded-xl border border-on-primary/10"
            >
              <span className="material-symbols-outlined text-3xl text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>
                {f.icon}
              </span>
              <h3 className="text-base font-display font-bold text-on-primary">{f.title}</h3>
              <p className="text-sm leading-relaxed text-on-primary/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social Proof ────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-12 px-8 py-20 bg-surface">
        <div className="flex flex-col items-center gap-3">
          <span className="text-xs font-bold tracking-widest text-secondary uppercase">
            {t("socialProofTag")}
          </span>
          <h2 className="text-3xl font-display font-bold text-on-surface text-center">
            {t("socialProofTitle")}
          </h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
          {[
            { value: t("stat1Value"), label: t("stat1Label") },
            { value: t("stat2Value"), label: t("stat2Label") },
            { value: t("stat3Value"), label: t("stat3Label") },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-2 p-8 bg-surface-container-lowest rounded-xl shadow-[var(--shadow-card)]"
            >
              <span className="text-4xl font-display font-bold text-primary">{stat.value}</span>
              <span className="text-sm text-on-surface-variant text-center">{stat.label}</span>
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
              className="flex flex-col gap-4 p-6 bg-surface-container-lowest rounded-xl shadow-[var(--shadow-card)]"
            >
              <span className="material-symbols-outlined text-2xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>
                format_quote
              </span>
              <p className="text-sm text-on-surface-variant leading-relaxed italic">
                {testimonial.text}
              </p>
              <span className="text-xs font-bold text-on-surface-variant">{testimonial.author}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <section className="flex flex-col items-center gap-6 px-8 py-20 bg-surface-container-low">
        <h2 className="text-3xl font-display font-bold text-on-surface text-center">
          {t("ctaTitle")}
        </h2>
        <p className="text-base text-on-surface-variant text-center max-w-lg">
          {t("ctaSubtitle")}
        </p>
        <Link
          href="/login"
          className="px-8 py-3.5 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
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
