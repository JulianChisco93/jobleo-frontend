"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { getSearchProfile, updateSearchProfile, deleteSearchProfile, analyzeSearchConfig, getCV, uploadCVFile, uploadCVText } from "@/lib/api";
import type { CV } from "@/lib/types";
import { usePlanLimits } from "@/lib/hooks/usePlanLimits";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { ProfileForm, type ProfileFormData } from "@/components/profiles/ProfileForm";
import nocData from "@/lib/noc-data.json";

interface NocEntry { code: string; title: string; examples: string[] }
interface NocSuggestion { title: string; code: string; nocTitle: string }

function searchNoc(query: string): NocEntry[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const scored: Array<{ entry: NocEntry; score: number }> = [];
  for (const entry of nocData as NocEntry[]) {
    const t = entry.title.toLowerCase();
    if (t.startsWith(q)) scored.push({ entry, score: 3 });
    else if (t.includes(q)) scored.push({ entry, score: 2 });
    else if (entry.examples.some((e) => e.toLowerCase().includes(q))) scored.push({ entry, score: 1 });
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, 4).map((r) => r.entry);
}

function buildNocSuggestions(profession: string, existingTitles: string[]): NocSuggestion[] {
  const matches = searchNoc(profession);
  const seen = new Set(existingTitles.map((t) => t.toLowerCase()));
  const out: NocSuggestion[] = [];
  for (const entry of matches) {
    for (const ex of entry.examples) {
      if (seen.has(ex.toLowerCase())) continue;
      seen.add(ex.toLowerCase());
      out.push({ title: ex, code: entry.code, nocTitle: entry.title });
      if (out.length >= 15) return out;
    }
  }
  return out;
}

