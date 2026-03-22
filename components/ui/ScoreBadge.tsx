interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  const className =
    score >= 60
      ? "bg-secondary-container text-on-secondary-container"
      : score >= 40
      ? "bg-tertiary-fixed text-on-tertiary-fixed-variant"
      : "bg-error-container text-on-error-container";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${className}`}
    >
      {score}%
    </span>
  );
}
