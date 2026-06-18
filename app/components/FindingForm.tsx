"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { Finding, HEURISTICS, SEVERITY_LABELS } from "@/app/types/finding";
import { saveFinding, getFindings } from "@/app/utils/storage";

interface Props {
  initialFinding?: Finding;
  onSave?: () => void;
}

const SEVERITY_BUTTON_STYLES: Record<
  number,
  { active: string; inactive: string; dot: string }
> = {
  0: {
    active: "bg-gray-200 border-gray-500 text-gray-800 ring-2 ring-gray-500",
    inactive: "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100",
    dot: "bg-gray-400",
  },
  1: {
    active:
      "bg-yellow-100 border-yellow-500 text-yellow-900 ring-2 ring-yellow-500",
    inactive:
      "bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100",
    dot: "bg-yellow-500",
  },
  2: {
    active:
      "bg-orange-100 border-orange-500 text-orange-900 ring-2 ring-orange-500",
    inactive:
      "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
    dot: "bg-orange-500",
  },
  3: {
    active: "bg-red-100 border-red-500 text-red-900 ring-2 ring-red-500",
    inactive: "bg-red-50 border-red-200 text-red-700 hover:bg-red-100",
    dot: "bg-red-600",
  },
};

const SEVERITY_DESCRIPTIONS: Record<number, string> = {
  0: "Doesn't need to be fixed unless time permits",
  1: "Low priority, fix before next release",
  2: "High priority, important to fix",
  3: "Imperative to fix before product ships",
};

