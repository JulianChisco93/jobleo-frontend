"use client";

import { useTranslations } from "next-intl";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import type { Plan } from "@/lib/types";

function FeatureItem({
  text,
  iconClass,
  textClass,
}: {
  text: string;
  iconClass: string;
  textClass: string;
}) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`material-symbols-outlined text-[16px] flex-shrink-0 ${iconClass}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        check_circle
      </span>
      <span className={`text-sm ${textClass}`}>{text}</span>
    </li>
  );
}

export function UpgradeBanner({ plan }: { plan: Plan }) {
  const t = useTranslations("dashboard");
  const tp = useTranslations("pricing");

  if (plan === "premium") return null;

  const proFeatures = [tp("proFeature1"), tp("proFeature2"), tp("proFeature4")];
  const premiumFeatures = [tp("premiumFeature1"), tp("premiumFeature2"), tp("premiumFeature4")];
  const [proAmount] = tp("proPrice").split(" / ");
  const [premiumAmount] = tp("premiumPrice").split(" / ");

  if (plan === "pro") {
    return (
      <section className="mt-10 bg-secondary-container rounded-2xl px-6 md:px-8 py-6 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
        <div className="flex-1 min-w-0">
          <span className="text-[10px] font-bold tracking-widest text-on-secondary-container/50 uppercase block mb-1.5">
            {tp("premiumBadge")}
          </span>
          <p className="font-display font-bold text-lg text-on-secondary-container mb-1">
            {t("upgradeProOnlyTitle")}
          </p>
          <p className="text-sm text-on-secondary-container/70">
            {premiumFeatures.join(" · ")}
          </p>
        </div>
        <CheckoutButton
          plan="premium"
          label={t("upgradePremiumCtaLabel")}
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

      <div className="grid md:grid-cols-2">
        {/* Pro */}
        <div className="bg-surface-container-lowest px-6 md:px-8 pt-5 pb-6 flex flex-col gap-5">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-primary/60 uppercase block mb-2">
              {tp("proBadge")}
            </span>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-display font-black text-3xl text-primary">{proAmount}</span>
              <span className="text-sm text-on-surface-variant font-medium">/ mo</span>
            </div>
            <p className="text-xs text-on-surface-variant">{tp("proTagline")}</p>
          </div>
          <ul className="flex flex-col gap-2 flex-1">
            {proFeatures.map((f) => (
              <FeatureItem key={f} text={f} iconClass="text-primary" textClass="text-on-surface-variant" />
            ))}
          </ul>
          <CheckoutButton
            plan="pro"
            label={t("upgradeProCtaLabel")}
            className="w-full py-3 text-sm font-bold bg-primary text-on-primary rounded-xl hover:brightness-110 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          />
        </div>

        {/* Premium — visually heavier: full green bleed, larger price */}
        <div className="bg-secondary-container px-6 md:px-8 pt-5 pb-6 flex flex-col gap-5">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-on-secondary-container/50 uppercase block mb-2">
              {tp("premiumBadge")}
            </span>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-display font-black text-4xl text-on-secondary-container">{premiumAmount}</span>
              <span className="text-sm text-on-secondary-container/60 font-medium">/ mo</span>
            </div>
            <p className="text-xs text-on-secondary-container/70">{tp("premiumTagline")}</p>
          </div>
          <ul className="flex flex-col gap-2 flex-1">
            {premiumFeatures.map((f) => (
              <FeatureItem key={f} text={f} iconClass="text-secondary" textClass="text-on-secondary-container" />
            ))}
          </ul>
          <CheckoutButton
            plan="premium"
            label={t("upgradePremiumCtaLabel")}
            className="w-full py-3 text-sm font-bold bg-secondary text-on-secondary rounded-xl hover:bg-secondary/90 transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-secondary"
          />
        </div>
      </div>
    </section>
  );
}
