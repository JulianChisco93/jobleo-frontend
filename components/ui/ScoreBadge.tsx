interface ScoreBadgeProps {
  score: number;
}

export function ScoreBadge({ score }: ScoreBadgeProps) {
  let bg = "#4CAF50";
  let color = "#ffffff";
  if (score < 40) {
    bg = "#E53935";
    color = "#ffffff";
  } else if (score < 60) {
    bg = "#FFC107";
    color = "#000000";
  }

  return (
    <span
      className="inline-flex items-center px-2.5 py-1 text-xs font-bold font-mono"
      style={{ backgroundColor: bg, color }}
    >
      {score}%
    </span>
  );
}
