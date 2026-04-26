"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getAdminUsers } from "@/lib/api";
import { UsersTable } from "@/components/admin/UsersTable";
import { useToast } from "@/components/ui/Toast";

export default function AdminUsersPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAdminUsers,
  });

  useEffect(() => {
    if (!error) return;
    const msg = error instanceof Error ? error.message : "Failed to load users";
    if (msg.includes("403")) {
      router.push("/dashboard");
    } else {
      addToast(msg, "error");
    }
  }, [error, addToast, router]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-display text-on-surface">Users</h1>
          <p className="text-sm text-on-surface-variant font-display mt-0.5">
            {data ? `${data.total} total users` : "Manage user plans and accounts"}
          </p>
        </div>
      </div>

      {/* Plan legend */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest">Plan badges:</span>
        <span className="text-xs font-bold font-display bg-surface-container text-on-surface-variant px-2 py-0.5 rounded-full">Free</span>
        <span className="text-xs font-bold font-display bg-primary text-on-primary px-2 py-0.5 rounded-full">Pro</span>
        <span className="text-xs font-bold font-display bg-secondary text-on-secondary px-2 py-0.5 rounded-full">Premium</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-14 bg-surface-container-lowest rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <UsersTable users={data.users} />
      ) : null}
    </div>
  );
}
