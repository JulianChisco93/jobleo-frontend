"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSearchProfile, getSearchProfiles } from "@/lib/api";
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

  const { mutateAsync } = useMutation({
    mutationFn: createSearchProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["profiles"] }),
  });

  async function handleSubmit(data: ProfileFormData) {
    if (profiles.length >= 3) {
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
    } catch {
      setSaveError(t("saveProfileError"));
    }
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("newProfileTitle")} />
      <main>
        <div className="px-8 pt-6 pb-0">
          <h2 className="text-xl font-bold font-heading text-text-primary">{t("newProfileTitle")}</h2>
          {saveError && (
            <div className="mt-4 px-4 py-3 text-sm font-heading text-white bg-accent-red border-2 border-border-color">
              {saveError}
            </div>
          )}
        </div>
        <ProfileForm onSubmit={handleSubmit} isNew />
      </main>
    </div>
  );
}
