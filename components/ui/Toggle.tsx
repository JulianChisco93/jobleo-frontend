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
        className="relative w-11 h-6 rounded-full transition-colors duration-200"
        style={{
          backgroundColor: checked ? "#4CAF50" : "#E0E0E0",
          border: `2px solid ${checked ? "#4CAF50" : "#E0E0E0"}`,
        }}
      >
        {/* Thumb */}
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full transition-transform duration-200"
          style={{
            backgroundColor: "#ffffff",
            transform: checked ? "translateX(20px)" : "translateX(2px)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </div>
      {label && (
        <span
          className="text-sm font-semibold font-heading"
          style={{ color: checked ? "#000000" : "#777777" }}
        >
          {label}
        </span>
      )}
    </button>
  );
}
