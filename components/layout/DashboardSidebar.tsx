"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ReactNode;
}

function DashboardIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ProfilesIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function JobsIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function DashboardSidebar() {
  const t = useTranslations("sidebar");
  const locale = useLocale();
  const pathname = usePathname();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const navItems: NavItem[] = [
    { key: "dashboard", label: t("dashboard"), href: `${prefix}/dashboard`, icon: <DashboardIcon /> },
    { key: "profiles", label: t("myProfiles"), href: `${prefix}/dashboard/profiles`, icon: <ProfilesIcon /> },
    { key: "jobs", label: t("jobHistory"), href: `${prefix}/dashboard/jobs`, icon: <JobsIcon /> },
    { key: "settings", label: t("settings"), href: `${prefix}/dashboard/settings`, icon: <SettingsIcon /> },
  ];

  return (
    <aside className="flex flex-col bg-bg-sidebar" style={{ width: 240, minHeight: "100vh" }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div
          className="w-9 h-9 flex items-center justify-center font-bold text-sm font-mono"
          style={{ backgroundColor: "#E53935", color: "#ffffff" }}
        >
          J
        </div>
        <span className="text-base font-bold tracking-widest font-heading text-white">Jobleo</span>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col flex-1 mt-4">
        {navItems.map((item) => {
          const isActive =
            item.href === `${prefix}/dashboard`
              ? pathname === `${prefix}/dashboard` || pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-3 px-6 py-3 transition-colors"
              style={{
                backgroundColor: isActive ? "#E53935" : "transparent",
                color: "#ffffff",
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              <span
                className="text-sm font-semibold font-heading"
                style={{ opacity: isActive ? 1 : 0.7 }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
