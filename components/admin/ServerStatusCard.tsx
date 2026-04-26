"use client";

import type { AdminServerStatus } from "@/lib/types";

function ProgressBar({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const pct = Math.min((value / max) * 100, 100);
  const color =
    pct >= 85 ? "bg-error" : pct >= 65 ? "bg-tertiary" : "bg-secondary";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold font-display text-on-surface-variant uppercase tracking-wide">
          {label}
        </span>
        <span className="text-xs font-bold font-display text-on-surface">
          {value.toFixed(1)}{unit} / {max.toFixed(1)}{unit} &nbsp;
          <span className={`${pct >= 85 ? "text-error" : pct >= 65 ? "text-tertiary" : "text-secondary"}`}>
            {pct.toFixed(0)}%
          </span>
        </span>
      </div>
      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface ServerStatusCardProps {
  server: AdminServerStatus;
}

export function ServerStatusCard({ server }: ServerStatusCardProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[var(--shadow-card)] space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold font-display text-on-surface uppercase tracking-widest">
          Server Resources
        </h3>
        <div className="flex items-center gap-2 text-xs font-semibold font-display text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] text-on-surface-variant/50"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
            computer
          </span>
          PID {server.process.pid} · {server.process.threads} threads · {server.process.memory_mb.toFixed(0)} MB
        </div>
      </div>

      <ProgressBar
        label="CPU"
        value={server.cpu_percent}
        max={100}
        unit="%"
      />
      <ProgressBar
        label="Memory"
        value={server.memory.used_gb}
        max={server.memory.total_gb}
        unit=" GB"
      />
      <ProgressBar
        label="Disk"
        value={server.disk.used_gb}
        max={server.disk.total_gb}
        unit=" GB"
      />
    </div>
  );
}
