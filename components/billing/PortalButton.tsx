"use client";

import { useState } from "react";
import { createPortalSession } from "@/lib/api";

interface Props {
  label: string;
  className?: string;
}

function Spinner() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export function PortalButton({ label, className }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch {
      // swallow — user stays on page
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <Spinner />
        </span>
      ) : (
        label
      )}
    </button>
  );
}
