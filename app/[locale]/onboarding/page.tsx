"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { TagInput } from "@/components/ui/TagInput";
import { LocationTagInput } from "@/components/ui/LocationTagInput";
import { LangToggle } from "@/components/ui/LangToggle";
import { uploadCVFile, uploadCVText, createSearchProfile, getSearchProfiles, updateMe, createCheckoutSession } from "@/lib/api";

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
function Step1({ onNext }: { onNext: (data: { cvUploaded: boolean }) => void }) {
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
            onClick={() => { setCvTab(tabKey); setError(null); }}
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
      ) : (
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

      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onNext({ cvUploaded: false })}
            className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            {t("skipForNow")}
          </button>
          <p className="text-xs text-on-surface-variant max-w-48">{t("skipWarning")}</p>
        </div>
        <button
          type="button"
          onClick={handleContinue}
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

// ─── Step 2: Search Config ────────────────────────────────────
const searchSchema = z.object({
  profession: z.string().min(1),
});
type SearchFormData = z.infer<typeof searchSchema>;

function Step2({ onNext, onBack }: { onNext: (data: any) => void; onBack: () => void }) {
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
        title_exclude_terms: [],
        frequency_minutes: 60,
        business_hours_only: false,
        business_hours_start: 9,
        business_hours_end: 18,
        business_days_only: false,
      });
      onNext({ profileId: profile.id });
    } catch (err: any) {
      const msg: string = err.message || "";
      // If user already hit the plan profile limit, reuse the existing profile
      if (msg.includes("máximo") || msg.includes("maximum") || msg.includes("plan") || msg.includes("perfil")) {
        try {
          const existing = await getSearchProfiles();
          if (existing.length > 0) {
            onNext({ profileId: existing[0].id });
            return;
          }
        } catch {}
      }
      setError(msg || "Failed to create profile");
    } finally {
      setLoading(false);
    }
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

      {/* Job titles */}
      <TagInput
        label={t("jobTitlesLabel")}
        value={jobTitles}
        onChange={setJobTitles}
        placeholder={t("jobTitlesPlaceholder")}
        maxTags={5}
      />

      {/* Locations */}
      <LocationTagInput
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

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-sm">
          <span className="material-symbols-outlined text-[18px]">error</span>
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-2.5 text-sm font-semibold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
        >
          {t("back")}
        </button>
        <button
          type="submit"
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
    </form>
  );
}

// ─── Step 3: WhatsApp ─────────────────────────────────────────
function Step3({ onBack, onFinish }: { onBack: () => void; onFinish: () => void; }) {
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
    } catch (err: any) {
      // WhatsApp is optional — show the error but proceed to dashboard anyway
      console.error("Failed to save WhatsApp number:", err);
    } finally {
      setLoading(false);
    }
    onFinish();
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
          onClick={onBack}
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

