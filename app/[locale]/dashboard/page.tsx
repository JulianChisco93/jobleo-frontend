"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getSearchProfiles, getJobs, getMe } from "@/lib/api";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import Link from "next/link";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { formatLastSearched } from "@/lib/utils";
import { usePlanLimits } from "@/lib/hooks/usePlanLimits";

const PROFILE_ICONS = ["terminal", "work", "code"];
const PROFILE_ACCENTS = [
  "border-secondary",
  "border-primary-container",
  "border-tertiary-container",
];

function StatCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="bg-surface-container-low px-3 py-4 md:px-6 md:py-5 rounded-xl flex flex-col items-center flex-1 min-w-0">
      <span
        className={`text-2xl md:text-3xl font-black font-display ${accent ?? "text-primary"}`}
      >
        {value}
      </span>
      <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
        {title}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserName(
          user.user_metadata?.display_name ||
            user.email?.split("@")[0] ||
            "User"
        );
      }
    });
  }, []);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: getSearchProfiles,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: () => getJobs({ limit: 50 }),
  });

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const { limits } = usePlanLimits();

  const activeProfiles = profiles.filter((p) => p.is_active);
  const lastSearched = profiles.reduce(
    (acc, p) => (p.updated_at > acc ? p.updated_at : acc),
    ""
  );
  const atMax = profiles.length >= limits.max_profiles;
  const showWhatsAppBanner = !!me && !me?.whatsapp_number;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("title")} userName={userName} />

      <main className="max-w-6xl mx-auto w-full px-4 md:px-6 py-6 md:py-10">
        {/* WhatsApp missing banner */}
        {showWhatsAppBanner && (
          <Link href={`${prefix}/dashboard/settings`} className="flex items-center gap-3 mb-6 px-4 py-3 bg-secondary-container text-on-secondary-container rounded-xl text-sm font-medium hover:bg-secondary-container/80 transition-colors">
            <span className="material-symbols-outlined text-[18px] flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>whatsapp</span>
            <span className="flex-1">{t("whatsappMissingBanner")}</span>
            <span className="text-xs font-bold uppercase tracking-wider opacity-70">{t("whatsappMissingCta")}</span>
          </Link>
        )}

        {/* Welcome banner */}
        <section className="mb-8 md:mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-4xl font-display font-extrabold text-on-surface tracking-tight mb-2">
                {t("welcome", { name: userName })}
              </h1>
              <p className="text-on-surface-variant max-w-lg">
                {t("welcomeSubtitle")}
              </p>
            </div>
            <div className="flex gap-2 md:gap-4 w-full md:w-auto">
              <StatCard
                title={t("activeJobsTitle")}
                value={jobs.length}
                accent="text-primary"
              />
              <StatCard
                title={t("activeProfilesTitle")}
                value={activeProfiles.length}
                accent="text-secondary"
              />
              <StatCard
                title={t("lastSearchedTitle")}
                value={formatLastSearched(lastSearched)}
                accent="text-tertiary"
              />
            </div>
          </div>
        </section>

        {/* Active Search Profiles */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-xl text-on-surface flex items-center gap-2">
              {t("activeSearchProfiles")}
              <span className="text-xs bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold">
                {profiles.length}/{limits.max_profiles}
              </span>
            </h3>
            <div className="relative group">
              <Link
                href={atMax ? "#" : `${prefix}/dashboard/profiles/new`}
                aria-disabled={atMax}
                onClick={(e) => atMax && e.preventDefault()}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  atMax
                    ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-60"
                    : "bg-primary text-on-primary hover:bg-primary-container active:scale-95"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                {t("addProfile")}
              </Link>
              {atMax && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 text-xs text-inverse-on-surface bg-inverse-surface rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                  {t("addProfileTooltip")}
                </div>
              )}
            </div>
          </div>

          {profiles.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-16 flex flex-col items-center shadow-[var(--shadow-card)]">
              <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-3xl text-outline">search</span>
              </div>
              <p className="font-display font-bold text-lg text-on-surface mb-2">
                {t("noProfiles")}
              </p>
              <p className="text-on-surface-variant text-sm text-center max-w-sm mb-6">
                {t("noProfilesHint")}
              </p>
              <Link
                href={`${prefix}/dashboard/profiles/new`}
                className="px-8 py-3 bg-primary-gradient text-on-primary rounded-xl font-bold text-sm shadow-[var(--shadow-ambient)] active:scale-95 transition-transform"
              >
                {t("createFirstProfile")}
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
                      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${
                        profile.is_active ? "text-secondary" : "text-outline"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${profile.is_active ? "bg-secondary" : "bg-outline"}`}
                      />
                      {profile.is_active ? "Active" : "Paused"}
                    </span>
                  </div>

                  <h4 className="font-display font-bold text-on-surface mb-1 truncate">
                    {profile.name}
                  </h4>
                  <p className="text-xs text-on-surface-variant mb-4 line-clamp-1">
                    {profile.job_titles.slice(0, 3).join(" · ")}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
                    <div>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                        {t("lastRun")}
                      </p>
                      <p className="text-xs font-semibold text-on-surface">
                        {formatLastSearched(profile.updated_at)}
                      </p>
                    </div>
                    <Link
                      href={`${prefix}/dashboard/jobs?search_config_id=${profile.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1.5 text-xs font-bold text-secondary border border-secondary-container rounded-lg hover:bg-secondary-container transition-colors"
                    >
                      {t("viewJobs")}
                    </Link>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
