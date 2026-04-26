"use client";

import type { AdminMetrics } from "@/lib/types";

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

interface MetricCardsProps {
  metrics: AdminMetrics;
  uptimeSeconds?: number;
  serverStatus?: string;
}

interface CardProps {
  icon: string;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: "green" | "red" | "navy" | "default";
}

function Card({ icon, label, value, sub, accent = "default" }: CardProps) {
  const accentStyles: Record<string, string> = {
    green: "border-l-4 border-l-secondary bg-secondary-container/20",
    red: "border-l-4 border-l-error bg-error-container/30",
    navy: "border-l-4 border-l-primary bg-primary-container/20",
    default: "",
  };

  return (
    <div className={`bg-surface-container-lowest rounded-xl p-5 shadow-[var(--shadow-card)] ${accentStyles[accent]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest">
          {label}
        </span>
        <span
          className="material-symbols-outlined text-[20px] text-on-surface-variant/60"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
        >
          {icon}
        </span>
      </div>
      <div className="text-2xl font-black font-display text-on-surface">{value}</div>
      {sub && <div className="mt-1.5">{sub}</div>}
    </div>
  );
}

export function MetricCards({ metrics, uptimeSeconds, serverStatus }: MetricCardsProps) {
  const { mrr_usd, users, alerts, searches, recent_errors_in_log } = metrics;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* MRR */}
      <Card
        icon="payments"
        label="MRR"
        value={`$${mrr_usd.toFixed(2)}`}
        accent="green"
        sub={<span className="text-xs text-secondary font-semibold font-display">Monthly Revenue</span>}
      />

      {/* Total Users */}
      <Card
        icon="group"
        label="Users"
        value={users.total}
        sub={
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs font-semibold font-display text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded-full">
              {users.by_plan.free} free
            </span>
            <span className="text-xs font-semibold font-display text-on-primary bg-primary px-1.5 py-0.5 rounded-full">
              {users.by_plan.pro} pro
            </span>
            <span className="text-xs font-semibold font-display text-on-secondary bg-secondary px-1.5 py-0.5 rounded-full">
              {users.by_plan.premium} prem
            </span>
          </div>
        }
      />

      {/* Alerts Today */}
      <Card
        icon="notifications"
        label="Alerts Today"
        value={alerts.today}
        sub={<span className="text-xs text-on-surface-variant font-display">{alerts.this_week} this week</span>}
      />

      {/* Searches Today */}
      <Card
        icon="search"
        label="Searches Today"
        value={searches.today}
        sub={<span className="text-xs text-on-surface-variant font-display">{searches.this_week} this week</span>}
      />

      {/* Recent Errors */}
      <Card
        icon="error"
        label="Recent Errors"
        value={recent_errors_in_log}
        accent={recent_errors_in_log > 0 ? "red" : "default"}
        sub={
          recent_errors_in_log > 0 ? (
            <span className="text-xs text-error font-semibold font-display">Check server logs</span>
          ) : (
            <span className="text-xs text-secondary font-semibold font-display">All clear</span>
          )
        }
      />

      {/* Server Status */}
      <Card
        icon="dns"
        label="Server"
        accent="navy"
        value={
          <span className="flex items-center gap-2">
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${
                serverStatus === "running" ? "bg-secondary animate-pulse" : "bg-error"
              }`}
            />
            <span className="capitalize">{serverStatus ?? "—"}</span>
          </span>
        }
        sub={
          uptimeSeconds !== undefined ? (
            <span className="text-xs text-on-surface-variant font-display">
              Up {formatUptime(uptimeSeconds)}
            </span>
          ) : undefined
        }
      />
    </div>
  );
}
