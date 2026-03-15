"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe } from "@/lib/api";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { Toggle } from "@/components/ui/Toggle";
import { LangToggle } from "@/components/ui/LangToggle";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const TIMEZONES = [
  "America/New_York (UTC-5)",
  "America/Chicago (UTC-6)",
  "America/Denver (UTC-7)",
  "America/Los_Angeles (UTC-8)",
  "America/Toronto (UTC-5)",
  "America/Vancouver (UTC-8)",
  "America/Mexico_City (UTC-6)",
  "America/Bogota (UTC-5)",
  "America/Lima (UTC-5)",
  "America/Buenos_Aires (UTC-3)",
  "America/Santiago (UTC-3)",
  "America/Sao_Paulo (UTC-3)",
  "Europe/London (UTC+0)",
  "Europe/Madrid (UTC+1)",
  "Asia/Dubai (UTC+4)",
  "Asia/Tokyo (UTC+9)",
  "Australia/Sydney (UTC+11)",
];

interface SettingsFormData {
  display_name: string;
  timezone: string;
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [businessHours, setBusinessHours] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email || "");
    });
  }, []);

  const { data: me } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });

  const { mutateAsync: update } = useMutation({
    mutationFn: updateMe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  const { register, handleSubmit, reset } = useForm<SettingsFormData>({
    defaultValues: {
      display_name: me?.display_name || "",
      timezone: me?.timezone || "America/Toronto (UTC-5)",
    },
  });

  useEffect(() => {
    if (me) {
      reset({
        display_name: me.display_name || "",
        timezone: me.timezone || "America/Toronto (UTC-5)",
      });
    }
  }, [me, reset]);

  async function onSubmit(data: SettingsFormData) {
    await update({ display_name: data.display_name, timezone: data.timezone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSavePhone() {
    await update({ whatsapp_number: newPhone });
    setEditingPhone(false);
  }

  async function handleDeleteAccount() {
    if (!confirm(t("dangerZoneDesc"))) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <DashboardTopBar title={t("pageTitle")} userName={me?.display_name} />

      <main className="flex flex-col gap-6 p-8 max-w-3xl">
        <div>
          <h2 className="text-xl font-bold font-heading text-text-primary">{t("pageTitle")}</h2>
          <p className="text-sm font-heading text-text-secondary mt-1">{t("pageSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* Account Section */}
          <div className="flex flex-col gap-5 p-6 bg-bg-card" style={{ border: "2px solid #000000" }}>
            <h3 className="text-base font-bold font-heading text-text-primary">{t("accountSection")}</h3>
            <div className="grid grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
                  {t("displayNameLabel")}
                </label>
                <input
                  {...register("display_name")}
                  className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
                  {t("emailLabel")}
                </label>
                <input
                  value={userEmail}
                  disabled
                  className="h-11 px-4 border-2 bg-bg-page text-sm font-heading text-text-muted outline-none"
                  style={{ borderColor: "#E0E0E0" }}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold tracking-wider font-mono text-text-secondary uppercase">
                {t("timezoneLabel")}
              </label>
              <select
                {...register("timezone")}
                className="h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {/* WhatsApp Section */}
          <div className="flex flex-col gap-4 p-6 bg-bg-card" style={{ border: "2px solid #000000" }}>
            <h3 className="text-base font-bold font-heading text-text-primary">{t("whatsappSection")}</h3>
            {editingPhone ? (
              <div className="flex items-center gap-3">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="flex-1 h-11 px-4 border-2 border-border-color bg-bg-card text-sm font-heading text-text-primary outline-none"
                />
                <button
                  type="button"
                  onClick={handleSavePhone}
                  className="px-4 py-2.5 text-sm font-bold font-heading text-white bg-accent-blue border-2 border-border-color"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingPhone(false)}
                  className="px-4 py-2.5 text-sm font-bold font-heading text-text-secondary border-2 border-border-light"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-mono font-bold text-text-secondary uppercase tracking-wider mb-1">
                    {t("currentNumber")}
                  </p>
                  <p className="text-sm font-heading text-text-primary">
                    {me?.whatsapp_number || "Not set"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewPhone(me?.whatsapp_number || "");
                    setEditingPhone(true);
                  }}
                  className="px-5 py-2.5 text-sm font-bold font-heading text-text-primary border-2 border-border-color hover:bg-bg-page transition-colors"
                >
                  {t("editNumber")}
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="flex flex-col gap-4 p-6 bg-bg-card" style={{ border: "2px solid #000000" }}>
            <h3 className="text-base font-bold font-heading text-text-primary">{t("notificationsSection")}</h3>
            <Toggle
              checked={businessHours}
              onChange={setBusinessHours}
              label={t("businessHoursGlobal")}
            />
          </div>

          {/* Language */}
          <div className="flex flex-col gap-4 p-6 bg-bg-card" style={{ border: "2px solid #000000" }}>
            <h3 className="text-base font-bold font-heading text-text-primary">{t("languageSection")}</h3>
            <LangToggle variant="light" />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-8 py-2.5 text-sm font-bold font-heading text-white bg-accent-blue border-2 border-border-color hover:opacity-90 transition-opacity"
            >
              {saved ? t("saved") : t("saveChanges")}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div
          className="flex flex-col gap-4 p-6"
          style={{ border: "2px solid #E53935" }}
        >
          <h3 className="text-base font-bold font-heading text-accent-red">{t("dangerZone")}</h3>
          <p className="text-sm font-heading text-text-secondary">{t("dangerZoneDesc")}</p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="self-start px-5 py-2.5 text-sm font-bold font-heading text-accent-red border-2 border-accent-red hover:bg-red-50 transition-colors"
          >
            {t("deleteAccount")}
          </button>
        </div>
      </main>
    </div>
  );
}
