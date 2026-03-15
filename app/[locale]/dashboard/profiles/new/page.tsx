"use client";

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
    const { is_active, ...rest } = data;
    await mutateAsync(rest);
    router.push(`${prefix}/dashboard/profiles`);
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("newProfileTitle")} />
      <main>
        <div className="px-8 pt-6 pb-0">
          <h2 className="text-xl font-bold font-heading text-text-primary">{t("newProfileTitle")}</h2>
        </div>
        <ProfileForm onSubmit={handleSubmit} isNew />
      </main>
    </div>
  );
}
