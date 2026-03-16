"use client";

import { useForm, Controller } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { TagInput } from "@/components/ui/TagInput";
import { Toggle } from "@/components/ui/Toggle";
import type { SearchProfile, CreateSearchProfilePayload } from "@/lib/types";

const schema = z.object({
  name: z.string().min(1),
  profession: z.string().min(1),
  frequency_minutes: z.number(),
  is_active: z.boolean().optional(),
  business_hours_only: z.boolean(),
  business_hours_start: z.string().optional(),
  business_hours_end: z.string().optional(),
  business_days_only: z.boolean(),
});

export type ProfileFormData = z.infer<typeof schema> & {
  job_titles: string[];
  locations: string[];
  include_terms: string[];
  exclude_terms: string[];
  title_exclude_terms?: string[];
};

interface ProfileFormProps {
  defaultValues?: Partial<SearchProfile>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
  isNew?: boolean;
}

const FREQUENCY_OPTIONS = [
  { value: 30, labelKey: "freq30" },
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

export function ProfileForm({ defaultValues, onSubmit, onDelete, isNew }: ProfileFormProps) {
  const t = useTranslations("profiles");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
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
      business_hours_start: defaultValues?.business_hours_start || "09:00",
      business_hours_end: defaultValues?.business_hours_end || "18:00",
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

      {/* Name + Profession row */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
            {t("profileNameLabel")}
          </label>
          <input
            {...register("name")}
            className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none"
          />
          {errors.name && <span className="text-xs text-accent-red">{t("profileNameLabel")} required</span>}
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
            {t("professionLabel")}
          </label>
          <input
            {...register("profession")}
            className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none"
          />
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
      <TagInput
        label={t("locationsLabel")}
        value={locations}
        onChange={(v) => { setValue("locations" as any, v); setLocationsError(false); }}
        placeholder={t("addLocation")}
        helperText={t("locationsTip")}
      />
      {locationsError && (
        <span className="text-xs text-accent-red font-heading -mt-4">{t("locationsRequired")}</span>
      )}

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
          <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
            {t("frequencyLabel")}
          </label>
          <select
            {...register("frequency_minutes", { valueAsNumber: true })}
            className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none"
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
      <div
        className="flex flex-col gap-4 p-6"
        style={{ border: "2px solid #E0E0E0" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold font-heading text-text-primary">
            {t("businessHoursLabel")}
          </span>
          <Toggle
            checked={businessHoursOnly}
            onChange={(v) => setValue("business_hours_only", v)}
          />
        </div>

        {businessHoursOnly && (
          <div className="flex items-center gap-6">
            <Toggle
              checked={watch("business_days_only")}
              onChange={(v) => setValue("business_days_only", v)}
              label={t("weekdaysOnlyLabel")}
            />
            <div className="flex gap-4 flex-1">
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
                  {t("startHourLabel")}
                </label>
                <select
                  {...register("business_hours_start")}
                  className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none"
                >
                  {HOUR_OPTIONS.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider">
                  {t("endHourLabel")}
                </label>
                <select
                  {...register("business_hours_end")}
                  className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none"
                >
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
      <div className="flex items-center justify-between pt-4" style={{ borderTop: "2px solid #E0E0E0" }}>
        {!isNew && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-5 py-2.5 text-sm font-bold font-heading border-2 transition-colors"
            style={{ borderColor: "#E53935", color: "#E53935" }}
          >
            {t("deleteProfile")}
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="ml-auto px-6 py-2.5 text-sm font-bold font-heading text-white bg-accent-blue border-2 border-border-color hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {isSubmitting ? t("saving") : t("saveChanges")}
        </button>
      </div>
    </form>
  );
}
