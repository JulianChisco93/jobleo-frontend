"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getAdminServer, getSchedulerStatus, restartServer } from "@/lib/api";
import { ServerStatusCard } from "@/components/admin/ServerStatusCard";
import { SchedulerPanel } from "@/components/admin/SchedulerPanel";
import { ServerLogs } from "@/components/admin/ServerLogs";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

export default function AdminServerPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [showRestartConfirm, setShowRestartConfirm] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: server, isLoading: serverLoading, error: serverError, refetch: refetchServer } = useQuery({
    queryKey: ["admin-server"],
    queryFn: getAdminServer,
    refetchInterval: restarting ? false : 30_000,
  });

  const { data: scheduler, isLoading: schedulerLoading, error: schedulerError } = useQuery({
    queryKey: ["admin-scheduler"],
    queryFn: getSchedulerStatus,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (serverError) {
      const msg = serverError instanceof Error ? serverError.message : "Failed to load server status";
      if (msg.includes("403")) router.push("/dashboard");
      else addToast(msg, "error");
    }
  }, [serverError, addToast, router]);

  useEffect(() => {
    if (schedulerError) {
      const msg = schedulerError instanceof Error ? schedulerError.message : "Failed to load scheduler";
      addToast(msg, "error");
    }
  }, [schedulerError, addToast]);

  // Clean up poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function handleRestart() {
    setShowRestartConfirm(false);
    setRestarting(true);

    try {
      await restartServer();
    } catch {
      // Server returns restarting immediately then disconnects — ignore fetch errors here
    }

    // Poll every 3s up to 30s waiting for server to come back up
    let attempts = 0;
    const maxAttempts = 10;

    pollRef.current = setInterval(async () => {
      attempts++;
      try {
        const status = await getAdminServer();
        if (status?.status === "running") {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setRestarting(false);
          await queryClient.invalidateQueries({ queryKey: ["admin-server"] });
          addToast("Server restarted successfully", "success");
        }
      } catch {
        // Server not back yet — keep polling
      }

      if (attempts >= maxAttempts) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        setRestarting(false);
        addToast("Server restart timed out — check logs", "error");
      }
    }, 3_000);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black font-display text-on-surface">Server</h1>
          <p className="text-sm text-on-surface-variant font-display mt-0.5">
            System health, scheduler, and live logs
          </p>
        </div>

        {/* Restart button */}
        <button
          onClick={() => setShowRestartConfirm(true)}
          disabled={restarting}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-error text-error font-bold font-display text-sm hover:bg-error-container/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {restarting ? (
            <>
              <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
              Restarting...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: "'FILL' 0, 'wght' 500" }}>
                restart_alt
              </span>
              Restart Server
            </>
          )}
        </button>
      </div>

      {/* Restarting overlay notice */}
      {restarting && (
        <div className="bg-error-container/20 border border-error/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="material-symbols-outlined text-error text-[20px] animate-spin">autorenew</span>
          <div>
            <p className="text-sm font-bold font-display text-error">Restarting server…</p>
            <p className="text-xs text-on-surface-variant font-display">Polling every 3s, up to 30s</p>
          </div>
        </div>
      )}

      {/* Server status */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold font-display text-on-surface-variant uppercase tracking-widest">
          System Resources
        </h2>
        {serverLoading ? (
          <div className="max-w-2xl h-40 bg-surface-container-lowest rounded-xl animate-pulse" />
        ) : server ? (
          <div className="max-w-2xl">
            <ServerStatusCard server={server} />
          </div>
        ) : null}
      </section>

      {/* Scheduler */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold font-display text-on-surface-variant uppercase tracking-widest">
          Scheduled Jobs
        </h2>
        {schedulerLoading ? (
          <div className="h-40 bg-surface-container-lowest rounded-xl animate-pulse" />
        ) : scheduler ? (
          <SchedulerPanel scheduler={scheduler} />
        ) : null}
      </section>

      {/* Server logs */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold font-display text-on-surface-variant uppercase tracking-widest">
          Live Logs
        </h2>
        <ServerLogs />
      </section>

      {/* Confirm restart dialog */}
      <ConfirmDialog
        isOpen={showRestartConfirm}
        title="Restart Server"
        message="This will restart the server. Active searches will be interrupted. The server will be unavailable for up to 30 seconds. Are you sure?"
        confirmLabel="Yes, Restart"
        cancelLabel="Cancel"
        danger
        onConfirm={handleRestart}
        onCancel={() => setShowRestartConfirm(false)}
      />
    </div>
  );
}
