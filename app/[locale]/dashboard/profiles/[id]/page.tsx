"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSearchProfile, updateSearchProfile, deleteSearchProfile, analyzeSearchConfig } from "@/lib/api";
import { usePlanLimits } from "@/lib/hooks/usePlanLimits";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { ProfileForm, type ProfileFormData } from "@/components/profiles/ProfileForm";

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
  const { limits } = usePlanLimits();

  React.useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile", resolvedParams?.id],
    queryFn: () => getSearchProfile(resolvedParams!.id),
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
    if (!resolvedParams?.id) return;
    setAnalyzingConfig(true);
    setAnalyzeError(null);
    setAnalysis(null);
    try {
      const result = await analyzeSearchConfig(resolvedParams.id);
      setAnalysis(result.analysis);
    } catch (err: unknown) {
      setAnalyzeError(err instanceof Error ? err.message : t("analyzeError"));
    } finally {
      setAnalyzingConfig(false);
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

        {/* AI Analysis panel */}
        {(analysis || analyzeError) && (
          <div className="mx-8 mt-4 flex flex-col gap-3 p-4 bg-surface-container-low rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                {t("aiAnalysis")}
              </span>
              <button
                type="button"
                onClick={() => { setAnalysis(null); setAnalyzeError(null); }}
                className="w-6 h-6 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </div>
            {analyzeError ? (
              <p className="text-sm text-error">{analyzeError}</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {analysis!.split("\n").filter(Boolean).map((line, i) => (
                  <p key={i} className="text-sm text-on-surface leading-relaxed">{line}</p>
                ))}
              </div>
            )}
          </div>
        )}

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
