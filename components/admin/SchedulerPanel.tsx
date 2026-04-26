"use client";

import type { SchedulerStatusResponse } from "@/lib/types";

function relativeTime(isoString: string): string {
  const diff = new Date(isoString).getTime() - Date.now();
  const abs = Math.abs(diff);
  const minutes = Math.floor(abs / 60_000);
  const hours = Math.floor(abs / 3_600_000);
  const days = Math.floor(abs / 86_400_000);

  if (diff < 0) {
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
  if (minutes < 60) return `in ${minutes}m`;
  if (hours < 24) return `in ${hours}h ${minutes % 60}m`;
  return `in ${days}d`;
}

interface SchedulerPanelProps {
  scheduler: SchedulerStatusResponse;
}

export function SchedulerPanel({ scheduler }: SchedulerPanelProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant/30 bg-surface-container/30">
        <h3 className="text-sm font-bold font-display text-on-surface uppercase tracking-widest">
          Scheduler
        </h3>
        <span
          className={`flex items-center gap-1.5 text-xs font-bold font-display px-2.5 py-1 rounded-full ${
            scheduler.status === "running"
              ? "bg-secondary-container text-on-secondary-container"
              : "bg-error-container text-on-error-container"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              scheduler.status === "running" ? "bg-secondary animate-pulse" : "bg-error"
            }`}
          />
          {scheduler.status === "running" ? "Running" : "Stopped"}
        </span>
      </div>

      <div className="divide-y divide-outline-variant/20">
        {scheduler.jobs.map((job) => (
          <div key={job.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-container/30 transition-colors">
            <div className="flex items-center gap-3">
              <span
                className="material-symbols-outlined text-[18px] text-on-surface-variant/60"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
              >
                schedule
              </span>
              <span className="text-sm font-semibold font-display text-on-surface">{job.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold font-display text-primary bg-primary-container/30 px-2 py-0.5 rounded-full whitespace-nowrap">
                {relativeTime(job.next_run_at)}
              </span>
              <span className="text-xs text-on-surface-variant/60 font-display hidden sm:block">
                {new Date(job.next_run_at).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
