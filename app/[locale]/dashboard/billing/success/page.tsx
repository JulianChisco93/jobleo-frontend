"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { Link } from "@/i18n/navigation";

export default function BillingSuccessPage() {
  const t = useTranslations("billing");
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Invalidate the user query so plan info refreshes immediately
    queryClient.invalidateQueries({ queryKey: ["me"] });

    const timer = setTimeout(() => router.push("/dashboard"), 5000);
    return () => clearTimeout(timer);
  }, [queryClient, router]);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("successTitle")} />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-6">
            <span
              className="material-symbols-outlined text-4xl text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
          </div>

          <h1 className="text-3xl font-display font-extrabold text-on-surface mb-3">
            {t("successTitle")}
          </h1>
          <p className="text-on-surface-variant mb-2">
            {t("successDesc")}
          </p>
          <p className="text-xs text-on-surface-variant mb-8">
            {t("successRedirect")}
          </p>

          {/* Plan badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-on-primary rounded-full uppercase tracking-widest">
              Pro
            </span>
            <span className="text-sm font-semibold text-on-surface">
              {t("planActivated")}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard"
              className="w-full py-3 px-6 bg-primary-gradient text-on-primary font-bold text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              {t("goToDashboard")}
            </Link>
            <Link
              href="/dashboard/settings"
              className="w-full py-3 px-6 text-primary border border-primary-container font-bold text-sm rounded-xl hover:bg-primary-fixed transition-colors text-center"
            >
              {t("viewSubscription")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
