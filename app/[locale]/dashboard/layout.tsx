import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MobileSidebarProvider } from "@/components/layout/MobileSidebarContext";

export default async function DashboardLayout({
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

  return (
    <MobileSidebarProvider>
      <div className="flex min-h-screen bg-surface">
        <DashboardSidebar />
        <div className="flex flex-col flex-1 overflow-hidden md:ml-64">{children}</div>
      </div>
    </MobileSidebarProvider>
  );
}