// ─── Step 4: Plan Selection ───────────────────────────────────
function Step4({ onBack, onFinish }: { onBack: () => void; onFinish: (plan: "starter" | "pro" | "premium") => void }) {
  const t = useTranslations("onboarding");
  const [selected, setSelected] = useState<"starter" | "pro" | "premium">("pro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFinish() {
    if (selected === "starter") {
      onFinish("starter");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { url } = await createCheckoutSession(selected);
      window.location.href = url;
    } catch (err: any) {
      setError(err.message || "Failed to start checkout");
      setLoading(false);
    }
  }

  const starterFeatures = [
    t("planStarterFeature1"),
    t("planStarterFeature2"),
    t("planStarterFeature3"),
    t("planStarterFeature4"),
  ];
  const proFeatures = [
    t("planProFeature1"),
    t("planProFeature2"),
    t("planProFeature3"),
    t("planProFeature4"),
    t("planProFeature5"),
  ];
  const premiumFeatures = [
    t("planPremiumFeature1"),
    t("planPremiumFeature2"),
    t("planPremiumFeature3"),
    t("planPremiumFeature4"),
    t("planPremiumFeature5"),
  ];

  const ctaLabel =
    selected === "premium"
      ? t("planPremiumCta")
      : selected === "pro"
      ? t("planProCta")
      : t("planStarterCta");

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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Starter Card */}
        <button
          type="button"
          onClick={() => setSelected("starter")}
          className={`flex flex-col gap-4 p-5 rounded-xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
            selected === "starter"
              ? "border-secondary bg-secondary-container shadow-lg"
              : "border-outline-variant bg-surface-container-lowest"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className={`text-xs font-bold tracking-widest px-2.5 py-1 self-start rounded-full uppercase ${
              selected === "starter"
                ? "bg-secondary/20 text-on-secondary-container"
                : "bg-surface-container-high text-on-surface-variant"
            }`}>
              {t("planStarterBadge")}
            </span>
            <h3 className="text-base font-display font-bold text-on-surface mt-2">
              {t("planStarterName")}
            </h3>
            <p className="text-xl font-display font-bold text-on-surface">
              {t("planStarterPrice")}
            </p>
            <p className="text-xs text-on-surface-variant">{t("planStarterTagline")}</p>
          </div>
          <ul className="flex flex-col gap-2">
            {starterFeatures.map((f) => (
              <li key={f} className="flex items-center gap-2 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px] text-secondary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  check_circle
                </span>
                {f}
              </li>
            ))}
          </ul>
        </button>

        {/* Pro Card */}
        <button
          type="button"
          onClick={() => setSelected("pro")}
          className={`flex flex-col gap-4 p-5 rounded-xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
            selected === "pro"
              ? "border-primary bg-primary shadow-lg"
              : "border-outline-variant bg-surface-container-lowest"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className={`text-xs font-bold tracking-widest px-2.5 py-1 self-start rounded-full uppercase ${
              selected === "pro"
                ? "bg-on-primary/20 text-on-primary"
                : "bg-secondary-container text-on-secondary-container"
            }`}>
              {t("planProBadge")}
            </span>
            <h3 className={`text-base font-display font-bold mt-2 ${selected === "pro" ? "text-on-primary" : "text-on-surface"}`}>
              {t("planProName")}
            </h3>
            <p className={`text-xl font-display font-bold ${selected === "pro" ? "text-on-primary" : "text-on-surface"}`}>
              {t("planProPrice")}
            </p>
            <p className={`text-xs ${selected === "pro" ? "text-on-primary/80" : "text-on-surface-variant"}`}>
              {t("planProTagline")}
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {proFeatures.map((f) => (
              <li key={f} className={`flex items-center gap-2 text-xs ${selected === "pro" ? "text-on-primary/90" : "text-on-surface-variant"}`}>
                <span
                  className="material-symbols-outlined text-[14px] flex-shrink-0"
                  style={{
                    color: selected === "pro" ? "#4ae183" : undefined,
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  check_circle
                </span>
                {f}
              </li>
            ))}
          </ul>
        </button>

        {/* Premium Card */}
        <button
          type="button"
          onClick={() => setSelected("premium")}
          className={`flex flex-col gap-4 p-5 rounded-xl border-2 text-left transition-all hover:scale-[1.01] active:scale-[0.99] ${
            selected === "premium"
              ? "border-secondary bg-secondary shadow-lg"
              : "border-outline-variant bg-surface-container-lowest"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className={`text-xs font-bold tracking-widest px-2.5 py-1 self-start rounded-full uppercase ${
              selected === "premium"
                ? "bg-on-secondary/20 text-on-secondary"
                : "bg-primary-container text-on-primary-container"
            }`}>
              {t("planPremiumBadge")}
            </span>
            <h3 className={`text-base font-display font-bold mt-2 ${selected === "premium" ? "text-on-secondary" : "text-on-surface"}`}>
              {t("planPremiumName")}
            </h3>
            <p className={`text-xl font-display font-bold ${selected === "premium" ? "text-on-secondary" : "text-on-surface"}`}>
              {t("planPremiumPrice")}
            </p>
            <p className={`text-xs ${selected === "premium" ? "text-on-secondary/80" : "text-on-surface-variant"}`}>
              {t("planPremiumTagline")}
            </p>
          </div>
          <ul className="flex flex-col gap-2">
            {premiumFeatures.map((f) => (
              <li key={f} className={`flex items-center gap-2 text-xs ${selected === "premium" ? "text-on-secondary/90" : "text-on-surface-variant"}`}>
                <span
                  className="material-symbols-outlined text-[14px] flex-shrink-0"
                  style={{
                    color: selected === "premium" ? "#ffd966" : undefined,
                    fontVariationSettings: "'FILL' 1",
                  }}
                >
                  check_circle
                </span>
                {f}
              </li>
            ))}
          </ul>
        </button>
      </div>

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

  function goToStep(s: 1 | 2 | 3 | 4) {
    sessionStorage.setItem("onboarding_step", String(s));
    setStep(s);
  }

  function finish() {
    sessionStorage.removeItem("onboarding_step");
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
          {step === 1 && <Step1 onNext={() => goToStep(2)} />}
          {step === 2 && <Step2 onNext={() => goToStep(3)} onBack={() => goToStep(1)} />}
          {step === 3 && <Step3 onBack={() => goToStep(2)} onFinish={() => goToStep(4)} />}
          {step === 4 && (
            <Step4
              onBack={() => goToStep(3)}
              onFinish={(plan) => {
                if (plan === "starter") finish();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
