interface ScoreBadgeProps {
  /** Affinity percentage from the API (`score_percentage` / `match_score_percentage`). */
  percentage: number | null | undefined;
}

/**
 * Shows the API-computed affinity percentage. The raw matching score is never
 * displayed, and the percentage is never derived here: the API owns the formula.
 */
export function ScoreBadge({ percentage }: ScoreBadgeProps) {
  const valid =
    percentage != null && !isNaN(percentage) && percentage > 0;

  const className = !valid
    ? "bg-surface-container text-on-surface-variant"
    : percentage >= 75
    ? "bg-secondary-container text-on-secondary-container"
    : percentage >= 50
    ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
    : "bg-error-container text-on-error-container";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${className}`}
    >
      {valid ? `${Math.round(percentage)}%` : "—"}
    </span>
  );
}
