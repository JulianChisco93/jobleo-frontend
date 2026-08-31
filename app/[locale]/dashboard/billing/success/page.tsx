"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { Link } from "@/i18n/navigation";
import {
  getMe,
  getLimits,
  updateSearchProfile,
  createSearchProfile,
  uploadCVText,
  uploadCVFile,
} from "@/lib/api";
import { takePendingCvFile } from "@/lib/pendingCv";
import { HORIZON_OPTIONS, daysUntil } from "@/lib/plans";
import type { CreateSearchProfilePayload } from "@/lib/types";

export default function BillingSuccessPage() {
  const t = useTranslations("billing");
  const tp = useTranslations("pricing");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });

  const knownHorizon = HORIZON_OPTIONS.find((o) => o.horizon === me?.plan_horizon);
  const horizonLabel = knownHorizon ? tp(`horizon${knownHorizon.messageKey}Name`) : null;
  const daysLeft = daysUntil(me?.plan_ends_at);

  useEffect(() => {
    // Invalidate cached plan info so the new pass shows up immediately
    queryClient.invalidateQueries({ queryKey: ["me"] });
    queryClient.invalidateQueries({ queryKey: ["plan-limits"] });

    // Create the search profile saved during onboarding, trimmed to what the pass allows
    const pendingProfileRaw = sessionStorage.getItem("onboarding_pending_profile");
    if (pendingProfileRaw) {
      (async () => {
        try {
          const payload: CreateSearchProfilePayload = JSON.parse(pendingProfileRaw);
          const limits = await getLimits();
          const profile = await createSearchProfile({
            ...payload,
            job_titles: payload.job_titles.slice(0, limits.max_job_titles_per_profile),
            locations: payload.locations.slice(0, limits.max_locations_per_profile),
          });
          // The CV was parked before leaving for Stripe, since uploading it needs
          // a profile that only exists now.
          const cvText = sessionStorage.getItem("onboarding_cv_text");
          const cvFile = takePendingCvFile();
          try {
            if (cvFile) await uploadCVFile(cvFile, String(profile.id));
            else if (cvText) await uploadCVText(cvText, "resume.txt", String(profile.id));
          } catch {
            // Non-fatal — the user can upload the CV from the profile page
          }
          sessionStorage.removeItem("onboarding_cv_text");
          queryClient.invalidateQueries({ queryKey: ["search-profiles"] });
        } catch {
          // Non-fatal — the user can create the profile from the dashboard
        } finally {
          sessionStorage.removeItem("onboarding_pending_profile");
        }
      })();
    }

    // Apply job titles saved during onboarding (free users who later bought a pass)
    const pendingProfileId = sessionStorage.getItem("onboarding_profile_id");
    const pendingJobTitles = sessionStorage.getItem("onboarding_job_titles");
    if (pendingProfileId && pendingJobTitles) {
      (async () => {
        try {
          const jobTitles: string[] = JSON.parse(pendingJobTitles);
          const limits = await getLimits();
          await updateSearchProfile(pendingProfileId, {
            job_titles: jobTitles.slice(0, limits.max_job_titles_per_profile),
          });
          queryClient.invalidateQueries({ queryKey: ["search-profiles"] });
        } catch {
          // Non-fatal — the user can edit the profile manually
        } finally {
          sessionStorage.removeItem("onboarding_profile_id");
          sessionStorage.removeItem("onboarding_job_titles");
        }
      })();
    }

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
          <p className="text-on-surface-variant mb-2">{t("successDesc")}</p>
          <p className="text-xs text-on-surface-variant mb-8">{t("successRedirect")}</p>

          {/* Pass badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-8">
            <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-on-primary rounded-full uppercase tracking-widest">
              {horizonLabel ?? t("passActivated")}
            </span>
            {daysLeft !== null && (
              <span className="text-sm font-semibold text-on-surface">
                {t("passDaysRemaining", { days: daysLeft })}
              </span>
            )}
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
