"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getJobs, getSearchProfiles } from "@/lib/api";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import type { Job } from "@/lib/types";
import { useSearchParams } from "next/navigation";

function JobDetailModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const t = useTranslations("jobs");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col bg-surface-container-lowest rounded-2xl overflow-hidden shadow-[var(--shadow-modal)]"
        style={{ width: "min(720px, 95vw)", maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-outline-variant/20">
          <h2 className="font-display font-bold text-on-surface">{t("jobDetails")}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-low text-on-surface-variant hover:bg-surface-container flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex flex-col gap-6 p-8 overflow-auto">
          {/* Title + meta */}
          <div>
            <h3 className="text-xl font-display font-bold text-on-surface mb-1">{job.title}</h3>
            <p className="text-on-surface-variant mb-3">{job.company} · {job.location}</p>
            <div className="flex gap-2 flex-wrap">
              {job.is_remote && (
                <span className="px-3 py-1 text-xs font-bold bg-primary-fixed text-on-primary-fixed rounded-full">
                  {t("remote")}
                </span>
              )}
              <span className="text-xs text-on-surface-variant self-center">
                {formatDate(job.date_scraped)}
              </span>
            </div>
          </div>

          {/* Match score */}
          <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                {t("matchScore")}
              </span>
              <div className="flex items-center gap-3">
                <ScoreBadge score={job.score} />
                <div className="progress-track flex-1">
                  <div className="progress-fill" style={{ width: `${(job.score / 35) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Matched Keywords */}
          {job.matched_keywords && job.matched_keywords.length > 0 && (
            <div>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest block mb-3">
                {t("matchedSkills")}
              </span>
              <div className="flex flex-wrap gap-2">
                {job.matched_keywords.map((kw) => (
                  <span key={kw} className="tag-chip">{kw}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-outline-variant/20 mt-auto">
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            {t("applyNow")}
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
          >
            {t("notInterested")}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  // Normalize space-separated datetime to ISO format (e.g. "2024-01-15 10:30:00" → "2024-01-15T10:30:00")
  const normalized = dateStr.replace(" ", "T");
  const d = new Date(normalized);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
}

export default function JobHistoryPage() {
  const t = useTranslations("jobs");
  const searchParams = useSearchParams();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [profileFilter, setProfileFilter] = useState(searchParams.get("search_config_id") || "");

  const { data: profiles = [] } = useQuery({ queryKey: ["profiles"], queryFn: getSearchProfiles });
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", profileFilter],
    queryFn: () => getJobs({ search_config_id: profileFilter || undefined, limit: 50 }),
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("pageTitle")} />

      <main className="max-w-6xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-on-surface">{t("pageTitle")}</h2>
          <p className="text-on-surface-variant mt-1">{t("pageSubtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary min-w-40"
          >
            <option value="">{t("filterProfile")}</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-xl p-16 flex flex-col items-center shadow-[var(--shadow-card)]">
            <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-3xl text-outline">work_history</span>
            </div>
            <p className="font-display font-bold text-lg text-on-surface mb-2">{t("noJobs")}</p>
            <p className="text-on-surface-variant text-sm text-center max-w-sm">{t("noJobsHint")}</p>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
            {/* Table header */}
            <div className="grid grid-cols-[2fr_1fr_auto_auto_auto] gap-4 px-6 py-3 bg-surface-container-low">
              {[t("colTitle"), t("colLocation"), t("colScore"), t("colDateSent"), t("colAction")].map((col) => (
                <span key={col} className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  {col}
                </span>
              ))}
            </div>
            {/* Rows */}
            {jobs.map((job) => (
              <div
                key={job.id}
                className="grid grid-cols-[2fr_1fr_auto_auto_auto] gap-4 px-6 py-4 border-t border-outline-variant/10 hover:bg-surface-container-low/50 transition-colors items-center"
              >
                <div>
                  <p className="font-display font-bold text-sm text-on-surface">{job.title}</p>
                  <p className="text-xs text-on-surface-variant mt-0.5">{job.company}</p>
                </div>
                <p className="text-sm text-on-surface-variant">{job.location}</p>
                <ScoreBadge score={job.score} />
                <p className="text-xs text-on-surface-variant">{formatDate(job.date_scraped)}</p>
                <button
                  onClick={() => setSelectedJob(job)}
                  className="px-3 py-1.5 text-xs font-bold text-primary border border-primary-container rounded-lg hover:bg-primary-fixed transition-colors"
                >
                  {t("view")}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedJob && <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  );
}
