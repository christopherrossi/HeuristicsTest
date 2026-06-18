"use client";

interface Props {
  source: string;
}

export default function SourceBadge({ source }: Props) {
  const isClaude = source.toLowerCase() === "claude";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
        isClaude
          ? "bg-blue-100 text-blue-800 border border-blue-200"
          : "bg-green-100 text-green-800 border border-green-200"
      }`}
    >
      {source}
    </span>
  );
}
