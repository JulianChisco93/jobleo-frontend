"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getSearchProfiles } from "@/lib/api";
import { usePlanLimits } from "@/lib/hooks/usePlanLimits";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import Link from "next/link";

const PROFILE_ICONS = ["terminal", "work", "code"];
const PROFILE_ACCENTS = ["border-secondary", "border-primary-container", "border-tertiary-container"];

export default function ProfilesPage() {
  const t = useTranslations("profiles");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: getSearchProfiles,
  });

  const { limits } = usePlanLimits();
  const atMax = profiles.length >= limits.max_profiles;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("pageTitle")} />

      <main className="max-w-6xl mx-auto w-full px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-on-surface">{t("pageTitle")}</h2>
            <p className="text-on-surface-variant mt-1">{t("pageSubtitle")}</p>
          </div>
          <div className="relative group">
            <Link
              href={atMax ? "#" : `${prefix}/dashboard/profiles/new`}
              aria-disabled={atMax}
              onClick={(e) => atMax && e.preventDefault()}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                atMax
                  ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-60"
                  : "bg-primary text-on-primary hover:bg-primary-container active:scale-95"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              New Profile
            </Link>
            {atMax && (
              <div className="absolute top-full right-0 mt-2 px-3 py-2 text-xs text-inverse-on-surface bg-inverse-surface rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {t("maxProfilesReached")}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-16 flex flex-col items-center shadow-[var(--shadow-card)]">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl text-outline">person_search</span>
            </div>
            <p className="font-display font-bold text-lg text-on-surface mb-4">No profiles yet</p>
            <Link
              href={`${prefix}/dashboard/profiles/new`}
              className="px-8 py-3 bg-primary-gradient text-on-primary rounded-xl font-bold text-sm active:scale-95 transition-transform"
            >
              Create First Profile
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile, idx) => (
              <Link
                key={profile.id}
                href={`${prefix}/dashboard/profiles/${profile.id}`}
                className={`bg-surface-container-lowest rounded-xl p-6 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-ambient)] transition-all border-l-4 ${PROFILE_ACCENTS[idx % PROFILE_ACCENTS.length]}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-secondary-container rounded-xl flex items-center justify-center text-on-secondary-container">
                    <span
                      className="material-symbols-outlined text-[22px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {PROFILE_ICONS[idx % PROFILE_ICONS.length]}
                    </span>
                  </div>
                  <span
                    className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${
                      profile.is_active ? "text-secondary" : "text-outline"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${profile.is_active ? "bg-secondary" : "bg-outline"}`}
                    />
                    {profile.is_active ? "Active" : "Paused"}
                  </span>
                </div>

                <h4 className="font-display font-bold text-on-surface mb-1 truncate">{profile.name}</h4>
                <p className="text-xs text-on-surface-variant mb-3">{profile.profession}</p>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {profile.job_titles.slice(0, 3).map((title) => (
                    <span key={title} className="tag-chip">{title}</span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-1 pt-3 border-t border-outline-variant/20">
                  {profile.locations.slice(0, 2).map((loc) => (
                    <span key={loc} className="text-[10px] text-on-surface-variant font-medium flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">location_on</span>
                      {loc}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
