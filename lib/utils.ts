/**
 * Timestamp for an API datetime. The API sends UTC, but some fields omit the
 * timezone marker, and those would otherwise be read as local time.
 */
export function parseApiDate(dateStr: string): number {
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(dateStr);
  return new Date(hasZone ? dateStr : `${dateStr.replace(" ", "T")}Z`).getTime();
}

/**
 * Formats a date string into a human-readable "time ago" string.
 * Returns "—" for empty/falsy input or a future date.
 */
export function formatLastSearched(dateStr: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - parseApiDate(dateStr);
  if (diff < 0 || Number.isNaN(diff)) return "—";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/**
 * Formats the time remaining until a future date.
 * Returns "—" for empty/past input, "now" if under a minute.
 */
export function formatTimeUntil(dateStr: string): string {
  if (!dateStr) return "—";
  const diff = parseApiDate(dateStr) - Date.now();
  if (diff <= 0 || Number.isNaN(diff)) return "—";
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

/** E.164 international phone number format: +[country code][number] */
export const E164_REGEX = /^\+[1-9]\d{1,14}$/;
