"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { TagInput } from "@/components/ui/TagInput";
import { LocationTagInput } from "@/components/ui/LocationTagInput";
import { Toggle } from "@/components/ui/Toggle";
import type { SearchProfile } from "@/lib/types";

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

export function ProfileForm({ defaultValues, onSubmit, onDelete, isNew }: ProfileFormProps) {
  const t = useTranslations("profiles");

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
      frequency_minutes: defaultValues?.frequency_minutes || 60,
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
    <form onSubmit={handleSubmit(wrappedSubmit)} className="flex flex-col gap-6 p-8 max-w-3xl">

      {/* Name + Profession row */}
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
      <TagInput
        label={t("jobTitlesLabel")}
        value={jobTitles}
        onChange={(v) => setValue("job_titles" as any, v)}
        placeholder={t("addTitle")}
        maxTags={5}
      />

      {/* Locations */}
      <div>
        <LocationTagInput
          label={t("locationsLabel")}
          value={locations}
          onChange={(v) => { setValue("locations" as any, v); setLocationsError(false); }}
          placeholder={t("addLocation")}
          helperText={t("locationsTip")}
        />
        {locationsError && (
          <span className="text-xs text-error mt-1 block">{t("locationsRequired")}</span>
        )}
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

      {/* Frequency + Active */}
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-2 flex-1">
          <label className={labelCls}>{t("frequencyLabel")}</label>
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
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Toggle
            checked={!!isActive}
            onChange={(v) => setValue("is_active", v)}
            label={t("profileActiveLabel")}
          />
        </div>
      </div>

      {/* Business Hours */}
      <div className="flex flex-col gap-4 p-5 bg-surface-container-low rounded-xl">
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
          <div className="flex items-center gap-6 pt-2 border-t border-outline-variant/20">
            <Toggle
              checked={watch("business_days_only")}
              onChange={(v) => setValue("business_days_only", v)}
              label={t("weekdaysOnlyLabel")}
            />
            <div className="flex gap-4 flex-1">
              <div className="flex flex-col gap-2 flex-1">
                <label className={labelCls}>{t("startHourLabel")}</label>
                <select {...register("business_hours_start")} className={inputCls}>
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 flex-1">
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

      {/* Footer actions */}
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
