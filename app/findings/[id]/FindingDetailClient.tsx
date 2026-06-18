"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Finding, HEURISTICS, SEVERITY_COLORS, SEVERITY_LABELS } from "@/app/types/finding";
import { getFindingById, deleteFinding } from "@/app/utils/storage";
import SeverityBadge from "@/app/components/SeverityBadge";
import SourceBadge from "@/app/components/SourceBadge";
import FindingForm from "@/app/components/FindingForm";

interface Props {
  id: string;
}

export default function FindingDetailClient({ id }: Props) {
  const router = useRouter();
  const [finding, setFinding] = useState<Finding | null>(null);
  const [editing, setEditing] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function load() {
    const f = getFindingById(id);
    if (f) {
      setFinding(f);
    } else {
      setNotFound(true);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  function handleDelete() {
    if (!finding) return;
    deleteFinding(finding.id);
    router.push("/");
  }

  function handleSaved() {
    setEditing(false);
    load();
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-500 font-medium">Finding not found.</p>
        <Link href="/" className="mt-4 inline-block text-indigo-600 hover:underline text-sm">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!finding) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  const heuristicInfo = HEURISTICS.find((h) => h.label === finding.heuristic);
  const severityColors = SEVERITY_COLORS[finding.severity];

  if (editing) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center gap-2">
          <button
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Cancel editing
          </button>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Edit Finding</h1>
          <FindingForm initialFinding={finding} onSave={handleSaved} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-700">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-900">Finding</span>
      </div>

      {/* Header */}
      <div className={`rounded-xl border ${severityColors.border} ${severityColors.bg} p-6 mb-4`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <SeverityBadge severity={finding.severity} />
          <SourceBadge source={finding.source} />
          <span className="text-xs text-gray-500 ml-auto">
            {new Date(finding.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          {finding.heuristic}
        </p>
        {heuristicInfo && (
          <p className="text-xs text-gray-500 mb-3 italic">
            {heuristicInfo.description}
          </p>
        )}
        <p className="text-lg font-semibold text-gray-900">{finding.screen}</p>
        <p className="text-sm text-gray-500 mt-1">{finding.iteration}</p>
      </div>

      {/* Screenshot */}
      {finding.screenshot && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Screenshot
          </p>
          <a href={finding.screenshot} target="_blank" rel="noopener noreferrer">
            <img
              src={finding.screenshot}
              alt="Finding screenshot"
              className="w-full rounded border border-gray-200 cursor-zoom-in"
            />
          </a>
          <p className="text-xs text-gray-400 mt-1 text-center">Click to open full size</p>
        </div>
      )}

      {/* Observation & Recommendation */}
      <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 mb-4">
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Observation
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {finding.observation}
          </p>
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Recommendation
          </p>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {finding.recommendation}
          </p>
        </div>
      </div>

      {/* Meta */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Source</p>
          <p className="font-medium text-gray-700">{finding.source}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Iteration</p>
          <p className="font-medium text-gray-700">{finding.iteration}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Severity</p>
          <p className="font-medium text-gray-700">
            {finding.severity} – {SEVERITY_LABELS[finding.severity]}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Finding ID</p>
          <p className="font-mono text-xs text-gray-500 truncate">{finding.id}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          Edit
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Are you sure?</span>
            <button
              onClick={handleDelete}
              className="px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Yes, delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
