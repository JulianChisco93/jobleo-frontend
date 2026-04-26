"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getServerLogs } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";

function colorLine(line: string): string {
  if (line.includes("[ERROR]") || line.includes("ERROR")) return "text-error";
  if (line.includes("[WARNING]") || line.includes("[WARN]") || line.includes("WARNING")) return "text-tertiary";
  if (line.includes("[INFO]") || line.includes("INFO")) return "text-on-surface-variant";
  return "text-on-surface-variant/70";
}

export function ServerLogs() {
  const { addToast } = useToast();
  const [lines, setLines] = useState(200);
  const [filterInput, setFilterInput] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const logBoxRef = useRef<HTMLPreElement>(null);

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["server-logs", lines, activeFilter],
    queryFn: () => getServerLogs(lines, activeFilter || undefined),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (error) {
      const msg = error instanceof Error ? error.message : "Failed to load logs";
      addToast(msg, "error");
    }
  }, [error, addToast]);

  // Scroll to bottom when new logs arrive
  useEffect(() => {
    if (logBoxRef.current) {
      logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
    }
  }, [data]);

  function applyFilter() {
    setActiveFilter(filterInput);
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-outline-variant/30 bg-surface-container/30">
        <h3 className="text-sm font-bold font-display text-on-surface uppercase tracking-widest mr-2">
          Server Logs
        </h3>

        {/* Lines slider */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold font-display text-on-surface-variant">Lines:</label>
          <input
            type="range"
            min={10}
            max={1000}
            step={10}
            value={lines}
            onChange={(e) => setLines(Number(e.target.value))}
            className="w-24 accent-primary"
          />
          <span className="text-xs font-bold font-display text-on-surface w-10">{lines}</span>
        </div>

        {/* Filter input */}
        <div className="flex items-center gap-1.5 flex-1 min-w-[180px]">
          <input
            type="text"
            placeholder="Filter text (e.g. ERROR)"
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && applyFilter()}
            className="flex-1 text-xs font-display bg-surface-container border border-outline-variant/50 rounded-lg px-3 py-1.5 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary"
          />
          <button
            onClick={applyFilter}
            className="text-xs font-semibold font-display text-on-primary bg-primary px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Apply
          </button>
          {activeFilter && (
            <button
              onClick={() => { setFilterInput(""); setActiveFilter(""); }}
              className="text-xs font-semibold font-display text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 text-xs font-semibold font-display text-on-surface-variant hover:text-on-surface transition-colors disabled:opacity-50 ml-auto"
        >
          <span
            className={`material-symbols-outlined text-[16px] ${isFetching ? "animate-spin" : ""}`}
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}
          >
            refresh
          </span>
          Refresh
        </button>

        {/* Stats */}
        {data && (
          <span className="text-xs text-on-surface-variant font-display">
            {data.total_returned} lines · {data.log_file.split("/").pop()}
          </span>
        )}
      </div>

      {/* Log output */}
      {isLoading ? (
        <div className="flex items-center justify-center h-40 text-on-surface-variant text-sm font-display">
          <span className="material-symbols-outlined text-[20px] animate-spin mr-2">autorenew</span>
          Loading logs...
        </div>
      ) : (
        <pre
          ref={logBoxRef}
          className="overflow-auto max-h-[520px] p-4 text-[11px] leading-relaxed font-mono bg-[#0d1117]"
        >
          {data?.lines.length === 0 ? (
            <span className="text-on-surface-variant/50">No log lines returned.</span>
          ) : (
            data?.lines.map((line, i) => (
              <div key={i} className={colorLine(line)}>
                {line}
              </div>
            ))
          )}
        </pre>
      )}
    </div>
  );
}
