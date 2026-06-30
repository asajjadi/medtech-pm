export const PHASES = [
  { id: "concept", label: "Concept" },
  { id: "design_input", label: "Design input" },
  { id: "design_output", label: "Design output" },
  { id: "vv", label: "V&V" },
  { id: "transfer", label: "Design transfer" },
  { id: "regulatory", label: "Regulatory" },
  { id: "production", label: "Production" },
];

export const PHASE_IDS = PHASES.map((p) => p.id);

export const STATUSES = ["backlog", "in_progress", "review", "done"];

export const RISKS = ["low", "med", "high"];

export function uid() {
  return Math.random().toString(36).slice(2, 8);
}
