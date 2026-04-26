"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAdminMetrics, getAdminServer } from "@/lib/api";
import { MetricCards } from "@/components/admin/MetricCards";
import { ServerStatusCard } from "@/components/admin/ServerStatusCard";
import { useToast } from "@/components/ui/Toast";

export default function AdminOverviewPage() {
  const { addToast } = useToast();

  const {
    data: metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: getAdminMetrics,
    refetchInterval: 60_000,
  });

  const {
    data: server,
    isLoading: serverLoading,
    error: serverError,
  } = useQuery({
    queryKey: ["admin-server"],
    queryFn: getAdminServer,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (metricsError) {
      const msg = metricsError instanceof Error ? metricsError.message : "Failed to load metrics";
      addToast(msg, "error");
    }
  }, [metricsError, addToast]);

  useEffect(() => {
    if (serverError) {
      const msg = serverError instanceof Error ? serverError.message : "Failed to load server status";
      addToast(msg, "error");
    }
  }, [serverError, addToast]);

  const isLoading = metricsLoading || serverLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-display text-on-surface">Overview</h1>
        <p className="text-sm text-on-surface-variant font-display mt-0.5">
          Real-time metrics and server health
        </p>
      </div>

      {/* Metric cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-xl p-5 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : metrics ? (
        <MetricCards
          metrics={metrics}
          uptimeSeconds={server?.uptime_seconds}
          serverStatus={server?.status}
        />
      ) : null}

      {/* Server resources */}
      {server ? (
        <div>
          <h2 className="text-sm font-bold font-display text-on-surface-variant uppercase tracking-widest mb-3">
            Server Resources
          </h2>
          <div className="max-w-2xl">
            <ServerStatusCard server={server} />
          </div>
        </div>
      ) : !serverLoading ? null : (
        <div className="max-w-2xl bg-surface-container-lowest rounded-xl p-5 h-40 animate-pulse" />
      )}

      {/* Timestamp */}
      {metrics && (
        <p className="text-xs text-on-surface-variant/60 font-display">
          Last updated: {new Date(metrics.timestamp).toLocaleString()}
          &nbsp;· Auto-refreshes every 60s
        </p>
      )}
    </div>
  );
}