// ─── CV Section ──────────────────────────────────────────────────────────────
function CvSection({ cv, queryClient, searchConfigId }: { cv: CV | null | undefined; queryClient: QueryClient; searchConfigId: string }) {
  const t = useTranslations("profiles");
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [replacing, setReplacing] = React.useState(false);
  const [tab, setTab] = React.useState<"upload" | "paste">("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [text, setText] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  function cancelReplace() {
    setReplacing(false);
    setFile(null);
    setText("");
    setError(null);
    setSuccess(false);
  }

  async function handleSave() {
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      if (tab === "upload") {
        if (!file) return;
        await uploadCVFile(file, searchConfigId);
      } else {
        const trimmed = text.trim();
        if (trimmed.length < 200) { setError(t("cvTooShort")); return; }
        if (trimmed.length > 50000) { setError(t("cvTooLong")); return; }
        await uploadCVText(trimmed, "resume.txt", searchConfigId);
      }
      await queryClient.invalidateQueries({ queryKey: ["cv", searchConfigId] });
      setSuccess(true);
      setReplacing(false);
      setFile(null);
      setText("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("cvUploadError"));
    } finally {
      setSaving(false);
    }
  }

  const canSave = tab === "upload" ? !!file : text.trim().length >= 200;

  return (
    <div className="mx-8 mt-6 flex flex-col gap-3 p-5 bg-surface-container-lowest rounded-2xl border border-outline-variant/20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
          {t("cvSectionTitle")}
        </span>
        {!replacing && (
          <button
            type="button"
            onClick={() => { setReplacing(true); setSuccess(false); }}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline transition-colors"
          >
            <span className="material-symbols-outlined text-[14px]">upload_file</span>
            {t("cvReplaceBtn")}
          </button>
        )}
      </div>

      {/* Current CV display */}
      {!replacing && (
        cv ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-low rounded-xl">
            <span
              className="material-symbols-outlined text-[24px] text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              description
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-on-surface truncate">{cv.filename}</span>
              <span className="text-xs text-on-surface-variant">
                {t("cvUploaded")} {new Date(cv.uploaded_at).toLocaleDateString()}
              </span>
            </div>
            {success && (
              <span
                className="ml-auto material-symbols-outlined text-[18px] text-secondary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            )}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">{t("cvNoCV")}</p>
        )
      )}

      {/* Replace UI */}
      {replacing && (
        <div className="flex flex-col gap-4">
          {/* Tab toggle */}
          <div className="flex bg-surface-container-high rounded-xl p-1 gap-1">
            {(["upload", "paste"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => { setTab(k); setError(null); setFile(null); setText(""); }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                  tab === k
                    ? "bg-surface-container-lowest text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {k === "upload" ? t("cvUploadPdf") : t("cvPasteText")}
              </button>
            ))}
          </div>

          {tab === "upload" ? (
            <div
              className={`flex flex-col items-center justify-center gap-3 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                file
                  ? "border-secondary bg-secondary-container/20"
                  : "border-outline-variant hover:border-primary hover:bg-primary-fixed/20"
              }`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = e.dataTransfer.files[0];
                if (dropped?.type === "application/pdf") { setFile(dropped); setError(null); }
                else setError(t("cvInvalidType"));
              }}
            >
              <span className="material-symbols-outlined text-3xl text-primary">upload_file</span>
              {file ? (
                <span className="text-sm font-bold text-secondary">{file.name}</span>
              ) : (
                <>
                  <span className="text-sm font-semibold text-on-surface">{t("cvDragDrop")}</span>
                  <span className="text-xs text-on-surface-variant">{t("cvBrowse")}</span>
                </>
              )}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  const sel = e.target.files?.[0] || null;
                  if (sel && sel.type !== "application/pdf") { setError(t("cvInvalidType")); setFile(null); e.target.value = ""; return; }
                  setError(null);
                  setFile(sel);
                }}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your CV / resume text here..."
                rows={8}
                className="w-full p-4 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 text-sm text-on-surface placeholder:text-on-surface-variant resize-none outline-none transition-all"
              />
              <div className="flex justify-between text-xs text-on-surface-variant">
                <span className={text.trim().length > 0 && text.trim().length < 200 ? "text-error" : ""}>
                  {text.trim().length} / 200 min
                </span>
                <span className={text.trim().length > 50000 ? "text-error" : ""}>
                  {text.trim().length > 50000
                    ? `${text.trim().length - 50000} over limit`
                    : `${50000 - text.trim().length} remaining`}
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

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={cancelReplace}
              className="px-4 py-2 text-sm font-semibold text-on-surface-variant border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors"
            >
              {t("cvCancelReplace")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all"
            >
              {saving ? (
                <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="material-symbols-outlined text-[16px]">save</span>
              )}
              {saving ? t("cvSaving") : t("cvSaveBtn")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EditProfilePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const t = useTranslations("profiles");
  const router = useRouter();
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const queryClient = useQueryClient();

  const [resolvedParams, setResolvedParams] = React.useState<{ id: string } | null>(null);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [analyzingConfig, setAnalyzingConfig] = React.useState(false);
  const [analyzeError, setAnalyzeError] = React.useState<string | null>(null);
  const [nocSuggestions, setNocSuggestions] = React.useState<NocSuggestion[]>([]);
  const [applyingTitle, setApplyingTitle] = React.useState<string | null>(null);
  const [panelOpen, setPanelOpen] = React.useState(false);
  const { limits } = usePlanLimits();

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", resolvedParams?.id],
    queryFn: () => getSearchProfile(resolvedParams!.id),
    enabled: !!resolvedParams?.id,
  });

  const { data: cv } = useQuery({
    queryKey: ["cv", resolvedParams?.id],
    queryFn: () => getCV(resolvedParams!.id),
    enabled: !!resolvedParams?.id,
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: (data: any) => updateSearchProfile(resolvedParams!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["profile", resolvedParams?.id] });
    },
  });

  const { mutateAsync: remove } = useMutation({
    mutationFn: () => deleteSearchProfile(resolvedParams!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      router.push(`${prefix}/dashboard/profiles`);
    },
  });

  async function handleAnalyze() {
    if (!resolvedParams?.id || !profile) return;
    setAnalyzingConfig(true);
    setAnalyzeError(null);
    setAnalysis(null);
    setPanelOpen(true);

    // NOC suggestions — client-side, instant, individual job titles from "All examples"
    const sugg = profile.profession ? buildNocSuggestions(profile.profession, profile.job_titles) : [];
    setNocSuggestions(sugg);

    try {
      const result = await analyzeSearchConfig(resolvedParams.id, {
        profession: profile.profession,
        country: profile.country,
        job_titles: profile.job_titles,
        locations: profile.locations,
        include_terms: profile.include_terms,
        exclude_terms: profile.exclude_terms,
        alert_sensitivity: profile.alert_sensitivity,
      });
      setAnalysis(result.analysis);
    } catch (err: unknown) {
      setAnalyzeError(err instanceof Error ? err.message : t("analyzeError"));
    } finally {
      setAnalyzingConfig(false);
    }
  }

  async function applyNocSuggestion(title: string) {
    if (!profile || !resolvedParams?.id) return;
    const maxTitles = limits?.max_job_titles_per_profile ?? 5;
    if (profile.job_titles.length >= maxTitles) return;
    setApplyingTitle(title);
    try {
      await update({ job_titles: [...profile.job_titles, title] });
      setNocSuggestions((prev) => prev.filter((s) => s.title !== title));
    } finally {
      setApplyingTitle(null);
    }
  }

  async function handleSubmit(data: ProfileFormData) {
    setSaveError(null);
    try {
      const { is_active, business_hours_start, business_hours_end, ...rest } = data;
      await update({
        ...rest,
        is_active: is_active ?? true,
        title_exclude_terms: (rest as any).title_exclude_terms ?? [],
        business_hours_start: parseInt((business_hours_start as string).split(":")[0], 10),
        business_hours_end: parseInt((business_hours_end as string).split(":")[0], 10),
      });
      router.push(`${prefix}/dashboard/profiles`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("saveProfileError");
      setSaveError(message);
    }
  }

  if (isLoading || !resolvedParams) {
    return (
      <div className="flex flex-col flex-1">
        <DashboardTopBar title={t("editProfileTitle")} />
        <div className="flex items-center justify-center flex-1">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("editProfileTitle")} />
      <main>
        <div className="flex items-center justify-between px-8 pt-6 pb-0">
          <div>
            <h2 className="text-2xl font-display font-bold text-on-surface">{t("editProfileTitle")}</h2>
            {profile && (
              <p className="text-sm text-on-surface-variant mt-1">{profile.name}</p>
            )}
          </div>
          {profile && (
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzingConfig}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-on-primary bg-primary-gradient rounded-xl shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all"
            >
              {analyzingConfig ? (
                <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <span
                  className="material-symbols-outlined text-[16px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              )}
              {analyzingConfig ? t("analyzing") : t("analyzeConfig")}
            </button>
          )}
        </div>

        {/* Hint — always visible */}
        {profile && !panelOpen && (
          <p className="px-8 mt-2 text-xs text-on-surface-variant flex items-center gap-1.5">
            <span
              className="material-symbols-outlined text-[14px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            {t("analyzeHint")}
          </p>
        )}

        {/* AI Analysis panel */}
        {panelOpen && (
          <div className="mx-8 mt-4 flex flex-col gap-4 p-5 bg-surface-container-low rounded-2xl border border-outline-variant/20">
            {/* Panel header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[16px] text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  {t("aiAnalysis")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => { setAnalysis(null); setAnalyzeError(null); setNocSuggestions([]); setPanelOpen(false); }}
                className="w-6 h-6 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>

            {/* NOC suggested job titles */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                  {t("aiSuggestedTitles")}
                </span>
                <span className="text-[10px] text-on-surface-variant/60">
                  {profile?.country === "Canada" ? t("aiSuggestedTitlesHintNoc") : t("aiSuggestedTitlesHint")}
                </span>
              </div>
              {nocSuggestions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {nocSuggestions.map((suggestion) => {
                    const atLimit = (profile?.job_titles.length ?? 0) >= (limits?.max_job_titles_per_profile ?? 5);
                    const isApplying = applyingTitle === suggestion.title;
                    return (
                      <button
                        key={`${suggestion.code}-${suggestion.title}`}
                        type="button"
                        onClick={() => applyNocSuggestion(suggestion.title)}
                        disabled={atLimit || !!applyingTitle}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          atLimit
                            ? "bg-surface-container border-outline-variant/20 text-on-surface-variant/40 cursor-not-allowed"
                            : "bg-primary/8 border-primary/20 text-primary hover:bg-primary/15 active:scale-95"
                        }`}
                        title={atLimit ? t("aiTitleLimitFull") : suggestion.nocTitle}
                      >
                        {isApplying ? (
                          <span className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span className="material-symbols-outlined text-[12px]">add</span>
                        )}
                        {suggestion.title}
                      </button>
                    );
                  })}
                </div>
              ) : analyzingConfig ? (
                <div className="flex gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-7 w-32 rounded-full bg-surface-container animate-pulse" />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-on-surface-variant/60 italic">{t("aiSuggestedNoProfession")}</p>
              )}
            </div>

            {/* Divider */}
            {(analysis || analyzeError || analyzingConfig) && (
              <div className="border-t border-outline-variant/20" />
            )}

            {/* Backend AI analysis */}
            {analyzingConfig && !analysis && !analyzeError && (
              <div className="flex flex-col gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-3 rounded bg-surface-container animate-pulse ${i === 3 ? "w-2/3" : "w-full"}`} />
                ))}
              </div>
            )}
            {analyzeError && (
              <p className="text-sm text-error">{analyzeError}</p>
            )}
            {analysis && (
              <div className="flex flex-col gap-1.5">
                {analysis.split("\n").filter(Boolean).map((line, i) => (
                  <p key={i} className="text-sm text-on-surface leading-relaxed">{line}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CV Section */}
        <CvSection cv={cv} queryClient={queryClient} searchConfigId={resolvedParams.id} />

        {saveError && (
          <div className="mx-8 mt-4 flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {saveError}
          </div>
        )}
        {profile && (
          <ProfileForm
            defaultValues={profile}
            onSubmit={handleSubmit}
            onDelete={() => remove()}
            limits={limits}
          />
        )}
      </main>
    </div>
  );
}

import React from "react";
