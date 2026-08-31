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
  return { title: t("defaultTitle") };
}

function LandingContent() {
  const t = useTranslations("landing");

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <PublicNavbar />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 bg-surface-container-lowest">
        {/* Grain texture — feTurbulence at 4% opacity, tiling 200×200 */}
        {/* Mesh gradient — blue right, green top-left, grain over both */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: [
              "radial-gradient(ellipse 100% 120% at 95% 50%, rgb(0 56 116 / 0.22) 0%, transparent 65%)",
              "radial-gradient(ellipse 70% 70% at 0% 0%, rgb(0 109 55 / 0.14) 0%, transparent 55%)",
            ].join(", "),
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='200'%20height='200'%3E%3Cfilter%20id='n'%3E%3CfeTurbulence%20type='fractalNoise'%20baseFrequency='0.75'%20numOctaves='4'%20stitchTiles='stitch'/%3E%3C/filter%3E%3Crect%20width='200'%20height='200'%20filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
            opacity: 0.07,
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div>
            <div className="flex items-center gap-1.5 mb-5">
              <span className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              <span className="text-xs font-bold tracking-widest text-secondary uppercase">{t("heroTag")}</span>
            </div>
            <h1
              className="font-display font-extrabold text-on-surface leading-[1.08] tracking-tight mb-6"
              style={{ fontSize: "clamp(2.75rem, 5.5vw, 4.5rem)" }}
            >
              Your dream job,{" "}
              <span className="text-primary">on WhatsApp.</span>
            </h1>
            <p className="text-lg text-on-surface-variant max-w-xl mb-10 leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-primary text-on-primary px-8 py-4 rounded-xl font-bold text-lg hover:brightness-110 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-on-surface"
              >
                {t("heroCtaPrimary")}
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center justify-center text-on-surface-variant px-8 py-4 rounded-xl font-bold text-lg hover:text-on-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-on-surface/50"
              >
                {t("heroCtaSecondary")}
              </a>
            </div>
            {/* Feature proof points */}
            <div className="flex flex-wrap gap-x-8 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                <span className="text-sm font-medium text-on-surface-variant">{t("heroFeature1")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                <span className="text-sm font-medium text-on-surface-variant">{t("heroFeature2")}</span>
              </div>
            </div>
          </div>

          {/* Right: WhatsApp mockup card — decorative, not interactive */}
          <div className="hidden lg:flex justify-end" aria-hidden="true">
            <div
              className="w-full max-w-sm bg-surface-container-low p-6 rounded-2xl"
              style={{ boxShadow: "var(--shadow-ambient)" }}
            >
              {/* Chat header */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-outline-variant/20">
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-container text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-sm">{t("mockupHeader")}</p>
                  <p className="text-xs text-secondary font-semibold">Online</p>
                </div>
              </div>
              {/* Chat messages */}
              <div className="space-y-3">
                <div className="bg-surface-container p-3 rounded-lg rounded-tl-none max-w-[85%]">
                  <p className="text-sm text-on-surface">
                    {t.rich("mockupIntro", {
                      b: (chunks) => <span className="font-bold">{chunks}</span>,
                    })}{" "}
                    <span className="font-bold">{t("mockupTitle")}</span>
                  </p>
                </div>
                {/* Job card */}
                <div className="bg-primary text-on-primary p-4 rounded-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-primary/70">{t("mockupNewMatch")}</span>
                    <span className="bg-secondary-container text-on-secondary-container text-[10px] px-2 py-0.5 rounded-full font-bold">98%</span>
                  </div>
                  <h4 className="font-display font-bold text-base mb-0.5">{t("mockupTitle")}</h4>
                  <p className="text-xs text-on-primary/80 mb-4">{t("mockupCompany")}</p>
                  <div className="flex gap-2">
                    <button type="button" tabIndex={-1} className="flex-1 bg-surface-container-lowest text-primary text-xs font-bold py-2 rounded-lg">{t("mockupApply")}</button>
                    <button type="button" tabIndex={-1} className="px-3 bg-on-primary/10 text-on-primary rounded-lg">
                      <span className="material-symbols-outlined text-sm">bookmark</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-surface-container-low">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16">
            <span className="text-xs font-bold tracking-widest text-secondary uppercase block mb-3">
              {t("howItWorksTag")}
            </span>
            <h2 className="text-4xl font-display font-extrabold text-on-surface mb-3">
              {t("howItWorksTitle")}
            </h2>
            <p className="text-on-surface-variant max-w-xl">
              {t("howItWorksSubtitle")}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {[
              { num: "01", title: t("step1Title"), desc: t("step1Desc") },
              { num: "02", title: t("step2Title"), desc: t("step2Desc") },
              { num: "03", title: t("step3Title"), desc: t("step3Desc") },
            ].map((step) => (
              <div key={step.num}>
                <p className="font-display font-black leading-none text-on-surface/10 mb-5 tracking-tight select-none" style={{ fontSize: "clamp(4rem, 7vw, 6rem)" }}>
                  {step.num}
                </p>
                <h3 className="text-xl font-display font-bold text-on-surface mb-3">{step.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Bento Grid ─────────────────────────────────────── */}
      <section id="features" className="py-24 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs font-bold tracking-widest text-secondary uppercase block mb-3">
                {t("featuresTag")}
              </span>
              <h2 className="text-4xl font-display font-extrabold text-on-surface tracking-tight">
                {t("featuresTitle")}
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* AI Match Score — 2-col span */}
            <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-2xl flex flex-col justify-between overflow-hidden relative">
              <div>
                <span className="material-symbols-outlined text-secondary text-4xl mb-6 block"
                  style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                <h3 className="text-2xl font-display font-bold mb-2">{t("feature1Title")}</h3>
                <p className="text-on-surface-variant leading-relaxed">{t("feature1Desc")}</p>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="h-2 flex-1 bg-surface-container-high rounded-full overflow-hidden">
                  <div className="w-[85%] h-full bg-secondary rounded-full" />
                </div>
                <span className="font-bold text-secondary text-sm">85% Match</span>
              </div>
            </div>
            {/* Hourly Scraping — primary bg */}
            <div className="bg-primary text-on-primary p-8 rounded-2xl flex flex-col justify-between">
              <span className="material-symbols-outlined text-4xl mb-6"
                style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <div>
                <h3 className="text-xl font-display font-bold mb-2">{t("feature2Title")}</h3>
                <p className="text-sm opacity-80">{t("feature2Desc")}</p>
              </div>
            </div>
            {/* Smart Filtering */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary text-4xl mb-6"
                style={{ fontVariationSettings: "'FILL' 1" }}>filter_alt</span>
              <div>
                <h3 className="text-xl font-display font-bold mb-2">{t("feature3Title")}</h3>
                <p className="text-sm text-on-surface-variant">{t("feature3Desc")}</p>
              </div>
            </div>
            {/* Testimonials — 3-col span */}
            <div className="md:col-span-2 lg:col-span-3 bg-surface-container-low p-8 rounded-2xl">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { quote: t("testimonial1"), author: t("testimonial1Author") },
                  { quote: t("testimonial2"), author: t("testimonial2Author") },
                  { quote: t("testimonial3"), author: t("testimonial3Author") },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-sm text-on-surface leading-relaxed mb-4">&ldquo;{item.quote}&rdquo;</p>
                    <p className="text-xs font-bold text-on-surface-variant tracking-wide">{item.author}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* WhatsApp Alerts */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl flex flex-col justify-between">
              <span className="material-symbols-outlined text-tertiary text-4xl mb-6"
                style={{ fontVariationSettings: "'FILL' 1" }}>smartphone</span>
              <div>
                <h3 className="text-xl font-display font-bold mb-2">{t("feature4Title")}</h3>
                <p className="text-sm text-on-surface-variant">{t("feature4Desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="py-24 bg-primary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-on-primary mb-8 tracking-tight">
            {t("ctaTitle")}
          </h2>
          <p className="text-xl text-on-primary/80 mb-12 max-w-2xl mx-auto">
            {t("ctaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="bg-secondary text-on-secondary px-10 py-5 rounded-xl font-bold text-xl hover:bg-secondary/90 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-on-primary"
            >
              {t("heroCtaPrimary")}
            </Link>
            <Link
              href="/pricing"
              className="bg-primary-container text-on-primary px-10 py-5 rounded-xl font-bold text-xl border border-white/20 hover:brightness-110 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-on-primary"
            >
              {t("ctaExplorePricing")}
            </Link>
          </div>
        </div>
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
