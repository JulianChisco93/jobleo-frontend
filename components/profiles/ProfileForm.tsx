"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { TagInput } from "@/components/ui/TagInput";
import { LocationTagInput } from "@/components/ui/LocationTagInput";
import { Toggle } from "@/components/ui/Toggle";
import type { SearchProfile, PlanLimits } from "@/lib/types";

function TipBanner({ title, body }: { title: string; body: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-900 text-xs overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-amber-100/60 transition-colors text-left"
      >
        <span className="material-symbols-outlined text-[15px] text-amber-500 flex-shrink-0"
          style={{ fontVariationSettings: "'FILL' 1" }}>
          lightbulb
        </span>
        <span className="font-semibold flex-1">{title}</span>
        <span className="material-symbols-outlined text-[15px] text-amber-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          expand_more
        </span>
      </button>
      {open && (
        <p className="px-3 pb-3 pt-0 leading-relaxed text-amber-800 border-t border-amber-200">
          {body}
        </p>
      )}
    </div>
  );
}

const schema = z.object({
  name: z.string().min(1),
  profession: z.string().min(1),
  job_titles: z.array(z.string()),
  locations: z.array(z.string()),
  include_terms: z.array(z.string()),
  exclude_terms: z.array(z.string()),
  frequency_minutes: z.coerce.number(),
  is_active: z.boolean().optional(),
  business_hours_only: z.boolean(),
  business_hours_start: z.string().optional(),
  business_hours_end: z.string().optional(),
  business_days_only: z.boolean(),
});

export type ProfileFormData = z.infer<typeof schema>;

interface ProfileFormProps {
  defaultValues?: Partial<SearchProfile>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isNew?: boolean;
  limits?: PlanLimits;
}

const FREQUENCY_OPTIONS = [
  { value: 60, labelKey: "freq60" },
  { value: 120, labelKey: "freq120" },
  { value: 240, labelKey: "freq240" },
  { value: 480, labelKey: "freq480" },
  { value: 1440, labelKey: "freq1440" },
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return `${h}:00`;
});

const inputCls = "px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 text-sm outline-none transition-all w-full";
const labelCls = "text-xs font-bold text-on-surface-variant uppercase tracking-wider";

// The API may return business_hours_start/end as integers (0-23) or strings.
// Normalize to "HH:00" format so the select and Zod (z.string) work correctly.
function toHourStr(val: unknown): string {
  if (typeof val === "number") return `${String(val).padStart(2, "0")}:00`;
  if (typeof val === "string") {
    if (val.includes(":")) return val;
    const n = parseInt(val, 10);
    return isNaN(n) ? "09:00" : `${String(n).padStart(2, "0")}:00`;
  }
  return "09:00";
}

