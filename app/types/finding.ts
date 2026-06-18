export interface Finding {
  id: string;
  heuristic: string;
  severity: 0 | 1 | 2 | 3;
  screen: string;
  screenshot?: string;
  observation: string;
  recommendation: string;
  source: string;
  prototype: string;
  iteration: string;
  createdAt: string;
}

export const HEURISTICS = [
  {
    id: "H1",
    label: "H1 – Visibility of System Status",
    description:
      "The design should always keep users informed about what is going on, through appropriate feedback within a reasonable amount of time.",
  },
  {
    id: "H2",
    label: "H2 – Match Between System and the Real World",
    description:
      "The design should speak the users' language. Use words, phrases, and concepts familiar to the user, rather than internal jargon.",
  },
  {
    id: "H3",
    label: "H3 – User Control and Freedom",
    description:
      "Users often perform actions by mistake. They need a clearly marked 'emergency exit' to leave the unwanted action without having to go through an extended process.",
  },
  {
    id: "H4",
    label: "H4 – Consistency and Standards",
    description:
      "Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform and industry conventions.",
  },
  {
    id: "H5",
    label: "H5 – Error Prevention",
    description:
      "Good error messages are important, but the best designs carefully prevent problems from occurring in the first place.",
  },
  {
    id: "H6",
    label: "H6 – Recognition Rather Than Recall",
    description:
      "Minimize the user's memory load by making elements, actions, and options visible. The user should not have to remember information from one part of the interface to another.",
  },
  {
    id: "H7",
    label: "H7 – Flexibility and Efficiency of Use",
    description:
      "Shortcuts — hidden from novice users — may speed up the interaction for the expert user such that the design can cater to both inexperienced and experienced users.",
  },
  {
    id: "H8",
    label: "H8 – Aesthetic and Minimalist Design",
    description:
      "Interfaces should not contain irrelevant or rarely needed information. Every extra unit of information in an interface competes with the relevant information and diminishes their relative visibility.",
  },
  {
    id: "H9",
    label: "H9 – Help Users Recognize, Diagnose, and Recover from Errors",
    description:
      "Error messages should be expressed in plain language (no error codes), precisely indicate the problem, and constructively suggest a solution.",
  },
  {
    id: "H10",
    label: "H10 – Help and Documentation",
    description:
      "It's best if the system doesn't need any additional explanation. However, it may be necessary to provide documentation to help users understand how to complete their tasks.",
  },
];

export const SEVERITY_LABELS: Record<number, string> = {
  0: "Cosmetic",
  1: "Minor",
  2: "Major",
  3: "Catastrophic",
};

export const SEVERITY_COLORS: Record<number, { bg: string; text: string; border: string; badge: string }> = {
  0: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-300",
    badge: "bg-gray-100 text-gray-700 border border-gray-300",
  },
  1: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
    badge: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  },
  2: {
    bg: "bg-orange-50",
    text: "text-orange-800",
    border: "border-orange-300",
    badge: "bg-orange-100 text-orange-800 border border-orange-300",
  },
  3: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-300",
    badge: "bg-red-100 text-red-800 border border-red-300",
  },
};
