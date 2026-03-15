"use client";

import { LangToggle } from "@/components/ui/LangToggle";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface DashboardTopBarProps {
  title: string;
  userName?: string;
}

export function DashboardTopBar({ title, userName }: DashboardTopBarProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const initials = userName
    ? userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "J";

  return (
    <header
      className="flex items-center justify-between px-8 bg-bg-card"
      style={{ height: 64, borderBottom: "2px solid #000000" }}
    >
      <h1 className="text-lg font-bold font-heading text-text-primary">{title}</h1>
      <div className="flex items-center gap-4">
        <LangToggle variant="light" />
        {/* Bell icon */}
        <button className="p-1 hover:opacity-70 transition-opacity">
          <svg width="20" height="20" fill="none" stroke="#000000" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
        {/* Avatar */}
        <button
          onClick={handleSignOut}
          title="Sign out"
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold font-mono hover:opacity-80 transition-opacity"
          style={{ backgroundColor: "#1E88E5" }}
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
