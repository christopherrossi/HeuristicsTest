"use client";

import Link from "next/link";
import { Finding, SEVERITY_COLORS } from "@/app/types/finding";
import SeverityBadge from "./SeverityBadge";
import SourceBadge from "./SourceBadge";

interface Props {
  finding: Finding;
}

export default function FindingCard({ finding }: Props) {
  const severityColors = SEVERITY_COLORS[finding.severity];
  return (
    <div
      className={`rounded-lg border ${severityColors.border} ${severityColors.bg} p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap gap-2 items-center">
          <SeverityBadge severity={finding.severity} />
          <SourceBadge source={finding.source} />
        </div>
        <span className="text-xs text-gray-500 shrink-0">
          {new Date(finding.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        {finding.heuristic}
      </p>
      <p className="text-sm font-medium text-gray-900 mb-1">{finding.screen}</p>
      <p className="text-sm text-gray-600 line-clamp-2 mb-3">{finding.observation}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">{finding.version}</span>
        <Link
          href={`/findings/${finding.id}`}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          View details →
        </Link>
      </div>
    </div>
  );
}
