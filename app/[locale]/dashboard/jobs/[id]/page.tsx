"use client";

import React from "react";
import { useTranslations } from "next-intl";
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
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
          className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface mb-6 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back
        </button>

        <div className="flex flex-col gap-6 p-8 bg-surface-container-lowest rounded-2xl shadow-[var(--shadow-card)]">
          <div>
            <h1 className="text-2xl font-display font-bold text-on-surface">{job.title}</h1>
            <p className="text-base text-on-surface-variant mt-1">{job.company} · {job.location}</p>
            <div className="flex gap-2 flex-wrap mt-3">
              {job.job_type && (
                <span className="px-3 py-1 text-xs font-bold bg-secondary-container text-on-secondary-container rounded-full">
                  {job.job_type}
                </span>
              )}
              {job.is_remote && (
                <span className="px-3 py-1 text-xs font-bold bg-primary-fixed text-on-primary-fixed rounded-full">
                  {t("remote")}
                </span>
              )}
              <span className="text-sm text-on-surface-variant self-center">
                {new Date(job.date_sent).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Match Score */}
          <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                {t("matchScore")}
              </span>
              <div className="flex items-center gap-3">
                <ScoreBadge score={job.match_score} />
                <div className="progress-track flex-1">
                  <div className="progress-fill" style={{ width: `${job.match_score}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                {t("matchedSkills")}
              </span>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="tag-chip">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {job.description && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                {t("jobDescription")}
              </span>
              <div className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                {job.description}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/20">
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-lg active:scale-95 transition-transform"
            >
              {t("applyNow")}
            </a>
            <button
              onClick={() => router.back()}
              className="px-6 py-2.5 text-sm font-bold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
            >
              {t("notInterested")}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
