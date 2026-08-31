"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { updateUserPlan, deleteAdminUser, ApiError } from "@/lib/api";
import type { AdminUser, Plan, PlanHorizon } from "@/lib/types";
import { HORIZON_OPTIONS, getHorizonOption } from "@/lib/plans";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";

const PLAN_BADGE: Record<Plan, string> = {
  free: "bg-surface-container text-on-surface-variant",
  paid: "bg-primary text-on-primary",
  pro: "bg-primary text-on-primary",
  premium: "bg-secondary text-on-secondary",
};

const HORIZON_LABEL: Record<PlanHorizon, string> = {
  "7d": "Paid — 7 days",
  "15d": "Paid — 15 days",
  "1m": "Paid — 1 month",
  "3m": "Paid — 3 months",
};

/** The select encodes the pass duration as `paid:<horizon>`. */
function planSelectValue(user: AdminUser): string {
  if (user.plan !== "paid") return user.plan;
  return user.plan_horizon ? `paid:${user.plan_horizon}` : "paid";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

interface UsersTableProps {
  users: AdminUser[];
}

export function UsersTable({ users }: UsersTableProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { addToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState<AdminUser | null>(null);
  const [loadingPlan, setLoadingPlan] = useState<number | null>(null);
  const [loadingDelete, setLoadingDelete] = useState<number | null>(null);

  async function handlePlanChange(user: AdminUser, selectValue: string) {
    const [plan, horizon] = selectValue.split(":") as [Plan, PlanHorizon | undefined];
    setLoadingPlan(user.id);
    try {
      // `horizon` sets plan_horizon and `days` sets plan_ends_at, independently:
      // sending only one leaves the pass with a mismatched expiry date.
      await updateUserPlan(
        user.id,
        plan,
        horizon ? { horizon, days: getHorizonOption(horizon).days } : {}
      );
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      addToast(
        `Plan updated to ${horizon ? HORIZON_LABEL[horizon] : plan} for ${user.email}`,
        "success"
      );
    } catch (err: unknown) {
      if (err instanceof ApiError && err.isForbidden) {
        router.push("/dashboard");
        return;
      }
      addToast(err instanceof Error ? err.message : "Failed to update plan", "error");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleDelete(user: AdminUser) {
    setConfirmDelete(null);
    setLoadingDelete(user.id);
    try {
      await deleteAdminUser(user.id);
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      addToast(`Deleted ${user.email}`, "success");
    } catch (err: unknown) {
      if (err instanceof ApiError && err.isForbidden) {
        router.push("/dashboard");
        return;
      }
      addToast(err instanceof Error ? err.message : "Failed to delete user", "error");
    } finally {
      setLoadingDelete(null);
    }
  }

  return (
    <>
      <div className="bg-surface-container-lowest rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 bg-surface-container/50">
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest">Email</th>
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest hidden lg:table-cell">WhatsApp</th>
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest hidden md:table-cell">Registered</th>
                <th className="text-right px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest hidden md:table-cell">Alerts</th>
                <th className="text-left px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest hidden xl:table-cell">Last Alert</th>
                <th className="text-right px-4 py-3 text-xs font-bold font-display text-on-surface-variant uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-on-surface">{user.email}</span>
                      {user.is_admin && (
                        <span className="text-[10px] font-bold font-display bg-tertiary text-on-tertiary px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                          Admin
                        </span>
                      )}
                    </div>
                    {user.display_name && (
                      <span className="text-xs text-on-surface-variant">{user.display_name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold font-display px-2 py-1 rounded-full capitalize ${PLAN_BADGE[user.plan]}`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${user.is_active ? "bg-secondary" : "bg-outline-variant"}`} />
                      <span className="text-xs text-on-surface-variant font-display">
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-xs text-on-surface-variant font-display">
                      {user.whatsapp_number ?? "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-on-surface-variant font-display">
                      {formatDate(user.created_at)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right hidden md:table-cell">
                    <span className="text-sm font-bold font-display text-on-surface">
                      {user.alerts_count.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className="text-xs text-on-surface-variant font-display">
                      {user.last_alert_at ? formatDate(user.last_alert_at) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {/* Plan select */}
                      <select
                        value={planSelectValue(user)}
                        disabled={loadingPlan === user.id}
                        onChange={(e) => handlePlanChange(user, e.target.value)}
                        className="text-xs font-semibold font-display bg-surface-container border border-outline-variant/50 rounded-lg px-2 py-1.5 text-on-surface disabled:opacity-50 cursor-pointer hover:bg-surface-container-high transition-colors"
                      >
                        <option value="free">Free</option>
                        {HORIZON_OPTIONS.map((option) => (
                          <option key={option.horizon} value={`paid:${option.horizon}`}>
                            {HORIZON_LABEL[option.horizon]}
                          </option>
                        ))}
                        {/* Legacy plans can be kept but not newly assigned */}
                        {user.plan === "paid" && !user.plan_horizon && (
                          <option value="paid">Paid</option>
                        )}
                        {user.plan === "pro" && <option value="pro">Pro (legacy)</option>}
                        {user.plan === "premium" && (
                          <option value="premium">Premium (legacy)</option>
                        )}
                      </select>

                      {/* Delete button */}
                      <button
                        onClick={() => setConfirmDelete(user)}
                        disabled={loadingDelete === user.id || user.is_admin}
                        title={user.is_admin ? "Cannot delete admin user" : "Delete user"}
                        className="p-1.5 rounded-lg text-error hover:bg-error-container/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {loadingDelete === user.id ? (
                          <span className="material-symbols-outlined text-[18px] animate-spin">autorenew</span>
                        ) : (
                          <span className="material-symbols-outlined text-[18px]"
                            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400" }}>
                            delete
                          </span>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${confirmDelete?.email}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
