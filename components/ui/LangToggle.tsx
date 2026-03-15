"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "@/i18n/routing";

interface LangToggleProps {
  variant?: "light" | "dark";
}

export function LangToggle({ variant = "light" }: LangToggleProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("jobleo-locale", next);
    }
    // Replace current locale prefix with new one
    const segments = pathname.split("/");
    const isLocaleSegment = routing.locales.includes(segments[1] as "en" | "es");
    const withoutLocale = isLocaleSegment ? segments.slice(2).join("/") : segments.slice(1).join("/");
    const newPath = next === routing.defaultLocale
      ? `/${withoutLocale}`
      : `/${next}/${withoutLocale}`;
    router.push(newPath || "/");
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
