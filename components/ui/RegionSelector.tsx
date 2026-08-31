"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getRegions } from "@/lib/api";
import type { Province, RegionsCatalog } from "@/lib/types";

interface RegionSelectorProps {
  label?: string;
  /** Region codes, e.g. `["ON", "ON:NIAGARA"]`. */
  value: string[];
  onChange: (codes: string[]) => void;
  maxSelections?: number;
  limitMessage?: string;
  disabled?: boolean;
}

export function useRegionsCatalog() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: getRegions,
    staleTime: 60 * 60 * 1000,
  });
}

/** Human-readable name for a region code, falling back to the code itself. */
export function regionLabel(code: string, catalog: RegionsCatalog | undefined): string {
  if (!catalog) return code;
  const [provinceCode] = code.split(":");
  const province = catalog[provinceCode];
  if (!province) return code;
  if (code === provinceCode) return province.name;
  return province.regions.find((r) => r.code === code)?.name ?? code;
}

function isKnownCode(code: string, catalog: RegionsCatalog | undefined): boolean {
  if (!catalog) return true;
  const [provinceCode] = code.split(":");
  const province = catalog[provinceCode];
  if (!province) return false;
  return code === provinceCode || province.regions.some((r) => r.code === code);
}

/**
 * True when any value is free text rather than a catalog code. The API rejects
 * free text on create and update, so these must be removed before saving.
 */
export function hasLegacyLocations(
  value: string[],
  catalog: RegionsCatalog | undefined
): boolean {
  return value.some((code) => !isKnownCode(code, catalog));
}

function CheckRow({
  checked,
  disabled,
  onToggle,
  title,
  subtitle,
  emphasis,
}: {
  checked: boolean;
  disabled: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  emphasis?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors ${
        disabled && !checked
          ? "opacity-45 cursor-not-allowed"
          : "cursor-pointer hover:bg-surface-container"
      } ${checked ? "bg-primary-fixed/40" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled && !checked}
        onChange={onToggle}
        className="mt-0.5 h-4 w-4 rounded border-outline-variant bg-surface-container-low accent-primary flex-shrink-0"
      />
      <span className="flex flex-col gap-0.5 min-w-0">
        <span
          className={`text-sm ${
            emphasis ? "font-bold text-on-surface" : "font-semibold text-on-surface"
          }`}
        >
          {title}
        </span>
        {subtitle && (
          <span className="text-xs text-on-surface-variant leading-relaxed">{subtitle}</span>
        )}
      </span>
    </label>
  );
}

function ProvinceGroup({
  province,
  value,
  atMax,
  disabled,
  onToggle,
  defaultOpen,
}: {
  province: Province;
  value: string[];
  atMax: boolean;
  disabled: boolean;
  onToggle: (code: string) => void;
  defaultOpen: boolean;
}) {
  const t = useTranslations("regions");
  const [open, setOpen] = useState(defaultOpen);
  const selectedHere = value.filter((c) => c.split(":")[0] === province.code);

  return (
    <div className="rounded-xl border border-outline-variant/40 overflow-hidden bg-surface-container-lowest">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
      >
        <span className="text-sm font-bold text-on-surface flex-1">{province.name}</span>
        {selectedHere.length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-on-primary rounded-full uppercase tracking-wider">
            {selectedHere.length}
          </span>
        )}
        <span
          className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          expand_more
        </span>
      </button>

      {open && (
        <div className="flex flex-col gap-0.5 px-2 pb-2 border-t border-outline-variant/30 pt-2">
          <CheckRow
            emphasis
            checked={value.includes(province.code)}
            disabled={disabled || atMax}
            onToggle={() => onToggle(province.code)}
            title={t("wholeProvince", { province: province.name })}
            subtitle={t("wholeProvinceHint")}
          />
          <div className="h-px bg-surface-container-high mx-3 my-1" />
          {province.regions.map((region) => (
            <CheckRow
              key={region.code}
              checked={value.includes(region.code)}
              disabled={disabled || atMax}
              onToggle={() => onToggle(region.code)}
              title={region.name}
              subtitle={region.cities.join(" · ")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function RegionSelector({
  label,
  value,
  onChange,
  maxSelections,
  limitMessage,
  disabled = false,
}: RegionSelectorProps) {
  const t = useTranslations("regions");
  const { data: catalog, isLoading, isError } = useRegionsCatalog();

  const atMax = maxSelections !== undefined && value.length >= maxSelections;
  // Profiles created before the catalog existed still hold free-text locations.
  const legacyValues = value.filter((c) => !isKnownCode(c, catalog));

  function toggle(code: string) {
    if (value.includes(code)) {
      onChange(value.filter((c) => c !== code));
      return;
    }
    if (atMax) return;
    const [provinceCode] = code.split(":");
    // Whole province and its regions are redundant together, so they replace each other.
    const next =
      code === provinceCode
        ? value.filter((c) => c.split(":")[0] !== provinceCode)
        : value.filter((c) => c !== provinceCode);
    onChange([...next, code]);
  }

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold tracking-wider text-on-surface-variant uppercase">
            {label}
          </span>
          {maxSelections !== undefined && (
            <span className="text-xs font-semibold text-on-surface-variant">
              {value.length} / {maxSelections}
            </span>
          )}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px] animate-spin">
            progress_activity
          </span>
          {t("loading")}
        </div>
      )}

      {isError && (
        <p className="flex items-center gap-1.5 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-xs">
          <span className="material-symbols-outlined text-[15px]">error</span>
          {t("loadError")}
        </p>
      )}

      {catalog && (
        <div className="flex flex-col gap-2">
          {Object.values(catalog).map((province, i) => (
            <ProvinceGroup
              key={province.code}
              province={province}
              value={value}
              atMax={atMax}
              disabled={disabled}
              onToggle={toggle}
              defaultOpen={i === 0}
            />
          ))}
        </div>
      )}

      {legacyValues.length > 0 && (
        <div className="flex flex-col gap-2 px-3 py-2.5 bg-surface-container-low rounded-xl">
          <span className="text-xs font-semibold text-on-surface-variant">
            {t("legacyTitle")}
          </span>
          <div className="flex flex-wrap gap-2">
            {legacyValues.map((legacy) => (
              <span key={legacy} className="tag-chip flex items-center gap-1">
                {legacy}
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => onChange(value.filter((c) => c !== legacy))}
                    className="ml-1 text-on-surface-variant hover:text-on-surface text-xs leading-none"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">{t("legacyHint")}</p>
        </div>
      )}

      {atMax && limitMessage && (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary-fixed/40 rounded-xl text-xs text-primary font-medium">
          <span
            className="material-symbols-outlined text-[15px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lock
          </span>
          {limitMessage}
        </div>
      )}
    </div>
  );
}
