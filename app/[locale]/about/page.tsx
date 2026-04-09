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
  return { title: t("aboutTitle") };
}

function AboutContent() {
  const t = useTranslations("about");

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <PublicNavbar />

      <main className="pt-24 pb-20 min-h-screen" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, #c3c6d2 1px, transparent 0)",
        backgroundSize: "40px 40px",
      }}>
        <div className="max-w-7xl mx-auto px-8">

          {/* ── Mission / Hero ─────────────────────────────────────── */}
          <section className="mb-24 relative">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
              <div className="md:col-span-8">
                <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-primary-container text-on-primary-container rounded-full">
                  {t("missionTag")}
                </span>
                <h1 className="font-display text-5xl md:text-7xl font-extrabold leading-tight tracking-tighter text-primary mb-8">
                  {t("missionTitle")}{" "}
                  <br />
                  <span className="text-secondary italic">{t("missionTitleAccent")}</span>{" "}
                  {t("missionTitleSuffix")}
                </h1>
                <p className="text-xl md:text-2xl text-on-surface-variant leading-relaxed max-w-2xl">
                  {t("missionDesc")}
                </p>
              </div>
              <div className="md:col-span-4 hidden md:block">
                <div className="relative h-64 w-full bg-surface-container-low rounded-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-primary/20"
                      style={{ fontSize: "8rem", fontVariationSettings: "'wght' 100" }}
                    >
                      precision_manufacturing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Bento Grid ─────────────────────────────────────────── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">

            {/* Why WhatsApp — 2-col span */}
            <div className="md:col-span-2 bg-surface-container-lowest rounded-xl p-10 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: "6rem" }}>forum</span>
              </div>
              <div className="relative z-10">
                <h2 className="font-display text-3xl font-bold mb-6 text-primary flex items-center gap-3">
                  {t("whyWhatsappTitle")}
                  <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs rounded-full font-bold">
                    {t("whyWhatsappBadge")}
                  </span>
                </h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-on-surface">{t("whyZeroNoiseTitle")}</h3>
                    <p className="text-on-surface-variant">{t("whyZeroNoiseDesc")}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-2 text-on-surface">{t("whyRealTimeTitle")}</h3>
                    <p className="text-on-surface-variant">{t("whyRealTimeDesc")}</p>
                  </div>
                </div>
              </div>
              <div className="mt-12 flex items-center gap-4 text-secondary font-bold text-sm tracking-tight">
                <span>EXPLORE OUR CONNECTIVITY</span>
                <span className="material-symbols-outlined">trending_flat</span>
              </div>
            </div>

            {/* AI Ethics */}
            <div className="bg-primary text-on-primary rounded-xl p-10 flex flex-col justify-between">
              <div>
                <span
                  className="material-symbols-outlined text-4xl mb-6 block"
                  style={{ color: "#eec209", fontVariationSettings: "'FILL' 1" }}
                >
                  verified_user
                </span>
                <h2 className="font-display text-3xl font-bold mb-6">{t("aiEthicsTitle")}</h2>
                <p className="text-on-primary/80 leading-relaxed mb-6">{t("aiEthicsDesc")}</p>
              </div>
              <ul className="space-y-4">
                {[t("aiEthicsBullet1"), t("aiEthicsBullet2")].map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3 text-sm">
                    <span
                      className="material-symbols-outlined text-[20px]"
                      style={{ color: "#4ae183", fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    {bullet}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Team / Story ───────────────────────────────────────── */}
          <section className="py-12">
            <div className="flex flex-col md:flex-row gap-16 items-start">
              {/* Sticky sidebar */}
              <div className="w-full md:w-1/3 md:sticky top-32">
                <h2 className="font-display text-4xl font-extrabold text-primary mb-6">{t("teamTitle")}</h2>
                <p className="text-on-surface-variant mb-8">{t("teamDesc")}</p>
                <div className="flex gap-4">
                  <div className="w-12 h-1 bg-secondary rounded-full" />
                  <div className="w-4 h-1 bg-outline-variant rounded-full" />
                  <div className="w-4 h-1 bg-outline-variant rounded-full" />
                </div>
              </div>

              {/* Founder card */}
              <div className="w-full md:w-2/3 grid grid-cols-1 gap-6">
                <div className="bg-surface-container-low rounded-xl p-8 hover:bg-surface-container transition-colors">
                  <div className="w-20 h-20 bg-surface-container-high rounded-full mb-6 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-on-surface-variant"
                      style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-primary mb-1">{t("founder1Name")}</h3>
                  <p className="text-secondary font-bold text-xs uppercase tracking-widest mb-4">{t("founder1Role")}</p>
                  <p className="text-sm text-on-surface-variant leading-relaxed">{t("founder1Desc")}</p>
                </div>

                {/* Our Story — full width */}
                <div className="bg-tertiary-fixed rounded-xl p-10 flex flex-col md:flex-row gap-10 items-center">
                  <div className="flex-1">
                    <h3 className="font-display text-2xl font-bold text-on-tertiary-fixed mb-4">{t("storyTitle")}</h3>
                    <p className="text-on-tertiary-fixed-variant leading-relaxed">{t("storyDesc")}</p>
                  </div>
                  <div className="flex-none">
                    <button className="bg-on-tertiary-fixed text-tertiary-fixed px-8 py-4 rounded-xl font-bold font-display transition-all hover:scale-105 active:scale-95">
                      {t("storyButton")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}
