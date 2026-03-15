"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getJobs, getSearchProfiles } from "@/lib/api";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import type { Job } from "@/lib/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function JobDetailModal({
  job,
  onClose,
}: {
  job: Job;
  onClose: () => void;
}) {
  const t = useTranslations("jobs");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col bg-bg-card overflow-auto"
        style={{
          width: "min(720px, 95vw)",
          maxHeight: "88vh",
          border: "2px solid #000000",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-5"
          style={{ borderBottom: "2px solid #000000" }}
        >
          <h2 className="text-base font-bold font-heading text-text-primary">
            {t("jobDetails")}
          </h2>
          <button
            onClick={onClose}
            className="text-lg font-bold font-mono text-text-secondary hover:text-text-primary"
          >
            {t("close")}
          </button>
        </div>

        <div className="flex flex-col gap-6 p-8 overflow-auto">
          {/* Job title + meta */}
          <div className="flex flex-col gap-2">
            <h3 className="text-xl font-bold font-heading text-text-primary">{job.title}</h3>
            <p className="text-sm font-heading text-text-secondary">
              {job.company} · {job.location}
            </p>
            <div className="flex gap-2 flex-wrap mt-1">
              {job.job_type && (
                <span
                  className="px-3 py-1 text-xs font-bold font-mono"
                  style={{ backgroundColor: "#4CAF50", color: "#fff" }}
                >
                  {job.job_type}
                </span>
              )}
              {job.is_remote && (
                <span
                  className="px-3 py-1 text-xs font-bold font-mono"
                  style={{ backgroundColor: "#1E88E5", color: "#fff" }}
                >
                  {t("remote")}
                </span>
              )}
              <span className="text-sm font-heading text-text-muted">
                {new Date(job.date_sent).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Match score */}
          <div
            className="flex items-center gap-4 p-4"
            style={{ border: "2px solid #E0E0E0" }}
          >
            <div className="flex flex-col gap-1 flex-1">
              <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
                {t("matchScore")}
              </span>
              <div className="flex items-center gap-3">
                <ScoreBadge score={job.match_score} />
                <div
                  className="flex-1 h-2 rounded-sm overflow-hidden"
                  style={{ backgroundColor: "#E0E0E0" }}
                >
                  <div
                    className="h-full rounded-sm transition-all"
                    style={{
                      width: `${job.match_score}%`,
                      backgroundColor:
                        job.match_score >= 60
                          ? "#4CAF50"
                          : job.match_score >= 40
                          ? "#FFC107"
                          : "#E53935",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
                {t("matchedSkills")}
              </span>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 text-xs font-mono font-bold"
                    style={{
                      backgroundColor:
                        job.match_score >= 60 ? "#E8F5E9" : "#E3F2FD",
                      color: job.match_score >= 60 ? "#1B5E20" : "#0D47A1",
                      border: `1px solid ${job.match_score >= 60 ? "#A5D6A7" : "#90CAF9"}`,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
                {t("jobDescription")}
              </span>
              <div
                className="text-sm font-heading text-text-secondary leading-relaxed whitespace-pre-wrap"
              >
                {job.description}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-8 py-5 mt-auto"
          style={{ borderTop: "2px solid #000000" }}
        >
          <a
            href={job.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-2.5 text-sm font-bold font-heading text-white bg-accent-red border-2 border-border-color hover:opacity-90 transition-opacity"
          >
            {t("applyNow")}
          </a>
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold font-heading text-text-secondary border-2 border-border-light hover:border-border-color transition-colors"
          >
            {t("notInterested")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobHistoryPage() {
  const t = useTranslations("jobs");
  const searchParams = useSearchParams();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [profileFilter, setProfileFilter] = useState(
    searchParams.get("search_config_id") || ""
  );
  const [scoreFilter, setScoreFilter] = useState<number>(0);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: getSearchProfiles,
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["jobs", profileFilter, scoreFilter],
    queryFn: () =>
      getJobs({
        min_score: scoreFilter || undefined,
        search_config_id: profileFilter || undefined,
        limit: 50,
      }),
  });

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("pageTitle")} />

      <main className="flex flex-col gap-6 p-8">
        <div>
          <h2 className="text-xl font-bold font-heading text-text-primary">{t("pageTitle")}</h2>
          <p className="text-sm font-heading text-text-secondary mt-1">{t("pageSubtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            className="h-10 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none min-w-40"
          >
            <option value="">{t("filterProfile")}</option>
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(Number(e.target.value))}
            className="h-10 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none"
          >
            <option value={0}>{t("filterScore")}</option>
            <option value={60}>≥ 60%</option>
            <option value={40}>≥ 40%</option>
          </select>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div
            className="flex flex-col items-center gap-4 py-20 bg-bg-card"
            style={{ border: "2px dashed #E0E0E0" }}
          >
            <div
              className="w-16 h-16 flex items-center justify-center"
              style={{ backgroundColor: "#FAFAFA", border: "2px solid #E0E0E0" }}
            >
              <svg width="28" height="28" fill="none" stroke="#999" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              </svg>
            </div>
            <p className="text-base font-bold font-heading text-text-primary">{t("noJobs")}</p>
            <p className="text-sm font-heading text-text-secondary text-center max-w-sm">{t("noJobsHint")}</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ backgroundColor: "#000000" }}>
                  {[t("colTitle"), t("colLocation"), t("colScore"), t("colDateSent"), t("colAction")].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3 text-left text-xs font-bold font-mono text-white uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job, idx) => (
                  <tr
                    key={job.id}
                    style={{
                      backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
                      borderBottom: "1px solid #E0E0E0",
                    }}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold font-heading text-text-primary">{job.title}</p>
                      <p className="text-xs font-heading text-text-secondary mt-0.5">{job.company}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-heading text-text-secondary">
                      {job.location}
                    </td>
                    <td className="px-5 py-4">
                      <ScoreBadge score={job.match_score} />
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-text-secondary">
                      {new Date(job.date_sent).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedJob(job)}
                        className="px-4 py-1.5 text-xs font-bold font-heading text-white bg-accent-blue border-2 border-border-color hover:opacity-90 transition-opacity"
                      >
                        {t("view")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
