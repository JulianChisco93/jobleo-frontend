"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getCompanyWatches,
  createCompanyWatch,
  updateCompanyWatch,
  deleteCompanyWatch,
  checkCompanyWatch,
  testCompanyWatchUrl,
} from "@/lib/api";
import type { CompanyWatch, CompanyWatchTestResult, Plan } from "@/lib/types";
import { TagInput } from "@/components/ui/TagInput";
import { Toggle } from "@/components/ui/Toggle";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatLastSearched } from "@/lib/utils";

const WATCH_LIMITS: Record<Plan, number> = { free: 1, pro: 3, premium: 5 };

const ATS_CONFIG: Record<
  string,
  { label: string; icon: string; bg: string; text: string }
> = {
  greenhouse: {
    label: "Greenhouse",
    icon: "eco",
    bg: "bg-secondary-container",
    text: "text-on-secondary-container",
  },
  lever: {
    label: "Lever",
    icon: "tune",
    bg: "bg-primary-container",
    text: "text-on-primary-container",
  },
  oracle_hcm: {
    label: "Oracle HCM",
    icon: "corporate_fare",
    bg: "bg-tertiary-container",
    text: "text-on-tertiary-container",
  },
  breezy: {
    label: "Breezy",
    icon: "air",
    bg: "bg-secondary-container",
    text: "text-on-secondary-container",
  },
  generic: {
    label: "Web",
    icon: "language",
    bg: "bg-surface-container",
    text: "text-on-surface-variant",
  },
};

const DEFAULT_ATS = {
  label: "—",
  icon: "apartment",
  bg: "bg-surface-container",
  text: "text-on-surface-variant",
};

function getAts(type: string | null) {
  return (type && ATS_CONFIG[type]) || DEFAULT_ATS;
}

interface FormState {
  companyName: string;
  url: string;
  keywords: string[];
}

const EMPTY_FORM: FormState = { companyName: "", url: "", keywords: [] };

function parseApiError(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.detail && typeof parsed.detail === "string") return parsed.detail;
    if (parsed?.message && typeof parsed.message === "string") return parsed.message;
    if (parsed?.error && typeof parsed.error === "string") return parsed.error;
    // JSON but no useful field — return null to trigger generic warning
    return "";
  } catch {
    return raw;
  }
}

interface Props {
  plan: Plan;
  className?: string;
}

