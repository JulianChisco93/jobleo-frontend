"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { TagInput } from "@/components/ui/TagInput";
import { RegionSelector } from "@/components/ui/RegionSelector";
import { LangToggle } from "@/components/ui/LangToggle";
import {
  uploadCVFile,
  uploadCVText,
  createSearchProfile,
  getSearchProfiles,
  getLimits,
  updateMe,
  createCheckoutSession,
} from "@/lib/api";
import {
  HORIZON_OPTIONS,
  RECOMMENDED_HORIZON,
  readPendingHorizon,
  clearPendingHorizon,
} from "@/lib/plans";
import { savePendingCvFile, clearPendingCvFile } from "@/lib/pendingCv";
import { HorizonLimits } from "@/components/billing/HorizonLimits";
import type { CreateSearchProfilePayload, PlanHorizon } from "@/lib/types";

// ─── Shared state ────────────────────────────────────────────
interface OnboardingData {
  // Step 1
  cvUploaded: boolean;
  cvFilename: string;
  cvTab: "upload" | "paste";
  cvText: string;
  // Step 2
  profession: string;
  country: string;
  jobTitles: string[];
  locations: string[];
  includeTerms: string[];
  excludeTerms: string[];
  // Step 3
  phone: string;
  countryCode: string;
}

const DEFAULT_ONBOARDING_DATA: OnboardingData = {
  cvUploaded: false,
  cvFilename: "",
  cvTab: "upload",
  cvText: "",
  profession: "",
  country: "",
  jobTitles: [],
  locations: [],
  includeTerms: [],
  excludeTerms: [],
  phone: "",
  countryCode: "+1",
};

const COUNTRY_OPTIONS = [
  "Canada", "United States", "United Kingdom", "Australia",
  "Mexico", "Spain", "Argentina", "Colombia", "Chile",
  "Germany", "France", "Brazil", "India", "Portugal",
  "Venezuela", "Peru", "Ecuador", "Uruguay", "Other",
] as const;

/**
 * Upper bound for the region picker during onboarding, before a pass is bought.
 * The real cap comes from `/searches/limits` and is applied when the profile is created.
 */
const MAX_ONBOARDING_REGIONS = 5;

