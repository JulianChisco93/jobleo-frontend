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
  return { title: t("termsTitle") };
}

function TermsContent() {
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
              {t("termsTitle")}
            </h1>
            <p className="text-on-surface-variant text-sm">{t("termsLastUpdated")}</p>
          </div>

          <div className="prose prose-slate max-w-none space-y-10 text-on-surface">

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("terms1Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("terms1Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("terms2Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("terms2Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("terms3Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("terms3Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("terms4Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("terms4Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("terms5Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("terms5Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("terms6Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("terms6Body")}</p>
            </section>

            <section>
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("terms7Title")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("terms7Body")}</p>
            </section>

            <section className="bg-surface-container-low rounded-xl p-6">
              <h2 className="font-display text-xl font-bold text-primary mb-3">{t("contactTitle")}</h2>
              <p className="text-on-surface-variant leading-relaxed">{t("termsContactBody")}</p>
            </section>

          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TermsContent />;
}
