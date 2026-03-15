"use client";

import React from "react";
import { useTranslations, useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { getJob } from "@/lib/api";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { ScoreBadge } from "@/components/ui/ScoreBadge";
import { useRouter } from "next/navigation";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = useTranslations("jobs");
  const router = useRouter();
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const [resolvedId, setResolvedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    params.then(({ id }) => setResolvedId(id));
  }, [params]);

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", resolvedId],
    queryFn: () => getJob(resolvedId!),
    enabled: !!resolvedId,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1">
        <DashboardTopBar title={t("jobDetails")} />
        <div className="flex items-center justify-center flex-1">
          <div className="w-6 h-6 border-2 border-accent-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("jobDetails")} />

      <main className="p-8 max-w-3xl">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-heading text-text-secondary hover:text-text-primary mb-6"
        >
          ← Back
        </button>

        <div
          className="flex flex-col gap-6 p-8 bg-bg-card"
          style={{ border: "2px solid #000000" }}
        >
          <div>
            <h1 className="text-2xl font-bold font-heading text-text-primary">{job.title}</h1>
            <p className="text-base font-heading text-text-secondary mt-1">
              {job.company} · {job.location}
            </p>
            <div className="flex gap-2 flex-wrap mt-3">
              {job.job_type && (
                <span className="px-3 py-1 text-xs font-bold font-mono bg-accent-green text-white">
                  {job.job_type}
                </span>
              )}
              {job.is_remote && (
                <span className="px-3 py-1 text-xs font-bold font-mono bg-accent-blue text-white">
                  {t("remote")}
                </span>
              )}
              <span className="text-sm font-heading text-text-muted">
                {new Date(job.date_sent).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Match Score */}
          <div className="flex items-center gap-4 p-4" style={{ border: "2px solid #E0E0E0" }}>
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
                {t("matchScore")}
              </span>
              <div className="flex items-center gap-3">
                <ScoreBadge score={job.match_score} />
                <div className="flex-1 h-2 rounded-sm overflow-hidden" style={{ backgroundColor: "#E0E0E0" }}>
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${job.match_score}%`,
                      backgroundColor: job.match_score >= 60 ? "#4CAF50" : job.match_score >= 40 ? "#FFC107" : "#E53935",
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
                    style={{ backgroundColor: "#E8F5E9", color: "#1B5E20", border: "1px solid #A5D6A7" }}
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
              <div className="text-sm font-heading text-text-secondary leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4" style={{ borderTop: "2px solid #E0E0E0" }}>
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 text-sm font-bold font-heading text-white bg-accent-red border-2 border-border-color hover:opacity-90 transition-opacity"
            >
              {t("applyNow")}
            </a>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-bold font-heading text-text-secondary border-2 border-border-light hover:border-border-color transition-colors"
            >
              {t("notInterested")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
