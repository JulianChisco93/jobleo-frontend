"use client";

import { useState, KeyboardEvent } from "react";

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  helperText?: string;
  disabled?: boolean;
}

export function TagInput({
  label,
  value,
  onChange,
  placeholder = "Add tag...",
  maxTags,
  helperText,
  disabled = false,
}: TagInputProps) {
  const [input, setInput] = useState("");

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (maxTags && value.length >= maxTags) return;
    if (value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  const atMax = maxTags !== undefined && value.length >= maxTags;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="font-mono text-xs font-medium tracking-wider text-text-secondary uppercase">
          {label}
        </span>
      )}
      <div
        className="flex flex-wrap gap-2 p-2 bg-bg-card border-2 border-border-color min-h-[44px] focus-within:outline-2 focus-within:outline-accent-blue"
        style={{ borderColor: "#000000" }}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 px-3 py-1 bg-text-primary text-text-on-dark text-sm font-medium font-mono"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 text-text-on-dark hover:opacity-70 text-xs leading-none"
              >
                ×
              </button>
            )}
          </span>
        ))}
        {!disabled && !atMax && (
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => input && addTag(input)}
            placeholder={value.length === 0 ? placeholder : ""}
            className="flex-1 min-w-24 outline-none text-sm bg-transparent text-text-primary placeholder:text-text-muted font-heading"
          />
        )}
      </div>
      {helperText && (
        <p className="text-xs text-text-secondary font-heading">{helperText}</p>
      )}
    </div>
  );
}
