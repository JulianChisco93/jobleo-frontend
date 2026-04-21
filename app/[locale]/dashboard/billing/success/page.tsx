"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { Link } from "@/i18n/navigation";
import { getMe, updateSearchProfile, createSearchProfile } from "@/lib/api";

export default function BillingSuccessPage() {
  const t = useTranslations("billing");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });

  const isPremium = me?.plan === "premium";
  const title = isPremium ? t("successTitlePremium") : t("successTitlePro");
  const planLabel = isPremium ? t("planActivatedPremium") : t("planActivatedPro");
  const badgeColor = isPremium
    ? "bg-secondary text-on-secondary"
    : "bg-primary text-on-primary";
  const badgeBg = isPremium ? "bg-secondary/10" : "bg-primary/10";

  useEffect(() => {
    // Invalidate the user query so plan info refreshes immediately
    queryClient.invalidateQueries({ queryKey: ["me"] });

    // Create the search profile saved during onboarding for pro/premium plans
    const pendingProfileRaw = sessionStorage.getItem("onboarding_pending_profile");
    if (pendingProfileRaw) {
      try {
        const payload = JSON.parse(pendingProfileRaw);
        createSearchProfile(payload)
          .then(() => queryClient.invalidateQueries({ queryKey: ["search-profiles"] }))
          .catch(() => {})
          .finally(() => sessionStorage.removeItem("onboarding_pending_profile"));
      } catch {
        sessionStorage.removeItem("onboarding_pending_profile");
      }
    }

    // Apply job titles saved during onboarding (starter plan users who later upgraded)
    const pendingProfileId = sessionStorage.getItem("onboarding_profile_id");
    const pendingJobTitles = sessionStorage.getItem("onboarding_job_titles");
    if (pendingProfileId && pendingJobTitles) {
      try {
        const jobTitles: string[] = JSON.parse(pendingJobTitles);
        updateSearchProfile(pendingProfileId, { job_titles: jobTitles })
          .then(() => queryClient.invalidateQueries({ queryKey: ["search-profiles"] }))
          .catch(() => {})
          .finally(() => {
            sessionStorage.removeItem("onboarding_profile_id");
            sessionStorage.removeItem("onboarding_job_titles");
          });
      } catch {
        sessionStorage.removeItem("onboarding_profile_id");
        sessionStorage.removeItem("onboarding_job_titles");
      }
    }

    const timer = setTimeout(() => router.push("/dashboard"), 5000);
    return () => clearTimeout(timer);
  }, [queryClient, router]);

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={title} />

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
            {title}
          </h1>
          <p className="text-on-surface-variant mb-2">
            {t("successDesc")}
          </p>
          <p className="text-xs text-on-surface-variant mb-8">
            {t("successRedirect")}
          </p>

          {/* Plan badge */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 ${badgeBg} rounded-full mb-8`}>
            <span className={`text-[10px] font-bold px-2 py-0.5 ${badgeColor} rounded-full uppercase tracking-widest`}>
              {isPremium ? "Premium" : "Pro"}
            </span>
            <span className="text-sm font-semibold text-on-surface">
              {planLabel}
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
