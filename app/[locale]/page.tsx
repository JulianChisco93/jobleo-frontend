import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { Link } from "@/i18n/navigation";
import HeroBackground from "@/components/HeroBackground";

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
      <section className="relative overflow-hidden px-6 py-20 lg:py-32">
        <HeroBackground />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left copy */}
          <div className="z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-bold mb-6">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              {t("heroTag")}
            </div>
            <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              Your dream job,{" "}
              <span className="text-[#5DCAA5] italic">on WhatsApp.</span>
            </h1>
            <p className="text-lg text-white/60 max-w-xl mb-10 leading-relaxed">
              {t("heroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-[#5DCAA5] text-[#04342C] px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:opacity-90 transition-all active:scale-95"
              >
                {t("heroCtaPrimary")}
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <a
                href="#how-it-works"
                className="flex items-center justify-center border border-white/25 text-white/80 px-8 py-4 rounded-xl font-bold text-lg hover:border-white/50 hover:text-white transition-all"
              >
                {t("heroCtaSecondary")}
              </a>
            </div>
            {/* Social proof */}
            <div className="mt-10 flex items-center gap-4 text-sm text-white/40">
              <div className="flex -space-x-2">
                {[
                  "bg-[#1D9E75]",
                  "bg-[#185FA5]",
                  "bg-[#5DCAA5]",
                ].map((bg, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full border-2 border-[#0a1628] ${bg} flex items-center justify-center`}
                  >
                    <span className="material-symbols-outlined text-[14px] text-white">
                      person
                    </span>
                  </div>
                ))}
              </div>
              <span>Joined by {t("stat1Value")} job seekers</span>
            </div>
          </div>

          {/* Right: WhatsApp mockup card */}
          <div className="relative hidden lg:block">
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#1D9E75]/10 rounded-full blur-3xl" />
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl shadow-2xl relative border border-white/10">
              {/* Chat header */}
              <div className="flex items-center gap-4 border-b border-white/10 pb-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1D9E75]/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#5DCAA5]" style={{ fontVariationSettings: "'FILL' 1" }}>chat</span>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{t("mockupHeader")}</p>
                  <p className="text-xs text-[#5DCAA5] font-semibold">Online</p>
                </div>
              </div>
              {/* Chat messages */}
              <div className="space-y-4">
                <div className="bg-white/10 p-3 rounded-lg rounded-tl-none max-w-[80%]">
                  <p className="text-sm text-white/80">Hey! We found a <b>98% match</b> for you: <b>{t("mockupTitle")}</b></p>
                </div>
                {/* Job card */}
                <div className="bg-[#185FA5] text-white p-4 rounded-xl shadow-md border border-[#1D9E75]/30">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">New Match Found</span>
                    <span className="bg-[#1D9E75] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">98% SCORE</span>
                  </div>
                  <h4 className="font-bold text-lg mb-1">{t("mockupTitle")}</h4>
                  <p className="text-xs mb-3 opacity-90">{t("mockupCompany")}</p>
                  <div className="flex gap-2">
                    <button className="flex-1 bg-white text-[#185FA5] text-xs font-bold py-2 rounded-lg">{t("mockupApply")}</button>
                    <button className="px-3 bg-white/20 text-white rounded-lg">
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
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-display font-extrabold text-on-surface mb-4">
            {t("howItWorksTitle")}
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto mb-16">
            {t("heroSubtitle")}
          </p>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { icon: "upload_file", title: t("step1Title"), desc: t("step1Desc"), filled: false },
              { icon: "tune", title: t("step2Title"), desc: t("step2Desc"), filled: false },
              { icon: "notifications_active", title: t("step3Title"), desc: t("step3Desc"), filled: true },
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="mb-8 relative flex justify-center">
                  <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all border z-10 ${
                    step.filled
                      ? "bg-primary border-primary"
                      : "bg-surface-container-lowest border-surface-container-high"
                  }`}>
                    <span className={`material-symbols-outlined text-3xl ${step.filled ? "text-on-primary" : "text-primary"}`}
                      style={{ fontVariationSettings: "'FILL' 1" }}>
                      {step.icon}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className="absolute top-10 left-[60%] w-full h-0.5 bg-outline-variant/30 hidden md:block" />
                  )}
                </div>
                <h3 className="text-xl font-display font-bold mb-3 text-on-surface">{step.title}</h3>
                <p className="text-on-surface-variant text-sm px-4">{step.desc}</p>
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
            <div className="md:col-span-2 bg-surface-container-lowest p-8 rounded-2xl border border-surface-container-high flex flex-col justify-between overflow-hidden relative">
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
            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container-high flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary text-4xl mb-6"
                style={{ fontVariationSettings: "'FILL' 1" }}>filter_alt</span>
              <div>
                <h3 className="text-xl font-display font-bold mb-2">{t("feature3Title")}</h3>
                <p className="text-sm text-on-surface-variant">{t("feature3Desc")}</p>
              </div>
            </div>
            {/* Testimonial — 3-col span */}
            <div className="md:col-span-2 lg:col-span-3 bg-surface-container-low p-8 rounded-2xl border border-surface-container-high flex items-center gap-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-3xl text-on-secondary-container"
                  style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
              </div>
              <div>
                <p className="text-lg font-medium italic text-on-surface mb-4">&ldquo;{t("testimonial1")}&rdquo;</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-on-surface">{t("testimonial1Author")}</span>
                </div>
              </div>
            </div>
            {/* WhatsApp Alerts */}
            <div className="bg-surface-container-lowest p-8 rounded-2xl border border-surface-container-high flex flex-col justify-between">
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
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-12 translate-x-20" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-on-primary mb-8 tracking-tight">
            {t("ctaTitle")}
          </h2>
          <p className="text-xl text-on-primary/80 mb-12 max-w-2xl mx-auto">
            {t("ctaSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="bg-secondary text-on-secondary px-10 py-5 rounded-xl font-bold text-xl hover:bg-secondary-container transition-all shadow-xl active:scale-95"
            >
              {t("heroCtaPrimary")}
            </Link>
            <Link
              href="/pricing"
              className="bg-primary-container text-on-primary px-10 py-5 rounded-xl font-bold text-xl border border-white/20 hover:bg-white/10 transition-all active:scale-95"
            >
              Explore Pricing
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
