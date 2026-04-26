"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Overview", href: "/admin", icon: "dashboard", exact: true },
  { label: "Users", href: "/admin/users", icon: "group", exact: false },
  { label: "Searches", href: "/admin/searches", icon: "manage_search", exact: false },
  { label: "Server", href: "/admin/server", icon: "dns", exact: false },
];

interface AdminNavProps {
  userEmail: string;
}

export function AdminNav({ userEmail }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="bg-surface-container-lowest border-b border-outline-variant/30 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[22px]"
              style={{ fontVariationSettings: "'FILL' 1, 'wght' 600" }}>
              shield_person
            </span>
            <span className="font-black font-display text-primary text-lg">Jobleo</span>
            <span className="text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest bg-surface-container px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-on-surface-variant hidden sm:block">{userEmail}</span>
            <Link
              href="/dashboard"
              className="text-sm font-semibold font-display text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Dashboard
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm font-semibold font-display text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex gap-1 -mb-px">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href || pathname === `/en${item.href}`
              : pathname.startsWith(item.href) || pathname.startsWith(`/en${item.href}`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold font-display border-b-2 transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline-variant"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[18px]"
                  style={{
                    fontVariationSettings: isActive
                      ? "'FILL' 1, 'wght' 600"
                      : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
