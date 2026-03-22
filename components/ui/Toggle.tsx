"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="flex items-center gap-3 cursor-pointer disabled:opacity-50"
    >
      {/* Track */}
      <div
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? "bg-primary" : "bg-surface-container-highest"
        }`}
        style={{ boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.05)" }}
      >
        {/* Thumb */}
        <div
          className="absolute top-1 w-4 h-4 rounded-full bg-surface-container-lowest transition-transform duration-200 shadow-sm"
          style={{ transform: checked ? "translateX(22px)" : "translateX(4px)" }}
        />
      </div>
      {label && (
        <span
          className={`text-sm font-semibold ${
            checked ? "text-on-surface" : "text-on-surface-variant"
          }`}
        >
          {label}
        </span>
      )}
    </button>
  );
}
