"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import nocData from "@/lib/noc-data.json";

interface NocEntry {
  code: string;
  title: string;
  examples: string[];
}

const NOC: NocEntry[] = nocData as NocEntry[];

interface NocComboboxProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (data: { title: string; examples: string[] } | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

function search(query: string): NocEntry[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results: Array<{ entry: NocEntry; score: number }> = [];

  for (const entry of NOC) {
    const titleLower = entry.title.toLowerCase();
    // Title starts with query → highest score
    if (titleLower.startsWith(q)) {
      results.push({ entry, score: 3 });
    } else if (titleLower.includes(q)) {
      results.push({ entry, score: 2 });
    } else if (entry.examples.some((e) => e.includes(q))) {
      results.push({ entry, score: 1 });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((r) => r.entry);
}

export function NocCombobox({
  value,
  onChange,
  onSelect,
  placeholder = "Search Canadian occupation (NOC)…",
  disabled = false,
  className,
}: NocComboboxProps) {
  const [results, setResults] = useState<NocEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);
    if (!val) {
      onSelect(null);
      setResults([]);
      setOpen(false);
      return;
    }
    const found = search(val);
    setResults(found);
    setOpen(found.length > 0);
    setActiveIdx(-1);
  }

  function selectEntry(entry: NocEntry) {
    onChange(entry.title);
    onSelect({ title: entry.title, examples: entry.examples });
    setOpen(false);
    setResults([]);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIdx >= 0 && results[activeIdx]) {
        selectEntry(results[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const inputCls =
    "px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 text-sm outline-none transition-all w-full";

  return (
    <div ref={containerRef} className={`relative ${className ?? ""}`}>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={inputCls}
        />
        {value && !disabled && (
          <button
            type="button"
            onClick={() => { onChange(""); onSelect(null); setResults([]); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs"
            tabIndex={-1}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden">
          {results.map((entry, i) => (
            <button
              key={entry.code}
              type="button"
              onMouseDown={() => selectEntry(entry)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                i === activeIdx
                  ? "bg-primary/10 text-on-surface"
                  : "hover:bg-surface-container-low text-on-surface"
              }`}
            >
              <span className="font-medium">{entry.title}</span>
              <span className="ml-2 text-xs text-on-surface-variant">{entry.code}</span>
            </button>
          ))}
          <div className="px-4 py-1.5 border-t border-outline-variant/20 bg-surface-container-low/50">
            <span className="text-[10px] text-on-surface-variant tracking-wide">
              NOC 2021 — Statistics Canada
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
