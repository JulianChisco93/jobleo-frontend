import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { ToastProvider } from "@/components/ui/Toast";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.jobleo.app";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  let isAdmin = false;
  try {
    const profile = await fetch(`${BASE_URL}/api/v1/users/me`, {
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    }).then((r) => r.json());
    isAdmin = profile?.is_admin === true;
  } catch {
    // fetch failed — deny access
  }

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-surface">
        <AdminNav userEmail={user.email ?? ""} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </div>
    </ToastProvider>
  );
}
