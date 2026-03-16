"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

interface LangToggleProps {
  variant?: "light" | "dark";
}

export function LangToggle({ variant = "light" }: LangToggleProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
  }

  const isDark = variant === "dark";
  const base = isDark
    ? "px-3 py-1 text-xs font-bold font-mono border transition-colors"
    : "px-3 py-1 text-xs font-bold font-mono border transition-colors";

  return (
    <div className="flex" style={{ border: "2px solid", borderColor: isDark ? "#ffffff" : "#000000" }}>
      {routing.locales.map((loc) => {
        const isActive = locale === loc;
        const style = isActive
          ? { background: isDark ? "#ffffff" : "#000000", color: isDark ? "#000000" : "#ffffff" }
          : { background: "transparent", color: isDark ? "#ffffff" : "#000000" };
        return (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className="px-3 py-1 text-xs font-bold uppercase transition-colors"
            style={style}
          >
            {loc.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