export function ProfileForm({ defaultValues, onSubmit, onDelete, isNew, limits }: ProfileFormProps) {
  const t = useTranslations("profiles");
  const plan = limits?.plan ?? "free";
  const maxJobTitles = limits?.max_job_titles_per_profile ?? 0;
  const maxLocations = limits?.max_locations_per_profile ?? 2;
  const businessHoursEnforced = limits?.business_hours_only_enforced ?? false;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: defaultValues?.name || "",
      profession: defaultValues?.profession || "",
      job_titles: defaultValues?.job_titles || [],
      locations: defaultValues?.locations || [] as string[],
      include_terms: defaultValues?.include_terms || [],
      exclude_terms: defaultValues?.exclude_terms || [],
      frequency_minutes: defaultValues?.frequency_minutes || (plan === "free" ? 1440 : 60),
      is_active: defaultValues?.is_active ?? true,
      business_hours_only: defaultValues?.business_hours_only || false,
      business_hours_start: toHourStr(defaultValues?.business_hours_start) || "09:00",
      business_hours_end: toHourStr(defaultValues?.business_hours_end) || "18:00",
      business_days_only: defaultValues?.business_days_only || false,
    },
  });

  const businessHoursOnly = watch("business_hours_only");
  const isActive = watch("is_active");

  const jobTitles = watch("job_titles" as any) as string[] || [];
  const locations = watch("locations" as any) as string[] || [];
  const includeTerms = watch("include_terms" as any) as string[] || [];
  const excludeTerms = watch("exclude_terms" as any) as string[] || [];
  const [locationsError, setLocationsError] = useState(false);

  async function wrappedSubmit(data: ProfileFormData) {
    if (locations.length === 0) {
      setLocationsError(true);
      return;
    }
    setLocationsError(false);
    await onSubmit(data);
  }

  async function handleDelete() {
    if (!onDelete) return;
    if (confirm(t("deleteConfirm"))) {
      await onDelete();
    }
  }

  return (
    <form onSubmit={handleSubmit(wrappedSubmit)} className="flex flex-col gap-6 p-8">

      {/* Body — two-panel grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

        {/* LEFT — ¿Qué busco? */}
        <div className="flex flex-col gap-6">

          {/* Name + Profession */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className={labelCls}>{t("profileNameLabel")}</label>
              <input {...register("name")} className={inputCls} />
              {errors.name && <span className="text-xs text-error">{t("profileNameLabel")} required</span>}
            </div>
            <div className="flex flex-col gap-2">
              <label className={labelCls}>{t("professionLabel")}</label>
              <input {...register("profession")} className={inputCls} />
            </div>
          </div>

          {/* Job Titles */}
          <div className="flex flex-col gap-2">
            {maxJobTitles === 0 ? (
              <div className="flex flex-col gap-2">
                <span className={labelCls}>{t("jobTitlesLabel")}</span>
                <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                  {t("jobTitlesDisabledFree")}
                </div>
              </div>
            ) : (
              <TagInput
                label={`${t("jobTitlesLabel")} (MAX ${maxJobTitles})`}
                value={jobTitles}
                onChange={(v) => setValue("job_titles" as any, v)}
                placeholder={t("addTitle")}
                maxTags={maxJobTitles}
              />
            )}
            {maxJobTitles > 0 && <TipBanner title={t("jobTitlesTipTitle")} body={t("jobTitlesTipBody")} />}
          </div>

          {/* Locations */}
          <div>
            <LocationTagInput
              label={t("locationsLabel")}
              value={locations}
              onChange={(v) => { setValue("locations" as any, v); setLocationsError(false); }}
              placeholder={t("addLocation")}
              helperText={t("locationsTip")}
              maxTags={maxLocations}
              upgradeMessage={t("locationLimitReached")}
            />
            {locationsError && (
              <span className="text-xs text-error mt-1 block">{t("locationsRequired")}</span>
            )}
            <div className="mt-2">
              <TipBanner title={t("locationsTipTitle")} body={t("locationsTipBody")} />
            </div>
          </div>

          {/* Include / Exclude */}
          <div className="grid grid-cols-2 gap-6">
            <TagInput
              label={t("includeKeywordsLabel")}
              value={includeTerms}
              onChange={(v) => setValue("include_terms" as any, v)}
              placeholder={t("addKeyword")}
            />
            <TagInput
              label={t("excludeKeywordsLabel")}
              value={excludeTerms}
              onChange={(v) => setValue("exclude_terms" as any, v)}
              placeholder={t("addKeyword")}
            />
          </div>

        </div>

        {/* RIGHT — ¿Cómo busco? (settings card con Tonal Layering) */}
        <div className="flex flex-col gap-5 p-6 bg-surface-container-lowest rounded-xl shadow-[var(--shadow-card)]">

          {/* Frequency */}
          <div className="flex flex-col gap-2">
            <label className={labelCls}>{t("frequencyLabel")}</label>
            {plan === "free" ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-low rounded-xl text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[15px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                {t("freePlanFrequencyLocked")}
              </div>
            ) : (
              <select
                {...register("frequency_minutes", { valueAsNumber: true })}
                className={inputCls}
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {t(opt.labelKey as any)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Active toggle — label ↔ toggle, sin pt-6 hack */}
          <div className="flex items-center justify-between">
            <span className={labelCls}>{t("profileActiveLabel")}</span>
            <Toggle
              checked={!!isActive}
              onChange={(v) => setValue("is_active", v)}
            />
          </div>

          {/* Tonal separator */}
          {plan !== "free" && <div className="h-px bg-surface-container-high" />}

          {/* Business Hours — hidden for free, informational for pro, editable for premium */}
          {plan === "pro" && (
            <div className="flex items-start gap-2 px-3 py-2.5 bg-primary-fixed/30 rounded-xl text-xs text-primary">
              <span className="material-symbols-outlined text-[15px] mt-0.5 flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <span>{t("businessHoursEnforced")}</span>
            </div>
          )}

          {plan === "premium" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-on-surface">
                  {t("businessHoursLabel")}
                </span>
                <Toggle
                  checked={businessHoursOnly}
                  onChange={(v) => setValue("business_hours_only", v)}
                />
              </div>

              {businessHoursOnly && (
                <div className="flex flex-col gap-4 pt-3 border-t border-outline-variant/20">
                  <Toggle
                    checked={watch("business_days_only")}
                    onChange={(v) => setValue("business_days_only", v)}
                    label={t("weekdaysOnlyLabel")}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}>{t("startHourLabel")}</label>
                      <select {...register("business_hours_start")} className={inputCls}>
                        {HOUR_OPTIONS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className={labelCls}>{t("endHourLabel")}</label>
                      <select {...register("business_hours_end")} className={inputCls}>
                        {HOUR_OPTIONS.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Footer actions — ancho completo fuera del grid */}
      <div className="flex items-center justify-between pt-4 border-t border-outline-variant/20">
        {!isNew && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-2.5 text-sm font-bold text-error border border-error rounded-xl hover:bg-error-container transition-colors"
          >
            {t("deleteProfile")}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-auto flex items-center gap-2 px-6 py-3 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all"
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            t("saveChanges")
          )}
        </button>
      </div>
    </form>
  );
}
