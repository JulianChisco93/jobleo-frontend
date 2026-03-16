"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { TagInput } from "@/components/ui/TagInput";
import { uploadCVFile, uploadCVText, createSearchProfile, updateMe } from "@/lib/api";

// ─── Step progress bar ──────────────────────────────────────
function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const colors = ["#E53935", "#1E88E5", "#FFC107"];
  return (
    <div className="flex gap-1.5 mb-2">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className="h-1 flex-1 rounded-sm"
          style={{
            backgroundColor: s <= step ? colors[s - 1] : "#E0E0E0",
          }}
        />
      ))}
    </div>
  );
}

// ─── Step 1: CV Upload ───────────────────────────────────────
function Step1({
  onNext,
}: {
  onNext: (data: { cvUploaded: boolean }) => void;
}) {
  const t = useTranslations("onboarding");
  const [cvTab, setCvTab] = useState<"upload" | "paste">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleContinue() {
    setLoading(true);
    setError(null);
    try {
      if (cvTab === "upload" && file) {
        await uploadCVFile(file);
      } else if (cvTab === "paste" && text.trim()) {
        const trimmed = text.trim();
        if (trimmed.length < 200) {
          setError(t("cvTooShort"));
          setLoading(false);
          return;
        }
        if (trimmed.length > 50000) {
          setError(t("cvTooLong"));
          setLoading(false);
          return;
        }
        await uploadCVText(trimmed, "resume.txt");
      }
      onNext({ cvUploaded: !!(file || text.trim()) });
    } catch (err: any) {
      const raw = err.message || "";
      try {
        const parsed = JSON.parse(raw);
        setError(parsed.detail || t("uploadError"));
      } catch {
        setError(raw || t("uploadError"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs font-bold tracking-widest font-mono text-accent-red">
          {t("step1of3")}
        </span>
        <StepBar step={1} />
        <h2 className="text-2xl font-bold font-heading text-text-primary mt-3">
          {t("step1Title")}
        </h2>
        <p className="text-sm font-heading text-text-secondary mt-1">
          {t("step1Subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: "2px solid #000000" }}>
        {(["upload", "paste"] as const).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => { setCvTab(tabKey); setError(null); }}
            className="px-5 py-2.5 text-sm font-bold font-heading transition-colors"
            style={{
              borderBottom: cvTab === tabKey ? "2px solid #000000" : "none",
              color: cvTab === tabKey ? "#000000" : "#777777",
              marginBottom: cvTab === tabKey ? "-2px" : "0",
            }}
          >
            {tabKey === "upload" ? t("uploadPdf") : t("pasteText")}
          </button>
        ))}
      </div>

      {cvTab === "upload" ? (
        <div
          className="flex flex-col items-center justify-center gap-3 p-12 cursor-pointer hover:bg-bg-page transition-colors"
          style={{ border: "2px dashed #000000", minHeight: 160 }}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const dropped = e.dataTransfer.files[0];
            if (dropped?.type === "application/pdf") setFile(dropped);
          }}
        >
          <svg width="32" height="32" fill="none" stroke="#777777" strokeWidth="1.5" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {file ? (
            <span className="text-sm font-bold font-heading text-accent-green">{file.name}</span>
          ) : (
            <>
              <span className="text-sm font-heading text-text-secondary">{t("dragDropHint")}</span>
              <span className="text-xs font-heading text-text-muted">{t("orBrowseFiles")}</span>
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
      ) : (
        <div className="flex flex-col gap-2">
          <div
            className="relative"
            style={{ border: "2px solid #000000" }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={t("pasteTextPlaceholder")}
              rows={8}
              className="w-full p-4 text-sm font-heading text-text-primary placeholder:text-text-muted bg-bg-card outline-none resize-none"
            />
          </div>
          <div className="flex justify-between text-xs font-mono text-text-muted">
            <span style={{ color: text.trim().length > 0 && text.trim().length < 200 ? "#E53935" : undefined }}>
              {text.trim().length} / 200 {t("charsMinimum")}
            </span>
            <span style={{ color: text.trim().length > 50000 ? "#E53935" : undefined }}>
              {text.trim().length > 50000 ? `${text.trim().length - 50000} ${t("charsOver")}` : `${50000 - text.trim().length} ${t("charsRemaining")}`}
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-accent-red font-heading">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onNext({ cvUploaded: false })}
            className="text-sm font-bold font-heading text-text-secondary border-2 border-border-light px-5 py-2.5 hover:border-border-color transition-colors"
          >
            {t("skipForNow")}
          </button>
          <p className="text-xs font-heading text-text-muted max-w-48">
            {t("skipWarning")}
          </p>
        </div>
        <button
          onClick={handleContinue}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold font-heading text-text-on-dark bg-accent-red border-2 border-border-color hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? "..." : t("continue")}
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

function Step2({
  onNext,
  onBack,
}: {
  onNext: (data: any) => void;
  onBack: () => void;
}) {
  const t = useTranslations("onboarding");
  const { register, handleSubmit, formState: { errors } } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
  });
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [includeTerms, setIncludeTerms] = useState<string[]>([]);
  const [excludeTerms, setExcludeTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(data: SearchFormData) {
    setLoading(true);
    setError(null);
    try {
      const profile = await createSearchProfile({
        name: `${data.profession} Search`,
        profession: data.profession,
        job_titles: jobTitles,
        locations,
        include_terms: includeTerms,
        exclude_terms: excludeTerms,
        frequency_minutes: 60,
        business_hours_only: false,
        business_days_only: false,
      });
      onNext({ profileId: profile.id });
    } catch (err: any) {
      setError(err.message || "Failed to create profile");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-bold tracking-widest font-mono text-accent-blue">
          {t("step2of3")}
        </span>
        <StepBar step={2} />
        <h2 className="text-2xl font-bold font-heading text-text-primary mt-3">
          {t("step2Title")}
        </h2>
        <p className="text-sm font-heading text-text-secondary mt-1">
          {t("step2Subtitle")}
        </p>
      </div>

      {/* Profession */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
          {t("professionLabel")}
        </label>
        <input
          {...register("profession")}
          placeholder={t("professionPlaceholder")}
          className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary placeholder:text-text-muted outline-none"
        />
        {errors.profession && (
          <span className="text-xs text-accent-red font-heading">Required</span>
        )}
      </div>

      {/* Job titles */}
      <TagInput
        label={t("jobTitlesLabel")}
        value={jobTitles}
        onChange={setJobTitles}
        placeholder={t("jobTitlesPlaceholder")}
        maxTags={5}
      />

      {/* Locations */}
      <TagInput
        label={t("locationsLabel")}
        value={locations}
        onChange={setLocations}
        placeholder={t("locationsPlaceholder")}
        helperText={t("locationsTip")}
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

      {error && <p className="text-sm text-accent-red font-heading">{error}</p>}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 text-sm font-bold font-heading text-text-secondary border-2 border-border-light hover:border-border-color transition-colors"
        >
          {t("back")}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 text-sm font-bold font-heading text-text-on-dark bg-accent-blue border-2 border-border-color hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? "..." : t("continue")}
        </button>
      </div>
    </form>
  );
}

// ─── Step 3: WhatsApp ─────────────────────────────────────────
function Step3({
  onBack,
  onFinish,
}: {
  onBack: () => void;
  onFinish: () => void;
}) {
  const t = useTranslations("onboarding");
  const tPreview = useTranslations("onboarding.whatsappPreview");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+1");
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
      onFinish();
    } catch (err: any) {
      setError(err.message || "Failed to save number");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="text-xs font-bold tracking-widest font-mono text-accent-yellow">
          {t("step3of3")}
        </span>
        <StepBar step={3} />
        <h2 className="text-2xl font-bold font-heading text-text-primary mt-3">
          {t("step3Title")}
        </h2>
        <p className="text-sm font-heading text-text-secondary mt-1">
          {t("step3Subtitle")}
        </p>
      </div>

      {/* Phone input */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
          {t("whatsappLabel")}
        </label>
        <div className="flex gap-0">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="h-11 px-3 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none border-r-0"
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
            className="flex-1 h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary placeholder:text-text-muted outline-none"
          />
        </div>
      </div>

      {/* WhatsApp Preview */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-bold tracking-widest font-mono text-text-secondary uppercase">
          {t("previewTitle")}
        </span>
        <div
          className="p-5"
          style={{ backgroundColor: "#E8F5E9", border: "1px solid #c8e6c9" }}
        >
          <p className="text-xs font-bold font-mono text-text-secondary mb-3">
            ⚡ {tPreview("header")}
          </p>
          <p className="text-sm font-bold font-heading text-text-primary">
            {tPreview("title")}
          </p>
          <p className="text-xs font-heading text-text-secondary mt-0.5">
            {tPreview("company")}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className="px-2 py-0.5 text-xs font-bold font-mono text-white"
              style={{ backgroundColor: "#4CAF50" }}
            >
              {tPreview("score")}
            </span>
          </div>
          <p
            className="mt-3 text-xs font-bold font-heading"
            style={{ color: "#1E88E5" }}
          >
            {tPreview("applyNow")}
          </p>
          <p className="text-xs font-heading text-text-secondary mt-1">
            {tPreview("viewMore")}
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-accent-red font-heading">{error}</p>}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 text-sm font-bold font-heading text-text-secondary border-2 border-border-light hover:border-border-color transition-colors"
        >
          {t("back")}
        </button>
        <button
          onClick={handleFinish}
          disabled={loading}
          className="px-6 py-2.5 text-sm font-bold font-heading text-text-primary bg-accent-yellow border-2 border-border-color hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {loading ? "..." : t("finishSetup")}
        </button>
      </div>
    </div>
  );
}

// ─── Onboarding Page ──────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg-page py-12">
      <div
        className="w-full max-w-xl bg-bg-card p-12"
        style={{ border: "2px solid #000000" }}
      >
        {step === 1 && (
          <Step1 onNext={() => setStep(2)} />
        )}
        {step === 2 && (
          <Step2 onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <Step3 onBack={() => setStep(2)} onFinish={() => router.push("/dashboard")} />
        )}
      </div>
    </div>
  );
}
