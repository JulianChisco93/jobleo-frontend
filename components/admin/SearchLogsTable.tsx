"use client";

import { useState, useMemo } from "react";
import type { AdminSearchLog } from "@/lib/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface SearchLogsTableProps {
  logs: AdminSearchLog[];
}

export function SearchLogsTable({ logs }: SearchLogsTableProps) {
  const [userFilter, setUserFilter] = useState<string>("all");

  const uniqueEmails = useMemo(() => {
    const emails = Array.from(new Set(logs.map((l) => l.email))).sort();
    return emails;
  }, [logs]);

  const filtered = useMemo(() => {
    if (userFilter === "all") return logs;
    return logs.filter((l) => l.email === userFilter);
  }, [logs, userFilter]);

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest">
          Filter by user
        </label>
        <select
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
          className="text-sm font-display bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-3 py-1.5 text-on-surface cursor-pointer hover:bg-surface-container transition-colors"
        >
          <option value="all">All users ({logs.length})</option>
          {uniqueEmails.map((email) => (
            <option key={email} value={email}>
              {email} ({logs.filter((l) => l.email === email).length})
            </option>
          ))}
        </select>
        <span className="text-xs text-on-surface-variant font-display ml-auto">
          {filtered.length} results
        </span>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/50">
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest">Time</th>
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest hidden md:table-cell">User</th>
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest">Site</th>
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest hidden lg:table-cell">Search Term</th>
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest hidden xl:table-cell">Location</th>
                <th className="text-center px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest">Results</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-xs text-on-surface-variant font-display whitespace-nowrap">
                      {formatDateTime(log.ran_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-on-surface font-display">{log.email}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold font-display capitalize text-on-surface bg-surface-container px-2 py-0.5 rounded-full">
                      {log.site}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-on-surface font-display">{log.search_term}</span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs text-on-surface-variant font-display">{log.location}</span>
                  </td>
                  <td className="px-4 py-3">
                    {/* Funnel: raw → filtered → inserted */}
                    <div className="flex items-center justify-center gap-1 font-display text-xs font-bold whitespace-nowrap">
                      <span className="text-on-surface-variant" title="Raw results">
                        {log.results_raw}
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-outline-variant"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                        chevron_right
                      </span>
                      <span className="text-primary" title="After filters">
                        {log.results_after_filters}
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-outline-variant"
                        style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>
                        chevron_right
                      </span>
                      <span
                        className={log.new_jobs_inserted > 0 ? "text-secondary" : "text-outline-variant"}
                        title="New jobs inserted"
                      >
                        {log.new_jobs_inserted}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
