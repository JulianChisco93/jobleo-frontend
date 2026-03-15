"use client";

import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getSearchProfiles, getJobs } from "@/lib/api";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import Link from "next/link";
import { useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div
      className="flex flex-col gap-2 p-6 bg-bg-card flex-1"
      style={{ border: "2px solid #000000" }}
    >
      <span className="text-xs font-bold tracking-widest font-mono text-text-muted uppercase">
        {title}
      </span>
      <span
        className="text-4xl font-bold font-mono"
        style={{ color: color || "#000000" }}
      >
        {value}
      </span>
    </div>
  );
}

const PROFILE_COLORS = ["#E53935", "#1E88E5", "#FFC107"];

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

  const activeProfiles = profiles.filter((p) => p.is_active);
  const lastSearched = profiles.reduce(
    (acc, p) => (p.updated_at > acc ? p.updated_at : acc),
    ""
  );

  function formatLastSearched(dateStr: string) {
    if (!dateStr) return "—";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  }

  const atMax = profiles.length >= 3;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("title")} userName={userName} />

      <main className="flex flex-col gap-8 p-8">
        {/* Welcome Banner */}
        <div
          className="flex items-center justify-between px-8 py-6"
          style={{ backgroundColor: "#E53935" }}
        >
          <div>
            <h2 className="text-xl font-bold font-heading text-white">
              {t("welcome", { name: userName })}
            </h2>
            <p className="text-sm font-heading text-white opacity-85 mt-1">
              {t("welcomeSubtitle")}
            </p>
          </div>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" opacity="0.7">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        </div>

        {/* Stats */}
        <div className="flex gap-6">
          <StatCard
            title={t("activeJobsTitle")}
            value={jobs.length}
            color="#000000"
          />
          <StatCard
            title={t("activeProfilesTitle")}
            value={activeProfiles.length}
            color="#000000"
          />
          <StatCard
            title={t("lastSearchedTitle")}
            value={formatLastSearched(lastSearched)}
            color="#FFC107"
          />
        </div>

        {/* Search Profiles */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold font-heading text-text-primary">
              {t("activeSearchProfiles")}
            </h3>
            <div className="relative group">
              <Link
                href={atMax ? "#" : `${prefix}/dashboard/profiles/new`}
                className="px-5 py-2 text-sm font-bold font-heading border-2 transition-colors"
                style={{
                  backgroundColor: atMax ? "#E0E0E0" : "#1E88E5",
                  color: atMax ? "#999999" : "#ffffff",
                  borderColor: atMax ? "#E0E0E0" : "#000000",
                  pointerEvents: atMax ? "none" : "auto",
                }}
                aria-disabled={atMax}
                onClick={(e) => atMax && e.preventDefault()}
              >
                {t("addProfile")}
              </Link>
              {atMax && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 text-xs font-heading text-white bg-text-primary opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap"
                >
                  {t("addProfileTooltip")}
                </div>
              )}
            </div>
          </div>

          {profiles.length === 0 ? (
            <div
              className="flex flex-col items-center gap-4 py-16 bg-bg-card"
              style={{ border: "2px solid #E0E0E0" }}
            >
              <div className="w-16 h-16 flex items-center justify-center" style={{ backgroundColor: "#FAFAFA", border: "2px solid #E0E0E0" }}>
                <svg width="28" height="28" fill="none" stroke="#999" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <p className="text-base font-bold font-heading text-text-primary">
                {t("noProfiles")}
              </p>
              <p className="text-sm font-heading text-text-secondary text-center max-w-sm">
                {t("noProfilesHint")}
              </p>
              <Link
                href={`${prefix}/dashboard/profiles/new`}
                className="px-6 py-2.5 text-sm font-bold font-heading text-white bg-accent-red border-2 border-border-color"
              >
                {t("createFirstProfile")}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {profiles.map((profile, idx) => (
                <Link
                  key={profile.id}
                  href={`${prefix}/dashboard/profiles/${profile.id}`}
                  className="flex items-center justify-between px-6 py-4 bg-bg-card hover:bg-bg-page transition-colors"
                  style={{ border: "2px solid #000000" }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-1 h-10 rounded-sm"
                      style={{ backgroundColor: PROFILE_COLORS[idx % PROFILE_COLORS.length] }}
                    />
                    <div>
                      <p className="text-sm font-bold font-heading text-text-primary">
                        {profile.name}
                      </p>
                      <p className="text-xs font-heading text-text-muted mt-0.5">
                        {profile.job_titles.slice(0, 3).join(" · ")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-mono text-text-muted">
                        {t("lastRun")}
                      </p>
                      <p className="text-xs font-mono text-text-secondary">
                        {formatLastSearched(profile.updated_at)}
                      </p>
                    </div>
                    <Link
                      href={`${prefix}/dashboard/jobs?search_config_id=${profile.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="px-4 py-1.5 text-xs font-bold font-heading text-white border-2 transition-colors hover:opacity-80"
                      style={{
                        backgroundColor: PROFILE_COLORS[idx % PROFILE_COLORS.length],
                        borderColor: "#000000",
                      }}
                    >
                      {t("viewJobs")}
                    </Link>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