// ─── Step progress bar ──────────────────────────────────────
function StepBar({ step }: { step: 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex gap-1.5">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
            s <= step ? "bg-secondary" : "bg-surface-container-high"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Step 1: CV Upload ───────────────────────────────────────
interface Step1Props {
  initialData: OnboardingData;
  onNext: (update: Partial<OnboardingData>, file: File | null) => void;
}

function Step1({ initialData, onNext }: Step1Props) {
  const t = useTranslations("onboarding");
  const [cvTab, setCvTab] = useState<"upload" | "paste">(initialData.cvTab);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState(initialData.cvText);
  const [override, setOverride] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const alreadyUploaded = initialData.cvUploaded && !!initialData.cvFilename;
  // Show the "already selected" state when: file was selected before and user hasn't overridden
  const showUploadedState = alreadyUploaded && !override && !file;

  function handleContinue() {
    // Branch 1: already selected, no new file/text → just advance
    if (alreadyUploaded && !override && !file && !text.trim()) {
      onNext({ cvTab }, null);
      return;
    }

    setError(null);

    if (cvTab === "upload" && file) {
      onNext({
        cvUploaded: true,
        cvFilename: file.name,
        cvTab,
        cvText: "",
      }, file);
    } else if (cvTab === "paste" && text.trim()) {
      const trimmed = text.trim();
      if (trimmed.length < 200) { setError(t("cvTooShort")); return; }
      if (trimmed.length > 50000) { setError(t("cvTooLong")); return; }
      onNext({
        cvUploaded: true,
        cvFilename: "resume.txt",
        cvTab,
        cvText: trimmed,
      }, null);
    } else {
      // Nothing selected — treat as skip
      onNext({ cvUploaded: false, cvFilename: "", cvTab, cvText: "" }, null);
    }
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">
          {t("step1of3")}
        </p>
        <StepBar step={1} />
        <h2 className="text-2xl font-display font-bold text-on-surface mt-4">
          {t("step1Title")}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">{t("step1Subtitle")}</p>
      </div>

      {/* Tab toggle */}
      <div className="flex bg-surface-container-high rounded-xl p-1 gap-1">
        {(["upload", "paste"] as const).map((tabKey) => (
          <button
            key={tabKey}
            type="button"
            onClick={() => { setCvTab(tabKey); setError(null); setOverride(false); }}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              cvTab === tabKey
                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {tabKey === "upload" ? t("uploadPdf") : t("pasteText")}
          </button>
        ))}
      </div>

      {cvTab === "upload" ? (
        showUploadedState ? (
          /* Already uploaded state */
          <div className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-secondary bg-secondary-container/30">
            <span
              className="material-symbols-outlined text-4xl text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              check_circle
            </span>
            <span className="text-sm font-bold text-on-secondary-container">
              {initialData.cvFilename}
            </span>
            <button
              type="button"
              onClick={() => { setOverride(true); setFile(null); }}
              className="text-xs text-on-surface-variant underline hover:text-on-surface transition-colors"
            >
              {t("uploadDifferentCV")}
            </button>
          </div>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed border-outline-variant cursor-pointer hover:border-primary hover:bg-primary-fixed/30 transition-all"
            style={{ minHeight: 160 }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files[0];
              if (dropped?.type === "application/pdf") setFile(dropped);
            }}
          >
            <div className="w-12 h-12 bg-surface-container-low rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-primary">upload_file</span>
            </div>
            {file ? (
              <span className="text-sm font-bold text-secondary">{file.name}</span>
            ) : (
              <>
                <span className="text-sm font-semibold text-on-surface">{t("dragDropHint")}</span>
                <span className="text-xs text-on-surface-variant">{t("orBrowseFiles")}</span>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files?.[0] || null;
                if (selected && selected.type !== "application/pdf") {
                  setError(t("invalidFileType"));
                  setFile(null);
                  e.target.value = "";
                  return;
                }
                setError(null);
                setFile(selected);
              }}
            />
          </div>
        )
      ) : (
        /* Paste tab — text is always shown and pre-filled from initialData */
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("pasteTextPlaceholder")}
            rows={8}
            className="w-full p-4 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant resize-none outline-none transition-all"
          />
          <div className="flex justify-between text-xs text-on-surface-variant">
            <span className={text.trim().length > 0 && text.trim().length < 200 ? "text-error" : ""}>
              {text.trim().length} / 200 {t("charsMinimum")}
            </span>
            <span className={text.trim().length > 50000 ? "text-error" : ""}>
              {text.trim().length > 50000
                ? `${text.trim().length - 50000} ${t("charsOver")}`
                : `${50000 - text.trim().length} ${t("charsRemaining")}`}
            </span>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-sm">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleContinue}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {t("continue")}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Search Config ────────────────────────────────────
const searchSchema = z.object({
  profession: z.string().min(1),
});
type SearchFormData = z.infer<typeof searchSchema>;

interface Step2Props {
  initialData: OnboardingData;
  onNext: (update: Partial<OnboardingData>) => void;
  onBack: (update: Partial<OnboardingData>) => void;
}

function Step2({ initialData, onNext, onBack }: Step2Props) {
  const t = useTranslations("onboarding");
  const { register, handleSubmit, getValues, formState: { errors } } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { profession: initialData.profession },
  });
  const [jobTitles, setJobTitles] = useState<string[]>(initialData.jobTitles);
  const [locations, setLocations] = useState<string[]>(initialData.locations);
  const [includeTerms, setIncludeTerms] = useState<string[]>(initialData.includeTerms);
  const [excludeTerms, setExcludeTerms] = useState<string[]>(initialData.excludeTerms);
  const [country, setCountry] = useState<string>(initialData.country);

  function collectData(profession: string): Partial<OnboardingData> {
    return { profession, country, jobTitles, locations, includeTerms, excludeTerms };
  }

  function handleCountryChange(newCountry: string) {
    setCountry(newCountry);
  }

  function onSubmit(data: SearchFormData) {
    onNext(collectData(data.profession));
  }

  function handleBack() {
    onBack(collectData(getValues("profession")));
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
          {t("step2of3")}
        </p>
        <StepBar step={2} />
        <h2 className="text-2xl font-display font-bold text-on-surface mt-4">
          {t("step2Title")}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">{t("step2Subtitle")}</p>
      </div>

      {/* Country */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          {t("countryLabel")}
        </label>
        <select
          value={country}
          onChange={(e) => handleCountryChange(e.target.value)}
          className="px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 text-sm outline-none transition-all"
        >
          <option value="">{t("countrySelectDefault")}</option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Profession */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          {t("professionLabel")}
        </label>
        <input
          {...register("profession")}
          placeholder={t("professionPlaceholder")}
          className="px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 text-sm transition-all outline-none"
        />
        {errors.profession && (
          <span className="text-xs text-error">Required</span>
        )}
      </div>

      {/* Job titles — max 3 during onboarding; extra slots unlocked with premium after */}
      <TagInput
        label={t("jobTitlesLabel")}
        value={jobTitles}
        onChange={setJobTitles}
        placeholder={t("jobTitlesPlaceholder")}
        maxTags={3}
      />

      {/* Locations */}
      <RegionSelector
        label={t("locationsLabel")}
        value={locations}
        onChange={setLocations}
        maxSelections={MAX_ONBOARDING_REGIONS}
      />

      {/* Include / Exclude keywords */}
      <div className="grid grid-cols-2 gap-4">
        <TagInput
          label={t("keywordsIncludeLabel")}
          value={includeTerms}
          onChange={setIncludeTerms}
          placeholder={t("keywordsPlaceholder")}
        />
        <TagInput
          label={t("keywordsExcludedLabel")}
          value={excludeTerms}
          onChange={setExcludeTerms}
          placeholder={t("keywordsPlaceholder")}
        />
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="px-5 py-2.5 text-sm font-semibold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
        >
          {t("back")}
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          {t("continue")}
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}

// ─── Step 3: WhatsApp ─────────────────────────────────────────
interface Step3Props {
  initialData: OnboardingData;
  onNext: (update: Partial<OnboardingData>) => void;
  onBack: (update: Partial<OnboardingData>) => void;
}

function Step3({ initialData, onNext, onBack }: Step3Props) {
  const t = useTranslations("onboarding");
  const tPreview = useTranslations("onboarding.whatsappPreview");
  const [phone, setPhone] = useState(initialData.phone);
  const [countryCode, setCountryCode] = useState(initialData.countryCode || "+1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFinish() {
    setLoading(true);
    setError(null);
    try {
      const fullNumber = `${countryCode}${phone.replace(/\D/g, "")}`;
      if (phone.trim()) {
        await updateMe({ whatsapp_number: fullNumber });
      }
    } catch (err) {
      // WhatsApp is optional — show the error but proceed anyway
      console.error("Failed to save WhatsApp number:", err);
    } finally {
      setLoading(false);
    }
    onNext({ phone, countryCode });
  }

  function handleBack() {
    onBack({ phone, countryCode });
  }

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-xs font-bold text-tertiary uppercase tracking-widest mb-2">
          {t("step3of3")}
        </p>
        <StepBar step={3} />
        <h2 className="text-2xl font-display font-bold text-on-surface mt-4">
          {t("step3Title")}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">{t("step3Subtitle")}</p>
      </div>

      {/* Phone input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          {t("whatsappLabel")}
        </label>
        <div className="flex gap-2">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="px-3 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 text-sm outline-none"
          >
            <option value="+1">+1</option>
            <option value="+44">+44</option>
            <option value="+34">+34</option>
            <option value="+52">+52</option>
            <option value="+54">+54</option>
            <option value="+57">+57</option>
            <option value="+58">+58</option>
            <option value="+51">+51</option>
            <option value="+56">+56</option>
          </select>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phonePlaceholder")}
            className="flex-1 px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* WhatsApp Preview */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          {t("previewTitle")}
        </span>
        <div className="p-5 rounded-xl" style={{ backgroundColor: "#E8F5E9", border: "1px solid #c8e6c9" }}>
          <p className="text-xs font-bold text-green-800 mb-3">
            ⚡ {tPreview("header")}
          </p>
          <p className="text-sm font-bold text-green-900">{tPreview("title")}</p>
          <p className="text-xs text-green-700 mt-0.5">{tPreview("company")}</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-bold text-white rounded-full" style={{ backgroundColor: "#4CAF50" }}>
              {tPreview("score")}
            </span>
          </div>
          <p className="mt-3 text-xs font-bold" style={{ color: "#1E88E5" }}>
            {tPreview("applyNow")}
          </p>
          <p className="text-xs text-green-700 mt-1">{tPreview("viewMore")}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-sm">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="px-5 py-2.5 text-sm font-semibold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={handleFinish}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {t("continue")}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Step 4: Pass selection ───────────────────────────────────
type Step4Choice = "free" | PlanHorizon;

interface Step4Props {
  initialData: OnboardingData;
  onBack: () => void;
  onFinish: () => void;
  cvFile?: File | null;
}

function Step4({ initialData, onBack, onFinish, cvFile }: Step4Props) {
  const t = useTranslations("onboarding");
  const tp = useTranslations("pricing");
  // Honours the pass picked on the pricing page before the account existed.
  const [selected, setSelected] = useState<Step4Choice>(
    () => readPendingHorizon() ?? RECOMMENDED_HORIZON
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildPayload(maxJobTitles: number, maxRegions: number): CreateSearchProfilePayload {
    const { profession, country, jobTitles, locations, includeTerms, excludeTerms } = initialData;
    return {
      name: `${profession} Search`,
      profession,
      country: country || undefined,
      job_titles: jobTitles.slice(0, maxJobTitles),
      locations: locations.slice(0, maxRegions),
      include_terms: includeTerms,
      exclude_terms: excludeTerms,
      title_exclude_terms: [],
      frequency_minutes: 60,
      business_hours_only: false,
      business_hours_start: 9,
      business_hours_end: 18,
      business_days_only: false,
      alert_sensitivity: "broad",
    };
  }

  async function finishOnFreePlan() {
    const { jobTitles } = initialData;
    try {
      const limits = await getLimits();
      const profile = await createSearchProfile(
        buildPayload(limits.max_job_titles_per_profile, limits.max_locations_per_profile)
      );
      const profileId = String(profile.id);
      // Upload CV to the newly created profile (non-fatal if it fails)
      try {
        if (cvFile) {
          await uploadCVFile(cvFile, profileId);
        } else if (initialData.cvText) {
          await uploadCVText(initialData.cvText, "resume.txt", profileId);
        }
      } catch {
        // CV upload failure is non-fatal — user can upload from profile page
      }
      // Keep the titles that didn't fit so they can be applied after buying a pass
      if (jobTitles.length > limits.max_job_titles_per_profile) {
        sessionStorage.setItem("onboarding_profile_id", profileId);
        sessionStorage.setItem("onboarding_job_titles", JSON.stringify(jobTitles));
      }
      sessionStorage.removeItem("onboarding_pending_profile");
      onFinish();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      // If the user somehow already has a profile, reuse it
      if (msg.includes("máximo") || msg.includes("maximum") || msg.includes("plan") || msg.includes("perfil")) {
        try {
          const existing = await getSearchProfiles();
          if (existing.length > 0) {
            sessionStorage.removeItem("onboarding_pending_profile");
            onFinish();
            return;
          }
        } catch {
          // Fall through to the error message below
        }
      }
      setError(msg || t("createProfileError"));
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(horizon: PlanHorizon) {
    // The pass isn't active yet, so store the full selection and let the success
    // page trim it to whatever the purchased horizon actually allows.
    sessionStorage.setItem(
      "onboarding_pending_profile",
      JSON.stringify(buildPayload(Infinity, Infinity))
    );
    // The CV can only be uploaded once the profile exists, which happens after
    // paying, so it has to outlive the trip to Stripe: pasted text as-is, and an
    // uploaded file as bytes the success page can turn back into a File.
    if (initialData.cvText) {
      sessionStorage.setItem("onboarding_cv_text", initialData.cvText);
    } else {
      sessionStorage.removeItem("onboarding_cv_text");
    }
    if (cvFile) await savePendingCvFile(cvFile);
    else clearPendingCvFile();

    try {
      const { url } = await createCheckoutSession(horizon);
      if (!url) throw new Error(t("checkoutError"));
      window.location.href = url;
    } catch (err: unknown) {
      sessionStorage.removeItem("onboarding_pending_profile");
      clearPendingCvFile();
      setError(err instanceof Error ? err.message : t("checkoutError"));
      setLoading(false);
    }
  }

  async function handleFinish() {
    setLoading(true);
    setError(null);
    clearPendingHorizon();
    if (selected === "free") await finishOnFreePlan();
    else await startCheckout(selected);
  }

  const freeFeatures = [
    t("planFreeFeature1"),
    t("planFreeFeature2"),
    t("planFreeFeature3"),
  ];

  const ctaLabel = selected === "free" ? t("planFreeCta") : t("planPassCta");

  return (
    <div className="flex flex-col gap-7">
      <div>
        <p className="text-xs font-bold text-on-surface uppercase tracking-widest mb-2">
          {t("step4of4")}
        </p>
        <StepBar step={4} />
        <h2 className="text-2xl font-display font-bold text-on-surface mt-4">
          {t("step4Title")}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">{t("step4Subtitle")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {HORIZON_OPTIONS.map((option) => {
          const active = selected === option.horizon;
          const recommended = option.horizon === RECOMMENDED_HORIZON;
          return (
            <button
              key={option.horizon}
              type="button"
              onClick={() => setSelected(option.horizon)}
              className={`flex flex-col gap-3 p-4 rounded-xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
                active
                  ? "border-primary bg-primary shadow-lg"
                  : "border-outline-variant bg-surface-container-lowest"
              }`}
            >
              <span
                className={`text-[10px] font-bold tracking-widest px-2 py-0.5 self-start rounded-full uppercase ${
                  recommended
                    ? active
                      ? "bg-on-primary/20 text-on-primary"
                      : "bg-secondary-container text-on-secondary-container"
                    : "opacity-0"
                }`}
              >
                {tp("mostPopular")}
              </span>
              <div className="flex flex-col gap-0.5">
                <h3
                  className={`text-sm font-display font-bold ${
                    active ? "text-on-primary" : "text-on-surface"
                  }`}
                >
                  {tp(`horizon${option.messageKey}Name`)}
                </h3>
                <p
                  className={`text-2xl font-display font-black ${
                    active ? "text-on-primary" : "text-on-surface"
                  }`}
                >
                  ${option.price}
                </p>
                <p
                  className={`text-[11px] ${
                    active ? "text-on-primary/70" : "text-on-surface-variant"
                  }`}
                >
                  {tp("oneTimePayment")}
                </p>
              </div>
              <HorizonLimits
                horizon={option.horizon}
                className={`text-xs leading-relaxed ${
                  active ? "text-on-primary/90" : "text-on-surface-variant"
                }`}
              />
            </button>
          );
        })}

      </div>

      <p className="text-xs text-on-surface-variant text-center -mt-2">
        {tp("noAutoRenewNote")}
      </p>

      {/* Free option */}
      <button
        type="button"
        onClick={() => setSelected("free")}
        className={`flex flex-col gap-2 p-4 rounded-xl border-2 text-left transition-colors ${
          selected === "free"
            ? "border-secondary bg-secondary-container"
            : "border-outline-variant bg-surface-container-lowest hover:bg-surface-container-low"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase bg-surface-container-high text-on-surface-variant">
            {t("planFreeBadge")}
          </span>
          <span className="text-sm font-display font-bold text-on-surface">
            {t("planFreeName")}
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">{freeFeatures.join(" · ")}</p>
      </button>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-sm">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-5 py-2.5 text-sm font-semibold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors disabled:opacity-50"
        >
          {t("back")}
        </button>
        <button
          type="button"
          onClick={handleFinish}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {ctaLabel}
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// ─── Onboarding Page ──────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(() => {
    if (typeof window === "undefined") return 1;
    const saved = sessionStorage.getItem("onboarding_step");
    const parsed = saved ? parseInt(saved) : 1;
    return (parsed >= 1 && parsed <= 4 ? parsed : 1) as 1 | 2 | 3 | 4;
  });

  const [data, setData] = useState<OnboardingData>(() => {
    if (typeof window === "undefined") return DEFAULT_ONBOARDING_DATA;
    try {
      const saved = sessionStorage.getItem("onboarding_data");
      return saved
        ? { ...DEFAULT_ONBOARDING_DATA, ...JSON.parse(saved) }
        : DEFAULT_ONBOARDING_DATA;
    } catch {
      return DEFAULT_ONBOARDING_DATA;
    }
  });

  // File objects can't be serialized to sessionStorage, so they live only in memory
  const [cvFile, setCvFile] = useState<File | null>(null);

  function persistData(update: Partial<OnboardingData>) {
    const next = { ...data, ...update };
    setData(next);
    sessionStorage.setItem("onboarding_data", JSON.stringify(next));
  }

  function goToStep(s: 1 | 2 | 3 | 4, update?: Partial<OnboardingData>, file?: File | null) {
    if (update) persistData(update);
    if (file !== undefined) setCvFile(file);
    sessionStorage.setItem("onboarding_step", String(s));
    setStep(s);
  }

  function finish() {
    sessionStorage.removeItem("onboarding_step");
    sessionStorage.removeItem("onboarding_data");
    sessionStorage.removeItem("onboarding_cv_text");
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="font-display font-black text-xl text-primary tracking-tight">
            jobleo
          </span>
          <LangToggle />
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className={`w-full bg-surface-container-lowest rounded-2xl p-8 shadow-[var(--shadow-card)] ${step === 4 ? "max-w-3xl" : "max-w-xl"}`}>
          {step === 1 && (
            <Step1
              initialData={data}
              onNext={(u, f) => goToStep(2, u, f)}
            />
          )}
          {step === 2 && (
            <Step2
              initialData={data}
              onNext={(u) => goToStep(3, u)}
              onBack={(u) => goToStep(1, u)}
            />
          )}
          {step === 3 && (
            <Step3
              initialData={data}
              onNext={(u) => goToStep(4, u)}
              onBack={(u) => goToStep(2, u)}
            />
          )}
          {step === 4 && (
            <Step4
              initialData={data}
              onBack={() => goToStep(3)}
              onFinish={finish}
              cvFile={cvFile}
            />
          )}
        </div>
      </div>
    </div>
  );
}
