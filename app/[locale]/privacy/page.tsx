import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("privacyTitle") };
}

function PrivacyContent() {
  const t = useTranslations("legal");

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <PublicNavbar />
      <main className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-8">
          <div className="mb-12">
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest uppercase bg-primary-container text-on-primary-container rounded-full">
              {t("legalTag")}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold text-primary mb-4">
              {t("privacyTitle")}
            </h1>
            <p className="text-on-surface-variant text-sm">{t("privacyLastUpdated")}</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-10 text-on-surface">

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("privacy1Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("privacy1Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("privacy2Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("privacy2Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("privacy3Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("privacy3Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("privacy4Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("privacy4Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("privacy5Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("privacy5Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("privacy6Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("privacy6Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("privacy7Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("privacy7Body")}</p>
            </section>

            <section className="bg-surface-container-low rounded-xl p-6">
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("contactTitle")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("privacyContactBody")}</p>
            </section>

          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyContent />;
}
