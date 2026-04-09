interface ScoreBadgeProps {
  score: number;
}

// Score scale is 0-35
export function ScoreBadge({ score }: ScoreBadgeProps) {
  const valid = score != null && !isNaN(score) && score > 0;

  const className = !valid
    ? "bg-surface-container text-on-surface-variant"
    : score >= 25
    ? "bg-secondary-container text-on-secondary-container"
    : score >= 15
    ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
    : "bg-error-container text-on-error-container";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${className}`}
    >
      {valid ? `${score}` : "—"}
    </span>
  );
}
