import { Finding } from "@/app/types/finding";

const STORAGE_KEY = "heuristics_findings";

export function getFindings(): Finding[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFinding(finding: Finding): void {
  const findings = getFindings();
  const existingIndex = findings.findIndex((f) => f.id === finding.id);
  if (existingIndex >= 0) {
    findings[existingIndex] = finding;
  } else {
    findings.push(finding);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(findings));
}

export function deleteFinding(id: string): void {
  const findings = getFindings().filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(findings));
}

export function getFindingById(id: string): Finding | undefined {
  return getFindings().find((f) => f.id === id);
}

export function exportJSON(findings: Finding[]): void {
  const blob = new Blob([JSON.stringify(findings, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `heuristic-findings-${new Date().toISOString().split("T")[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportFigJam(findings: Finding[]): void {
  const lines = findings.map((f, i) => {
    const severityLabels = ["Cosmetic", "Minor", "Major", "Catastrophic"];
    return [
      `--- Finding ${i + 1} ---`,
      `Heuristic: ${f.heuristic}`,
      `Severity: ${f.severity} – ${severityLabels[f.severity]}`,
      `Screen/Flow: ${f.screen}`,
      `Source: ${f.source}`,
      `Iteration: ${f.iteration}`,
      ``,
      `OBSERVATION:`,
      f.observation,
      ``,
      `RECOMMENDATION:`,
      f.recommendation,
      ``,
    ].join("\n");
  });

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `figjam-findings-${new Date().toISOString().split("T")[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
