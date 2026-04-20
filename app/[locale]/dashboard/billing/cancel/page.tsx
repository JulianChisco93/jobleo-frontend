"use client";

import { useTranslations } from "next-intl";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { Link } from "@/i18n/navigation";

export default function BillingCancelPage() {
  const t = useTranslations("billing");

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("cancelTitle")} />

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-4xl text-outline">
              cancel
            </span>
          </div>

          <h1 className="text-3xl font-display font-extrabold text-on-surface mb-3">
            {t("cancelTitle")}
          </h1>
          <p className="text-on-surface-variant mb-8">
            {t("cancelDesc")}
          </p>

          <div className="flex flex-col gap-3">
            <Link
              href="/dashboard/settings"
              className="w-full py-3 px-6 bg-primary-gradient text-on-primary font-bold text-sm rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
            >
              {t("tryAgain")}
            </Link>
            <Link
              href="/dashboard"
              className="w-full py-3 px-6 text-on-surface-variant border border-outline-variant font-bold text-sm rounded-xl hover:bg-surface-container-low transition-colors text-center"
            >
              {t("backToDashboard")}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
