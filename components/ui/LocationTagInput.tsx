"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface Suggestion {
  label: string;
  value: string;
}

interface LocationTagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
}

const GEOAPIFY_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

function formatSuggestion(result: Record<string, string>): Suggestion {
  const { city, county, state, country, result_type } = result;

  let parts: string[];
  if (result_type === "country") {
    parts = [country];
  } else if (result_type === "state") {
    parts = [state, country].filter(Boolean);
  } else {
    // city, county or locality
    parts = [city || county, state, country].filter(Boolean);
  }

  const label = parts.join(", ");
  return { label, value: label };
}

export function LocationTagInput({
  label,
  value,
  onChange,
  placeholder = "Add location...",
  helperText,
  disabled = false,
}: LocationTagInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!input.trim() || input.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      if (!GEOAPIFY_KEY) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(input)}&type=city,state,country&format=json&limit=7&apiKey=${GEOAPIFY_KEY}`
        );
        const data = await res.json();
        const results: Suggestion[] = (data.results ?? [])
          .map((r: Record<string, string>) => formatSuggestion(r))
          .filter((s: Suggestion) => s.label)
          // deduplicate by label
          .filter((s: Suggestion, i: number, arr: Suggestion[]) => arr.findIndex((x) => x.label === s.label) === i);
        setSuggestions(results);
        setActiveIndex(-1);
        setOpen(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [input]);

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput("");
    setSuggestions([]);
    setOpen(false);
    setActiveIndex(-1);
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (open && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, -1));
        return;
      }
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        if (activeIndex >= 0) {
          addTag(suggestions[activeIndex].value);
        } else {
          addTag(input);
        }
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
        return;
      }
    } else {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(input);
      }
    }

    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-xs font-bold tracking-wider text-on-surface-variant uppercase">
          {label}
        </span>
      )}
      <div ref={containerRef} className="relative">
        <div className="flex flex-wrap gap-2 p-3 bg-surface-container-low rounded-xl min-h-[44px] focus-within:ring-2 focus-within:ring-primary transition-all">
          {value.map((tag) => (
            <span key={tag} className="tag-chip flex items-center gap-1">
              {tag}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-on-surface-variant hover:text-on-surface text-xs leading-none"
                >
                  ×
                </button>
              )}
            </span>
          ))}
          {!disabled && (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => suggestions.length > 0 && setOpen(true)}
              placeholder={value.length === 0 ? placeholder : ""}
              className="flex-1 min-w-24 outline-none text-sm bg-transparent text-on-surface placeholder:text-on-surface-variant"
              autoComplete="off"
            />
          )}
          {loading && (
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant animate-spin self-center">
              progress_activity
            </span>
          )}
        </div>

        {/* Suggestions dropdown */}
        {open && suggestions.length > 0 && (
          <ul className="absolute left-0 right-0 top-full mt-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-[var(--shadow-card)] z-50 overflow-hidden">
            {suggestions.map((s, i) => (
              <li key={s.label}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    addTag(s.value);
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2 transition-colors ${
                    i === activeIndex
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-[16px] text-on-surface-variant flex-shrink-0"
                    style={{ fontVariationSettings: "'FILL' 0, 'wght' 300" }}
                  >
                    location_on
                  </span>
                  {s.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {helperText && (
        <p className="text-xs text-on-surface-variant">{helperText}</p>
      )}
    </div>
  );
}
