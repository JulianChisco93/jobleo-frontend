"use client";

import { LangToggle } from "@/components/ui/LangToggle";

interface DashboardTopBarProps {
  title?: string;
  userName?: string;
}

export function DashboardTopBar({ title, userName }: DashboardTopBarProps) {
  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "J";

  return (
    <header className="sticky top-0 w-full z-30 bg-surface-container-lowest/80 backdrop-blur-md shadow-[var(--shadow-card)] flex justify-between items-center px-6 py-4">
      {/* Page title (desktop) */}
      {title && (
        <h2 className="font-display font-extrabold text-lg text-on-surface hidden md:block">
          {title}
        </h2>
      )}
      {/* Jobleo brand (mobile only) */}
      <h2 className="font-display font-extrabold text-lg text-primary md:hidden">Jobleo</h2>

      <div className="flex items-center gap-5">
        <LangToggle />

        {/* Notification bell */}
        <button className="relative text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
        </button>

        {/* User avatar with initials */}
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
          {userName && (
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface">{userName}</p>
            </div>
          )}
          <div className="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-sm font-bold font-display border-2 border-primary-fixed">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}
