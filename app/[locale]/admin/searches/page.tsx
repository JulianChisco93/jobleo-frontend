"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getSearchLogs } from "@/lib/api";
import { SearchLogsTable } from "@/components/admin/SearchLogsTable";
import { useToast } from "@/components/ui/Toast";

export default function AdminSearchesPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-search-logs"],
    queryFn: () => getSearchLogs(100),
  });

  useEffect(() => {
    if (!error) return;
    const msg = error instanceof Error ? error.message : "Failed to load search logs";
    if (msg.includes("403")) {
      router.push("/dashboard");
    } else {
      addToast(msg, "error");
    }
  }, [error, addToast, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-display text-on-surface">Search Logs</h1>
        <p className="text-sm text-on-surface-variant font-display mt-0.5">
          {data
            ? `${data.total_returned} most recent scraping runs`
            : "Scraping pipeline activity"}
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold font-display flex-wrap">
        <span className="text-on-surface-variant uppercase tracking-widest">Funnel:</span>
        <span className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="w-2.5 h-2.5 rounded-full bg-outline-variant inline-block" />
          Raw results
        </span>
        <span className="material-symbols-outlined text-[14px] text-outline-variant"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>chevron_right</span>
        <span className="flex items-center gap-1.5 text-primary">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          After filters
        </span>
        <span className="material-symbols-outlined text-[14px] text-outline-variant"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}>chevron_right</span>
        <span className="flex items-center gap-1.5 text-secondary">
          <span className="w-2.5 h-2.5 rounded-full bg-secondary inline-block" />
          New jobs inserted
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-12 bg-surface-container-lowest rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <SearchLogsTable logs={data.logs} />
      ) : null}
    </div>
  );
}