export function CompanyWatchSection({ plan, className = "" }: Props) {
  const t = useTranslations("companyWatch");
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const limit = WATCH_LIMITS[plan];

  const { data: watches = [], isLoading } = useQuery({
    queryKey: ["company-watches"],
    queryFn: getCompanyWatches,
  });

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingWatch, setDeletingWatch] = useState<CompanyWatch | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [testResult, setTestResult] = useState<CompanyWatchTestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifyingIds, setVerifyingIds] = useState<Set<number>>(new Set());

  const atMax = watches.length >= limit;

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setTestResult(null);
    setFormOpen(true);
  }

  function openEdit(w: CompanyWatch) {
    setFormOpen(false);
    setTestResult(null);
    setForm({
      companyName: w.company_name,
      url: w.url,
      keywords: w.job_title_keywords ?? [],
    });
    setEditingId(w.id);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setTestResult(null);
  }

  async function handleTest() {
    if (!form.url.trim()) return;
    setTestResult(null);
    setTestLoading(true);
    try {
      const result = await testCompanyWatchUrl(form.url.trim());
      // If the API returned an error field that looks like JSON, clean it up
      if (result.error) {
        result.error = parseApiError(result.error);
      }
      setTestResult(result);
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Unknown error";
      setTestResult({
        ats_type: null,
        jobs_found: 0,
        jobs: [],
        error: parseApiError(raw),
      });
    } finally {
      setTestLoading(false);
    }
  }

  async function handleSave() {
    if (!form.companyName.trim() || !form.url.trim()) return;
    setSaving(true);
    try {
      if (editingId !== null) {
        await updateCompanyWatch(editingId, {
          company_name: form.companyName.trim(),
          job_title_keywords: form.keywords,
        });
      } else {
        await createCompanyWatch({
          company_name: form.companyName.trim(),
          url: form.url.trim(),
          job_title_keywords: form.keywords.length > 0 ? form.keywords : undefined,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["company-watches"] });
      closeForm();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("403")) {
        addToast(t("upgradeNotice"), "error");
      } else {
        addToast(msg || t("saveError"), "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(w: CompanyWatch) {
    try {
      await updateCompanyWatch(w.id, { is_active: !w.is_active });
      await queryClient.invalidateQueries({ queryKey: ["company-watches"] });
    } catch {
      addToast(t("saveError"), "error");
    }
  }

  async function handleVerify(w: CompanyWatch) {
    setVerifyingIds((prev) => new Set(prev).add(w.id));
    try {
      const { message } = await checkCompanyWatch(w.id);
      addToast(message || t("verifyStarted", { company: w.company_name }), "success");
    } catch (err) {
      addToast(err instanceof Error ? err.message : t("saveError"), "error");
    } finally {
      setVerifyingIds((prev) => {
        const next = new Set(prev);
        next.delete(w.id);
        return next;
      });
    }
  }

  async function handleDelete() {
    if (!deletingWatch) return;
    try {
      await deleteCompanyWatch(deletingWatch.id);
      await queryClient.invalidateQueries({ queryKey: ["company-watches"] });
    } catch (err) {
      addToast(err instanceof Error ? err.message : t("saveError"), "error");
    } finally {
      setDeletingWatch(null);
    }
  }

  return (
    <section className={`mt-12 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-xl text-on-surface flex items-center gap-2">
            {t("title")}
            {!isLoading && (
              <span className="text-xs bg-primary-fixed text-on-primary-fixed px-2 py-0.5 rounded-full font-bold">
                {watches.length}/{limit}
              </span>
            )}
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">{t("subtitle")}</p>
        </div>
        <div className="relative group">
          <button
            onClick={atMax ? undefined : openAdd}
            disabled={atMax || formOpen}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
              atMax || formOpen
                ? "bg-surface-container-highest text-on-surface-variant cursor-not-allowed opacity-60"
                : "bg-primary text-on-primary hover:bg-primary-container active:scale-95"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            {t("addButton")}
          </button>
          {atMax && (
            <div className="absolute top-full right-0 mt-2 px-3 py-2 text-xs text-inverse-on-surface bg-inverse-surface rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
              {t("addButtonTooltip", { limit })}
            </div>
          )}
        </div>
      </div>

      {/* Inline add form */}
      {formOpen && (
        <WatchForm
          form={form}
          setForm={setForm}
          testResult={testResult}
          testLoading={testLoading}
          saving={saving}
          isEdit={false}
          onTest={handleTest}
          onSave={handleSave}
          onCancel={closeForm}
          t={t}
        />
      )}

      {/* Empty state */}
      {!isLoading && watches.length === 0 && !formOpen && (
        <div className="bg-surface-container-lowest rounded-xl p-14 flex flex-col items-center shadow-[var(--shadow-card)]">
          <div className="w-14 h-14 bg-surface-container-low rounded-full flex items-center justify-center mb-5">
            <span className="material-symbols-outlined text-2xl text-outline">
              domain
            </span>
          </div>
          <p className="font-display font-bold text-base text-on-surface mb-1.5">
            {t("noWatches")}
          </p>
          <p className="text-on-surface-variant text-sm text-center max-w-xs">
            {t("noWatchesHint")}
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-[var(--shadow-card)] animate-pulse h-44"
            />
          ))}
        </div>
      )}

      {/* Watch grid */}
      {watches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {watches.map((w) =>
            editingId === w.id ? (
              <div key={w.id} className="md:col-span-2 xl:col-span-3">
                <WatchForm
                  form={form}
                  setForm={setForm}
                  testResult={testResult}
                  testLoading={testLoading}
                  saving={saving}
                  isEdit
                  onTest={handleTest}
                  onSave={handleSave}
                  onCancel={closeForm}
                  t={t}
                />
              </div>
            ) : (
              <WatchCard
                key={w.id}
                watch={w}
                verifying={verifyingIds.has(w.id)}
                onToggle={() => handleToggle(w)}
                onVerify={() => handleVerify(w)}
                onEdit={() => openEdit(w)}
                onDelete={() => setDeletingWatch(w)}
                t={t}
              />
            )
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deletingWatch}
        title={t("title")}
        message={deletingWatch ? t("deleteConfirm", { company: deletingWatch.company_name }) : ""}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeletingWatch(null)}
      />
    </section>
  );
}

// ─── Watch Card ───────────────────────────────────────────────────────────────

interface WatchCardProps {
  watch: CompanyWatch;
  verifying: boolean;
  onToggle: () => void;
  onVerify: () => void;
  onEdit: () => void;
  onDelete: () => void;
  t: ReturnType<typeof useTranslations<"companyWatch">>;
}

function WatchCard({ watch: w, verifying, onToggle, onVerify, onEdit, onDelete, t }: WatchCardProps) {
  const ats = getAts(w.ats_type);
  const lastChecked = w.last_checked_at ? formatLastSearched(w.last_checked_at) : null;

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-ambient)] transition-all flex flex-col gap-4">
      {/* Top row: icon + name + toggle */}
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ats.bg} ${ats.text}`}
        >
          <span
            className="material-symbols-outlined text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {ats.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-on-surface truncate leading-tight">
            {w.company_name}
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="material-symbols-outlined text-[13px] text-on-surface-variant">
              language
            </span>
            <a
              href={w.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-on-surface-variant truncate hover:text-primary transition-colors max-w-[180px] block"
            >
              {w.url.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          </div>
        </div>
        <Toggle checked={w.is_active} onChange={onToggle} />
      </div>

      {/* Meta row: ATS badge + last checked */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${ats.bg} ${ats.text}`}
        >
          {ats.label}
        </span>
        <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">schedule</span>
          {lastChecked
            ? `${t("lastChecked")} ${lastChecked}`
            : t("never")}
        </span>
        {!w.is_active && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
            {t("paused")}
          </span>
        )}
      </div>

      {/* Baseline notice */}
      {w.last_checked_at === null && (
        <p className="text-[10px] text-on-surface-variant flex items-center gap-1 -mt-1">
          <span className="material-symbols-outlined text-[12px]">info</span>
          {t("baselineNotice")}
        </p>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/20">
        <button
          onClick={onVerify}
          disabled={verifying}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-secondary border border-secondary-container rounded-lg hover:bg-secondary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {verifying ? (
            <span className="w-3.5 h-3.5 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="material-symbols-outlined text-[14px]">refresh</span>
          )}
          {t("verifyNow")}
        </button>
        <div className="flex-1" />
        <button
          onClick={onEdit}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors text-on-surface-variant hover:text-on-surface"
          aria-label="Edit"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button
          onClick={onDelete}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error-container transition-colors text-on-surface-variant hover:text-error"
          aria-label="Delete"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}

// ─── Watch Form ───────────────────────────────────────────────────────────────

interface WatchFormProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  testResult: CompanyWatchTestResult | null;
  testLoading: boolean;
  saving: boolean;
  isEdit: boolean;
  onTest: () => void;
  onSave: () => void;
  onCancel: () => void;
  t: ReturnType<typeof useTranslations<"companyWatch">>;
}

function WatchForm({
  form,
  setForm,
  testResult,
  testLoading,
  saving,
  isEdit,
  onTest,
  onSave,
  onCancel,
  t,
}: WatchFormProps) {
  const canSave = form.companyName.trim().length > 0 && form.url.trim().length > 0;

  const testOk = testResult && !testResult.error && testResult.jobs_found > 0;
  const testWarn = testResult && (testResult.error !== null || testResult.jobs_found === 0);
  const detectedAts = testResult?.ats_type ? getAts(testResult.ats_type) : null;

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-surface-container-low text-sm text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-primary transition-all";
  const labelClass =
    "text-xs font-bold tracking-wider text-on-surface-variant uppercase";

  return (
    <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[var(--shadow-ambient)] mb-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Company name */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>{t("companyNameLabel")}</label>
          <input
            type="text"
            value={form.companyName}
            onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
            placeholder={t("companyNamePlaceholder")}
            className={inputClass}
            disabled={isEdit}
          />
        </div>

        {/* URL + test button */}
        <div className="flex flex-col gap-2">
          <label className={labelClass}>{t("urlLabel")}</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={form.url}
              onChange={(e) => {
                setForm((f) => ({ ...f, url: e.target.value }));
              }}
              placeholder={t("urlPlaceholder")}
              className={`${inputClass} flex-1`}
              disabled={isEdit}
            />
            {!isEdit && (
              <button
                type="button"
                onClick={onTest}
                disabled={testLoading || !form.url.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold border border-outline-variant text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {testLoading ? (
                  <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span className="material-symbols-outlined text-[16px]">wifi_tethering</span>
                )}
                {t("testButton")}
              </button>
            )}
          </div>
          {testLoading && (
            <p className="text-xs text-on-surface-variant italic">{t("testing")}</p>
          )}
        </div>
      </div>

      {/* Test result area */}
      {testOk && (
        <div className="mt-4 bg-secondary-container/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-[16px] text-secondary">check_circle</span>
            <span className="text-sm font-bold text-on-surface">
              {t("testSuccess", { count: testResult!.jobs_found })}
            </span>
            {detectedAts && (
              <span
                className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${detectedAts.bg} ${detectedAts.text}`}
              >
                {detectedAts.label}
              </span>
            )}
          </div>
          <ul className="space-y-1">
            {testResult!.jobs.slice(0, 5).map((job, i) => (
              <li key={i} className="text-xs text-on-surface-variant flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-secondary flex-shrink-0" />
                <span className="truncate">{job.title}</span>
                {job.location && (
                  <span className="text-outline flex-shrink-0">· {job.location}</span>
                )}
              </li>
            ))}
            {testResult!.jobs_found > 5 && (
              <li className="text-xs text-on-surface-variant pl-3">
                +{testResult!.jobs_found - 5} more
              </li>
            )}
          </ul>
        </div>
      )}
      {testWarn && (
        <div className="mt-4 bg-tertiary-container/30 rounded-xl p-4 flex items-start gap-3">
          <span className="material-symbols-outlined text-[18px] text-tertiary flex-shrink-0 mt-0.5">
            warning
          </span>
          <p className="text-sm text-on-surface">
            {testResult!.error
              ? t("testError", { message: testResult!.error })
              : t("testWarning")}
          </p>
        </div>
      )}

      {/* Keywords */}
      <div className="mt-5">
        <TagInput
          label={t("keywordsLabel")}
          value={form.keywords}
          onChange={(tags) => setForm((f) => ({ ...f, keywords: tags }))}
          placeholder={t("keywordsPlaceholder")}
          helperText={t("keywordsHelper")}
        />
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          {t("cancelButton")}
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !canSave}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold bg-primary-gradient text-on-primary shadow-[var(--shadow-card)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
              {t("saving")}
            </>
          ) : (
            t("saveButton")
          )}
        </button>
      </div>
    </div>
  );
}