export default function FindingForm({ initialFinding, onSave }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [existingPrototypes, setExistingPrototypes] = useState<string[]>([]);
  const [existingIterations, setExistingIterations] = useState<string[]>([]);
  useEffect(() => {
    const all = getFindings();
    setExistingPrototypes([...new Set(all.map((f) => f.prototype).filter((p): p is string => Boolean(p)))]);
    setExistingIterations([...new Set(all.filter((f) => !prototype || f.prototype === prototype).map((f) => f.iteration).filter(Boolean))]);
  }, [prototype]);

  const [heuristic, setHeuristic] = useState(
    initialFinding?.heuristic ?? HEURISTICS[0].label
  );
  const [severity, setSeverity] = useState<0 | 1 | 2 | 3>(
    initialFinding?.severity ?? 2
  );
  const [screen, setScreen] = useState(initialFinding?.screen ?? "");
  const [screenshot, setScreenshot] = useState<string | undefined>(
    initialFinding?.screenshot
  );
  const [observation, setObservation] = useState(
    initialFinding?.observation ?? ""
  );
  const [recommendation, setRecommendation] = useState(
    initialFinding?.recommendation ?? ""
  );
  const [source, setSource] = useState(initialFinding?.source ?? "Claude");
  const [prototype, setPrototype] = useState(initialFinding?.prototype ?? "");
  const [iteration, setIteration] = useState(initialFinding?.iteration ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const selectedHeuristic = HEURISTICS.find((h) => h.label === heuristic);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshot(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!screen.trim()) errs.screen = "Screen/Flow is required";
    if (!observation.trim()) errs.observation = "Observation is required";
    if (!recommendation.trim())
      errs.recommendation = "Recommendation is required";
    if (!source.trim()) errs.source = "Source is required";
    if (!prototype.trim()) errs.prototype = "Prototype is required";
    if (!iteration.trim()) errs.iteration = "Iteration is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const finding: Finding = {
      id: initialFinding?.id ?? uuidv4(),
      heuristic,
      severity,
      screen,
      screenshot,
      observation,
      recommendation,
      prototype,
      source,
      iteration,
      createdAt: initialFinding?.createdAt ?? new Date().toISOString(),
    };

    saveFinding(finding);
    if (onSave) {
      onSave();
    } else {
      router.push(`/findings/${finding.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Prototype */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prototype
        </label>
        <input
          type="text"
          value={prototype}
          onChange={(e) => setPrototype(e.target.value)}
          list="prototype-options"
          placeholder="e.g. Checkout redesign, Onboarding v3"
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.prototype ? 'border-red-400' : 'border-gray-300'
          }`}
        />
        {errors.prototype && (
          <p className="mt-1 text-xs text-red-600">{errors.prototype}</p>
        )}
      </div>

              <datalist id="prototype-options">
          {existingPrototypes.map((p) => <option key={p} value={p} />)}
        </datalist>
      {/* Heuristic */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Heuristic
        </label>
        <div className="relative">
          <select
            value={heuristic}
            onChange={(e) => setHeuristic(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none pr-8"
          >
            {HEURISTICS.map((h) => (
              <option key={h.id} value={h.label}>
                {h.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {selectedHeuristic && (
          <p className="mt-1.5 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2 border border-gray-100">
            {selectedHeuristic.description}
          </p>
        )}
      </div>

      {/* Severity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Severity
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {([0, 1, 2, 3] as const).map((s) => {
            const styles = SEVERITY_BUTTON_STYLES[s];
            const isActive = severity === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`relative flex flex-col items-center gap-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  isActive ? styles.active : styles.inactive
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${styles.dot}`}
                  />
                  <span className="font-semibold">{s}</span>
                </div>
                <span className="text-xs">{SEVERITY_LABELS[s]}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-gray-500">
          {SEVERITY_DESCRIPTIONS[severity]}
        </p>
      </div>

      {/* Screen/Flow */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Screen / Flow
        </label>
        <input
          type="text"
          value={screen}
          onChange={(e) => setScreen(e.target.value)}
          placeholder="e.g. Checkout > Payment step"
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            errors.screen ? "border-red-400" : "border-gray-300"
          }`}
        />
        {errors.screen && (
          <p className="mt-1 text-xs text-red-600">{errors.screen}</p>
        )}
      </div>

      {/* Screenshot */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Screenshot{" "}
          <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {screenshot ? (
            <div className="space-y-2">
              <img
                src={screenshot}
                alt="Screenshot preview"
                className="max-h-48 mx-auto rounded border border-gray-200"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setScreenshot(undefined);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-xs text-red-600 hover:text-red-800"
              >
                Remove screenshot
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              <svg
                className="w-8 h-8 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-500">
                Click to upload a screenshot
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, WebP</p>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Observation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Observation
        </label>
        <textarea
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder="What was observed? Keep this factual and objective."
          rows={3}
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
            errors.observation ? "border-red-400" : "border-gray-300"
          }`}
        />
        {errors.observation && (
          <p className="mt-1 text-xs text-red-600">{errors.observation}</p>
        )}
      </div>

      {/* Recommendation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recommendation
        </label>
        <textarea
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          placeholder="Suggested fix or improvement."
          rows={3}
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
            errors.recommendation ? "border-red-400" : "border-gray-300"
          }`}
        />
        {errors.recommendation && (
          <p className="mt-1 text-xs text-red-600">{errors.recommendation}</p>
        )}
      </div>

      {/* Source + Iteration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Source (evaluator name)
          </label>
          <input
            type="text"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="Claude"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.source ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.source && (
            <p className="mt-1 text-xs text-red-600">{errors.source}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Iteration
          </label>
          <input
            type="text"
            value={iteration}
            onChange={(e) => setIteration(e.target.value)}
            list="iteration-options"
            placeholder="e.g. v2 prototype, May 2026"
            className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              errors.iteration ? "border-red-400" : "border-gray-300"
            }`}
          />
          {errors.iteration && (
            <p className="mt-1 text-xs text-red-600">{errors.iteration}</p>
          )}
          <datalist id="iteration-options">
            {existingIterations.map((it) => <option key={it} value={it} />)}
          </datalist>
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 sm:flex-none px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {initialFinding ? "Save Changes" : "Add Finding"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
