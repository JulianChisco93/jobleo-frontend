"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSearchProfile, updateSearchProfile, deleteSearchProfile } from "@/lib/api";
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
        </div>
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
          />
        )}
      </main>
    </div>
  );
}

import React from "react";
