"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSearchProfile, getSearchProfiles } from "@/lib/api";
import { usePlanLimits } from "@/lib/hooks/usePlanLimits";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { ProfileForm, type ProfileFormData } from "@/components/profiles/ProfileForm";

export default function NewProfilePage() {
  const t = useTranslations("profiles");
  const router = useRouter();
  const locale = useLocale();
  const prefix = locale === "en" ? "" : `/${locale}`;
  const queryClient = useQueryClient();
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data: profiles = [] } = useQuery({
    queryKey: ["profiles"],
    queryFn: getSearchProfiles,
  });

  const { limits } = usePlanLimits();

  const { mutateAsync } = useMutation({
    mutationFn: createSearchProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });

  async function handleSubmit(data: ProfileFormData) {
    if (profiles.length >= limits.max_profiles) {
      alert(t("maxProfilesReached"));
      return;
    }
    setSaveError(null);
    try {
      const { is_active, business_hours_start, business_hours_end, ...rest } = data;
      await mutateAsync({
        ...rest,
        title_exclude_terms: [],
        business_hours_start: parseInt((business_hours_start as string).split(":")[0], 10),
        business_hours_end: parseInt((business_hours_end as string).split(":")[0], 10),
      });
      router.push(`${prefix}/dashboard/profiles`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("saveProfileError");
      setSaveError(message);
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("newProfileTitle")} />
      <main>
        <div className="px-8 pt-6 pb-0">
          <h2 className="text-2xl font-display font-bold text-on-surface">{t("newProfileTitle")}</h2>
          {saveError && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-error-container text-on-error-container rounded-xl text-sm">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {saveError}
            </div>
          )}
        </div>
        <ProfileForm onSubmit={handleSubmit} isNew limits={limits} />
      </main>
    </div>
  );
}
