"use client";

import { useTranslations } from "next-intl";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { HorizonLimits } from "@/components/billing/HorizonLimits";
import { HORIZON_OPTIONS, RECOMMENDED_HORIZON, daysUntil } from "@/lib/plans";
import { hasPaidAccess, type Plan } from "@/lib/types";

/** Show the renewal prompt once a pass is this close to expiring. */
const RENEWAL_WINDOW_DAYS = 5;

interface Props {
  plan: Plan;
  planEndsAt?: string | null;
}

export function UpgradeBanner({ plan, planEndsAt }: Props) {
  const t = useTranslations("dashboard");
  const tp = useTranslations("pricing");

  const daysLeft = daysUntil(planEndsAt);

  // Paid users only see this banner when their pass is about to lapse.
  if (hasPaidAccess(plan)) {
    if (daysLeft === null || daysLeft > RENEWAL_WINDOW_DAYS) return null;
    return (
      <section className="mt-10 bg-secondary-container rounded-2xl px-6 md:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold tracking-widest text-on-secondary-container/50 uppercase block mb-1.5">
            {t("passExpiringBadge")}
          </span>
          <p className="font-display font-bold text-lg text-on-secondary-container mb-1">
            {daysLeft === 0 ? t("passExpiresToday") : t("passExpiresInDays", { days: daysLeft })}
          </p>
          <p className="text-sm text-on-secondary-container/70">{t("passRenewHint")}</p>
        </div>
        <CheckoutButton
          horizon={RECOMMENDED_HORIZON}
          label={t("renewPassCtaLabel")}
          className="flex-shrink-0 px-8 py-3 text-sm font-bold bg-secondary text-on-secondary rounded-xl hover:bg-secondary/90 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary"
        />
      </section>
    );
  }

  return (
    <section className="mt-10 bg-surface-container-low rounded-2xl overflow-hidden">
      <div className="px-6 md:px-8 pt-6 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="font-display font-bold text-xl text-on-surface">{t("upgradeTitle")}</h3>
        <span className="text-xs text-on-surface-variant font-medium">{t("upgradeFreeNote")}</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-surface-container-high">
        {HORIZON_OPTIONS.map((option) => {
          const recommended = option.horizon === RECOMMENDED_HORIZON;
          return (
            <div
              key={option.horizon}
              className={`px-5 pt-5 pb-6 flex flex-col gap-4 ${
                recommended ? "bg-primary-fixed/50" : "bg-surface-container-lowest"
              }`}
            >
              <div>
                <span
                  className={`text-[10px] font-bold tracking-widest uppercase block mb-2 ${
                    recommended ? "text-primary" : "invisible"
                  }`}
                >
                  {tp("mostPopular")}
                </span>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="font-display font-black text-3xl text-on-surface">
                    ${option.price}
                  </span>
                  <span className="text-xs text-on-surface-variant font-semibold">
                    {tp(`horizon${option.messageKey}Name`)}
                  </span>
                </div>
                <HorizonLimits
                  horizon={option.horizon}
                  className="text-xs text-on-surface-variant leading-relaxed"
                />
              </div>
              <CheckoutButton
                horizon={option.horizon}
                label={tp("passCta")}
                className={`mt-auto w-full py-2.5 text-sm font-bold rounded-xl transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary ${
                  recommended
                    ? "bg-primary text-on-primary hover:brightness-110"
                    : "text-primary border border-primary-container hover:bg-primary-fixed"
                }`}
              />
            </div>
          );
        })}
      </div>

      <p className="px-6 md:px-8 py-4 text-xs text-on-surface-variant">
        {tp("noAutoRenewNote")}
      </p>
    </section>
  );
}
