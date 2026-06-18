"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Finding, HEURISTICS, SEVERITY_LABELS, SEVERITY_COLORS } from "@/app/types/finding";
import { getFindings, exportJSON, exportFigJam } from "@/app/utils/storage";
import SeverityBadge from "./SeverityBadge";
import SourceBadge from "./SourceBadge";

export default function Dashboard() {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [filterHeuristic, setFilterHeuristic] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterSource, setFilterSource] = useState("");
  const [filterPrototype, setFilterPrototype] = useState("");
  const [filterVersion, setFilterVersion] = useState("");

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
  const prototypes = useMemo(
    () => [...new Set(findings.map((f) => f.prototype).filter(Boolean))],
    [findings]
  );
  const versions = useMemo(
    () => [...new Set(findings.filter((f) => !filterPrototype || f.prototype === filterPrototype).map((f) => f.version))],
    [findings, filterPrototype]
  );

  const filtered = useMemo(() => {
    return findings
      .filter((f) => !filterHeuristic || f.heuristic === filterHeuristic)
      .filter((f) => !filterSeverity || f.severity === parseInt(filterSeverity))
      .filter((f) => !filterSource || f.source === filterSource)
      .filter((f) => !filterPrototype || f.prototype === filterPrototype)
      .filter((f) => !filterVersion || f.version === filterVersion);
  }, [findings, filterHeuristic, filterSeverity, filterSource, filterPrototype, filterVersion]);

  // Stats
  const total = findings.length;
  const bySeverity = [0, 1, 2, 3].map((s) => ({
    severity: s as 0 | 1 | 2 | 3,
    count: findings.filter((f) => f.severity === s).length,
  }));

  // Build grouped structure: prototype → version → findings
  const grouped = useMemo(() => {
    const protoMap = new Map<string, Map<string, Finding[]>>();
    for (const f of filtered) {
      const proto = f.prototype || "No Prototype";
      const iter = f.version || "No Version";
      if (!protoMap.has(proto)) protoMap.set(proto, new Map());
      const iterMap = protoMap.get(proto)!;
      if (!iterMap.has(iter)) iterMap.set(iter, []);
      iterMap.get(iter)!.push(f);
    }
    // Sort findings within each group by severity desc
    for (const iterMap of protoMap.values()) {
      for (const arr of iterMap.values()) {
        arr.sort((a, b) => b.severity - a.severity);
      }
    }
    return protoMap;
  }, [filtered]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Heuristic Evaluation</h1>
          <p className="text-sm text-gray-500 mt-1">{total} finding{total !== 1 ? "s" : ""} across {prototypes.length} prototype{prototypes.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportFigJam(findings)} disabled={total === 0} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" /></svg>
            FigJam
          </button>
          <button onClick={() => exportJSON(findings)} disabled={total === 0} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export JSON
          </button>

        </div>
      </div>


      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Filters</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <select value={filterHeuristic} onChange={(e) => setFilterHeuristic(e.target.value)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All heuristics</option>
            {HEURISTICS.map((h) => <option key={h.id} value={h.label}>{h.id}</option>)}
          </select>
          <select value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All severities</option>
            {[0, 1, 2, 3].map((s) => <option key={s} value={s}>{s} – {SEVERITY_LABELS[s]}</option>)}
          </select>
          <select value={filterPrototype} onChange={(e) => { setFilterPrototype(e.target.value); setFilterVersion(""); }} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All prototypes</option>
            {prototypes.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterVersion} onChange={(e) => setFilterVersion(e.target.value)} className="rounded-md border border-gray-300 px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All versions</option>
            {versions.map((it) => <option key={it} value={it}>{it}</option>)}
          </select>
        </div>
        {(filterHeuristic || filterSeverity || filterSource || filterPrototype || filterVersion) && (
          <button onClick={() => { setFilterHeuristic(""); setFilterSeverity(""); setFilterSource(""); setFilterPrototype(""); setFilterVersion(""); }} className="mt-2 text-xs text-indigo-600 hover:text-indigo-800">
            Clear all filters
          </button>
        )}
      </div>

      {/* Grouped findings */}
      {total === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-gray-300 rounded-lg">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 font-medium">No findings yet</p>
          <p className="text-sm text-gray-400 mt-1">Use the Add Finding button above to get started.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No findings match your filters.</div>
      ) : (
        <div className="space-y-8">
          {[...grouped.entries()].map(([proto, iterMap]) => (
            <div key={proto}>
              {/* Prototype header */}
              <div className="mb-3">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-lg font-bold text-gray-900">{proto}</h2>
                  <span className="text-xs text-gray-400 font-medium">{[...iterMap.values()].flat().length} finding{[...iterMap.values()].flat().length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {([0, 1, 2, 3] as const).map((sev) => {
                    const count = [...iterMap.values()].flat().filter((f) => f.severity === sev).length;
                    const colors = SEVERITY_COLORS[sev];
                    return (
                      <div key={sev} className={`rounded-lg border ${colors.border} ${colors.bg} px-3 py-2`}>
                        <p className={`text-xl font-bold ${colors.text}`}>{count}</p>
                        <p className="text-xs font-medium text-gray-500">{SEVERITY_LABELS[sev]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Versions within this prototype */}
              <div className="space-y-4">
                {[...iterMap.entries()].map(([iter, iterFindings]) => (
                  <div key={iter} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Version subheader */}
                    <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">{iter}</span>
                      <span className="text-xs text-gray-400">{iterFindings.length} finding{iterFindings.length !== 1 ? "s" : ""}</span>
                    </div>
                    {/* Findings table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100">
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Severity</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Heuristic</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Screen / Flow</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Source</th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">Observation</th>
                            <th className="px-4 py-2" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {iterFindings.map((f) => (
                            <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap"><SeverityBadge severity={f.severity} /></td>
                              <td className="px-4 py-3 text-xs text-gray-600 max-u-[140px]">
                                <span className="font-medium">{f.heuristic.split("–")[0].trim()}</span>
                                <br />
                                <span className="text-gray-400">{f.heuristic.split("–")[1]?.trim()}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700 max-w-[160px] truncate">{f.screen}</td>
                              <td className="px-4 py-3"><SourceBadge source={f.source} /></td>
                              <td className="px-4 py-3 text-sm text-gray-500 max-w-[280px] truncate">{f.observation}</td>
                              <td className="px-4 py-3">
                                <Link href={`/findings/${f.id}`} className="text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap">View →</Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
