"use client";

import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getSearchProfiles } from "@/lib/api";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import Link from "next/link";

const COLORS = ["#E53935", "#1E88E5", "#FFC107"];

export default function ProfilesPage() {
  const t = useTranslations("profiles");
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: getSearchProfiles,
  });

  const atMax = profiles.length >= 3;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("pageTitle")} />

      <main className="flex flex-col gap-6 p-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-heading text-text-primary">{t("pageTitle")}</h2>
            <p className="text-sm font-heading text-text-secondary mt-1">{t("pageSubtitle")}</p>
          </div>
          <div className="relative group">
            <Link
              href={atMax ? "#" : `${prefix}/dashboard/profiles/new`}
              className="px-5 py-2.5 text-sm font-bold font-heading border-2 transition-colors"
              style={{
                backgroundColor: atMax ? "#E0E0E0" : "#1E88E5",
                color: atMax ? "#999999" : "#ffffff",
                borderColor: atMax ? "#E0E0E0" : "#000000",
                pointerEvents: atMax ? "none" : "auto",
              }}
              onClick={(e) => atMax && e.preventDefault()}
            >
              + {t("saveChanges").replace("Save Changes", "New Profile")}
            </Link>
            {atMax && (
              <div className="absolute top-full right-0 mt-2 px-3 py-2 text-xs font-heading text-white bg-text-primary opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                {t("maxProfilesReached")}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : profiles.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 py-16"
            style={{ border: "2px dashed #E0E0E0" }}
          >
            <p className="text-base font-bold font-heading text-text-primary">No profiles yet</p>
            <Link
              href={`${prefix}/dashboard/profiles/new`}
              className="px-6 py-2.5 text-sm font-bold font-heading text-white bg-accent-red border-2 border-border-color"
            >
              Create First Profile
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {profiles.map((profile, idx) => (
              <Link
                key={profile.id}
                href={`${prefix}/dashboard/profiles/${profile.id}`}
                className="flex items-center justify-between px-6 py-5 bg-bg-card hover:bg-bg-page transition-colors"
                style={{ border: "2px solid #000000" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-1.5 h-12 rounded-sm"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <div>
                    <p className="text-sm font-bold font-heading text-text-primary">{profile.name}</p>
                    <p className="text-xs font-heading text-text-muted mt-1">
                      {profile.profession} · {profile.locations.slice(0, 2).join(", ")}
                    </p>
                    <div className="flex gap-2 mt-1">
                      {profile.job_titles.slice(0, 3).map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 text-xs font-mono font-bold"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] + "22", color: COLORS[idx % COLORS.length], border: `1px solid ${COLORS[idx % COLORS.length]}` }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-3 py-1 text-xs font-bold font-mono"
                    style={{
                      backgroundColor: profile.is_active ? "#4CAF50" : "#E0E0E0",
                      color: profile.is_active ? "#fff" : "#777",
                    }}
                  >
                    {profile.is_active ? "Active" : "Paused"}
                  </span>
                  <svg width="16" height="16" fill="none" stroke="#777" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
