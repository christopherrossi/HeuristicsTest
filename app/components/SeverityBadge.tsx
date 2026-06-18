"use client";

import { SEVERITY_COLORS, SEVERITY_LABELS } from "@/app/types/finding";

interface Props {
  severity: 0 | 1 | 2 | 3;
  showLabel?: boolean;
}

export default function SeverityBadge({ severity, showLabel = true }: Props) {
  const colors = SEVERITY_COLORS[severity];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${colors.badge}`}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${
          severity === 0
            ? "bg-gray-400"
            : severity === 1
            ? "bg-yellow-500"
            : severity === 2
            ? "bg-orange-500"
            : "bg-red-600"
        }`}
      />
      {showLabel && SEVERITY_LABELS[severity]}
    </span>
  );
}
