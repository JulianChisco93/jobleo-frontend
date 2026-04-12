"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useMobileSidebar } from "./MobileSidebarContext";

interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: string; // Material Symbol name
}

function SidebarContent({
  navItems,
  prefix,
  pathname,
  handleSignOut,
  onNavClick,
}: {
  navItems: NavItem[];
  prefix: string;
  pathname: string;
  handleSignOut: () => void;
  onNavClick?: () => void;
}) {
  return (
    <>
      {/* Logo */}
      <div className="mb-10 px-4">
        <h1 className="text-xl font-black text-primary font-display">Jobleo</h1>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mt-1">
          Automated Search
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === `${prefix}/dashboard`
              ? pathname === `${prefix}/dashboard` || pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-surface-container-lowest text-primary shadow-[var(--shadow-card)]"
                  : "text-on-surface-variant hover:bg-surface-container hover:translate-x-0.5"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={{
                  fontVariationSettings: isActive
                    ? "'FILL' 1, 'wght' 600"
                    : "'FILL' 0, 'wght' 400",
                }}
              >
                {item.icon}
              </span>
              <span className="text-sm font-semibold font-display">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mt-auto space-y-1 border-t border-outline-variant/30 pt-6">
        <Link
          href={`${prefix}/dashboard/profiles/new`}
          onClick={onNavClick}
          className="w-full bg-primary-gradient text-on-primary rounded-xl py-3 px-4 flex items-center justify-center gap-2 font-display font-bold text-sm mb-4 transition-transform active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Profile
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full text-on-surface-variant px-4 py-3 flex items-center gap-3 hover:bg-surface-container rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined text-[22px]">logout</span>
          <span className="text-sm font-semibold font-display">Logout</span>
        </button>
      </div>
    </>
  );
}

export function DashboardSidebar() {
  const t = useTranslations("sidebar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useMobileSidebar();
  const prefix = locale === "en" ? "" : `/${locale}`;

  const navItems: NavItem[] = [
    { key: "dashboard", label: t("dashboard"), href: `${prefix}/dashboard`, icon: "dashboard" },
    { key: "profiles", label: t("myProfiles"), href: `${prefix}/dashboard/profiles`, icon: "person_search" },
    { key: "jobs", label: t("jobHistory"), href: `${prefix}/dashboard/jobs`, icon: "history" },
    { key: "settings", label: t("settings"), href: `${prefix}/dashboard/settings`, icon: "settings" },
  ];

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <>
      {/* Desktop sidebar — unchanged */}
      <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-low flex flex-col py-8 px-4 z-40 hidden md:flex">
        <SidebarContent
          navItems={navItems}
          prefix={prefix}
          pathname={pathname}
          handleSignOut={handleSignOut}
        />
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-surface-container-low flex flex-col py-8 px-4 z-50 md:hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-4 right-4 p-2 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>

        <SidebarContent
          navItems={navItems}
          prefix={prefix}
          pathname={pathname}
          handleSignOut={handleSignOut}
          onNavClick={close}
        />
      </aside>
    </>
  );
}
