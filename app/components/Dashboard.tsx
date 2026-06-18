"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Finding, HEURISTICS, SEVERITY_LABELS, SEVERITY_COLORS } from "@/app/types/finding";
import { getFindings, exportJSON, exportFigJam } from "@/app/utils/storage";
import SeverityBadge from "./SeverityBadge";
import SourceBadge from "./SourceBadge";

type SortKey = "severity" | "heuristic" | "source" | "iteration" | "createdAt";
type SortDir = "asc" | "desc";

export default function Dashboard() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [filterHeuristic, setFilterHeuristic] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterIteration, setFilterIteration] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("severity");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    setFindings(getFindings());
    const handleStorage = () => setFindings(getFindings());
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const sources = useMemo(
    () => [...new Set(findings.map((f) => f.source))],
    [findings]
  );
  const iterations = useMemo(
    () => [...new Set(findings.map((f) => f.iteration))],
    [findings]
  );

  const filtered = useMemo(() => {
    return findings
      .filter((f) => !filterHeuristic || f.heuristic === filterHeuristic)
      .filter(
        (f) => !filterSeverity || f.severity === parseInt(filterSeverity)
      )
      .filter((f) => !filterSource || f.source === filterSource)
      .filter((f) => !filterIteration || f.iteration === filterIteration);
  }, [findings, filterHeuristic, filterSeverity, filterSource, filterIteration]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av: string | number = a[sortKey] as string | number;
      let bv: string | number = b[sortKey] as string | number;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  // Stats
  const total = findings.length;
  const bySeverity = [0, 1, 2, 3].map((s) => ({
    severity: s as 0 | 1 | 2 | 3,
    count: findings.filter((f) => f.severity === s).length,
  }));
  const byHeuristic = HEURISTICS.map((h) => ({
    label: h.id,
    count: findings.filter((f) => f.heuristic === h.label).length,
  })).filter((h) => h.count > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Heuristic Evaluation
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {total} finding{total !== 1 ? "s" : ""} logged
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportFigJam(findings)}
              disabled={total === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              FigJam
            </button>
            <button
              onClick={() => exportJSON(findings)}
              disabled={total === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export JSON
            </button>
            <Link
              href="/new"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Finding
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        {total > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {bySeverity.map(({ severity, count }) => {
              const colors = SEVERITY_COLORS[severity];
              return (
                <div
                  key={severity}
                  className={`rounded-lg border ${colors.border} ${colors.bg} px-4 py-3`}
                >
                  <p className={`text-2xl font-bold ${colors.text}`}>{count}</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">
                    {SEVERITY_LABELS[severity]}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Heuristic breakdown bar */}
        {total > 0 && byHeuristic.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Findings by Heuristic
            </p>
            <div className="space-y-2">
              {HEURISTICS.map((h) => {
                const count = findings.filter(
                  (f) => f.heuristic === h.label
                ).length;
                if (count === 0) return null;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={h.id} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-8 shrink-0">
                      {h.id}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-6 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Filters
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select
            value={filterHeuristic}
            onChange={(e) => setFilterHeuristic(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All heuristics</option>
            {HEURISTICS.map((h) => (
              <option key={h.id} value={h.label}>
                {h.id}
              </option>
            ))}
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All severities</option>
            {[0, 1, 2, 3].map((s) => (
              <option key={s} value={s}>
                {s} – {SEVERITY_LABELS[s]}
              </option>
            ))}
          </select>
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All sources</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={filterIteration}
            onChange={(e) => setFilterIteration(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All iterations</option>
            {iterations.map((it) => (
              <option key={it} value={it}>
                {it}
              </option>
            ))}
          </select>
        </div>
        {(filterHeuristic ||
          filterSeverity ||
          filterSource ||
          filterIteration) && (
          <button
            onClick={() => {
              setFilterHeuristic("");
              setFilterSeverity("");
              setFilterSource("");
              setFilterIteration("");
            }}
            className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Table */}
      {total === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
          <svg
            className="w-12 h-12 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-gray-500 font-medium">No findings yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add your first finding to get started.
          </p>
          <Link
            href="/new"
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add First Finding
          </Link>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No findings match your filters.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {(
                    [
                      ["severity", "Severity"],
                      ["heuristic", "Heuristic"],
                      ["screen", "Screen/Flow"],
                      ["source", "Source"],
                      ["iteration", "Iteration"],
                      ["createdAt", "Date"],
                    ] as [SortKey | "screen", string][]
                  ).map(([key, label]) => (
                    <th
                      key={key}
                      onClick={() =>
                        key !== "screen" && toggleSort(key as SortKey)
                      }
                      className={`text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap ${
                        key !== "screen"
                          ? "cursor-pointer hover:text-gray-900 select-none"
                          : ""
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {sortKey === key && (
                          <span>{sortDir === "asc" ? "↑" : "↓"}</span>
                        )}
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sorted.map((f) => (
                  <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <SeverityBadge severity={f.severity} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600 max-w-[160px]">
                      <span className="font-medium">
                        {f.heuristic.split("–")[0].trim()}
                      </span>
                      <br />
                      <span className="text-gray-400">
                        {f.heuristic.split("–")[1]?.trim()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">
                      {f.screen}
                    </td>
                    <td className="px-4 py-3">
                      <SourceBadge source={f.source} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-[120px] truncate">
                      {f.iteration}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(f.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/findings/${f.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            Showing {sorted.length} of {total} findings
          </div>
        </div>
      )}
    </div>
  );
}
