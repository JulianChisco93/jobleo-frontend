"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateMe } from "@/lib/api";
import { DashboardTopBar } from "@/components/layout/DashboardTopBar";
import { Toggle } from "@/components/ui/Toggle";
import { LangToggle } from "@/components/ui/LangToggle";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { PortalButton } from "@/components/billing/PortalButton";
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[var(--shadow-card)]">
      <h3 className="font-display font-bold text-on-surface mb-5">{title}</h3>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations("settings");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [saved, setSaved] = useState(false);
  const [businessHours, setBusinessHours] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [phoneSaveError, setPhoneSaveError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email || "");
    });
  }, []);

  const { data: me } = useQuery({ queryKey: ["me"], queryFn: getMe });
  const { mutateAsync: update } = useMutation({
    mutationFn: updateMe,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["me"] }),
  });

  const { register, handleSubmit, reset } = useForm<SettingsFormData>({
    defaultValues: { display_name: me?.display_name || "", timezone: me?.timezone || "America/Toronto (UTC-5)" },
  });

  useEffect(() => {
    if (me) reset({ display_name: me.display_name || "", timezone: me.timezone || "America/Toronto (UTC-5)" });
  }, [me, reset]);

  async function onSubmit(data: SettingsFormData) {
    await update({ display_name: data.display_name, timezone: data.timezone });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSavePhone() {
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    if (!e164Regex.test(newPhone)) { setPhoneError(t("phoneFormatError")); return; }
    setPhoneError(null);
    setPhoneSaveError(null);
    try {
      await update({ whatsapp_number: newPhone });
      setEditingPhone(false);
    } catch {
      setPhoneSaveError(t("phoneSaveError"));
    }
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

      <main className="max-w-3xl mx-auto w-full px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-display font-bold text-on-surface">{t("pageTitle")}</h2>
          <p className="text-on-surface-variant mt-1">{t("pageSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Account */}
          <Section title={t("accountSection")}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {t("displayNameLabel")}
                </label>
                <input
                  {...register("display_name")}
                  className="px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:bg-surface-container-lowest focus:ring-0 transition-all text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {t("emailLabel")}
                </label>
                <input
                  value={userEmail}
                  disabled
                  className="px-4 py-3 rounded-xl bg-surface-container-high text-on-surface-variant text-sm cursor-not-allowed"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 mt-5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {t("timezoneLabel")}
              </label>
              <select
                {...register("timezone")}
                className="px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 transition-all text-sm"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </Section>

          {/* WhatsApp */}
          <Section title={t("whatsappSection")}>
            {editingPhone ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => { setNewPhone(e.target.value); setPhoneError(null); }}
                    placeholder="+15551234567"
                    className="flex-1 px-4 py-3 rounded-xl bg-surface-container-low border-transparent focus:border-primary focus:ring-0 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSavePhone}
                    className="px-4 py-2.5 text-sm font-bold text-on-primary bg-primary rounded-xl"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingPhone(false); setPhoneError(null); setPhoneSaveError(null); }}
                    className="px-4 py-2.5 text-sm font-bold text-on-surface-variant border border-outline-variant rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
                {phoneError && <p className="text-xs text-error">{phoneError}</p>}
                {phoneSaveError && <p className="text-xs text-error">{phoneSaveError}</p>}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                    {t("currentNumber")}
                  </p>
                  <p className="text-sm font-semibold text-on-surface">
                    {me?.whatsapp_number || "Not set"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setNewPhone(me?.whatsapp_number || ""); setEditingPhone(true); }}
                  className="px-4 py-2 text-sm font-bold text-primary border border-primary-container rounded-xl hover:bg-primary-fixed transition-colors"
                >
                  {t("editNumber")}
                </button>
              </div>
            )}
          </Section>

          {/* Subscription */}
          <Section title={t("subscriptionSection")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1">
                  {t("currentPlanLabel")}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-on-surface capitalize">
                    {me?.plan ?? "free"}
                  </p>
                  {me?.plan === "pro" && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-primary text-on-primary rounded-full uppercase tracking-widest">
                      Pro
                    </span>
                  )}
                </div>
                {me?.subscription_status && me.subscription_status !== "active" && (
                  <p className="text-xs text-error mt-1 capitalize">
                    {t("subscriptionStatus")}: {me.subscription_status.replace("_", " ")}
                  </p>
                )}
              </div>

              {me?.plan === "pro" ? (
                <PortalButton
                  label={t("manageSubscription")}
                  className="px-4 py-2 text-sm font-bold text-primary border border-primary-container rounded-xl hover:bg-primary-fixed transition-colors"
                />
              ) : (
                <CheckoutButton
                  label={t("upgradeToPro")}
                  className="px-4 py-2 text-sm font-bold text-on-primary bg-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
                />
              )}
            </div>
          </Section>

          {/* Notifications */}
          <Section title={t("notificationsSection")}>
            <Toggle checked={businessHours} onChange={setBusinessHours} label={t("businessHoursGlobal")} />
          </Section>

          {/* Language */}
          <Section title={t("languageSection")}>
            <LangToggle />
          </Section>

          {/* Save */}
          <div className="flex justify-end">
            <button
              type="submit"
              className={`px-8 py-3 text-sm font-bold rounded-xl transition-all ${
                saved
                  ? "bg-secondary text-on-secondary"
                  : "bg-primary-gradient text-on-primary hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {saved ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  {t("saved")}
                </span>
              ) : (
                t("saveChanges")
              )}
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="mt-6 border border-error/30 rounded-xl p-6">
          <h3 className="font-display font-bold text-error mb-2">{t("dangerZone")}</h3>
          <p className="text-sm text-on-surface-variant mb-4">{t("dangerZoneDesc")}</p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-5 py-2.5 text-sm font-bold text-error border border-error rounded-xl hover:bg-error-container transition-colors"
          >
            {t("deleteAccount")}
          </button>
        </div>
      </main>
    </div>
  );
}
