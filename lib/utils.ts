/**
 * Formats a date string into a human-readable "time ago" string.
 * Returns "—" for empty/falsy input.
 */
export function formatLastSearched(dateStr: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff <= 0) return "—";
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

/** E.164 international phone number format: +[country code][number] */
export const E164_REGEX = /^\+[1-9]\d{1,14}$/;
