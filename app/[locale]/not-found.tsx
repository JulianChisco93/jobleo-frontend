import { getLocale } from "next-intl/server";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { PublicFooter } from "@/components/layout/PublicFooter";
import Link from "next/link";

export default async function NotFound() {
  const locale = await getLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      <PublicNavbar />
      <main className="flex-1 flex items-center justify-center px-8 py-24">
        <div className="text-center max-w-lg">
          <p className="text-8xl font-black font-display text-primary mb-4">404</p>
          <h1 className="text-2xl font-bold text-on-surface mb-3">
            {locale === "es" ? "Página no encontrada" : "Page not found"}
          </h1>
          <p className="text-on-surface-variant mb-10">
            {locale === "es"
              ? "La página que buscas no existe o fue movida."
              : "The page you're looking for doesn't exist or has been moved."}
          </p>
          <Link
            href={`${prefix}/`}
            className="inline-flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            {locale === "es" ? "Volver al inicio" : "Back to home"}
          </Link>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
