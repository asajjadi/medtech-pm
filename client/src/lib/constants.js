export const PHASES = [
  { id: "concept", label: "Concept" },
  { id: "design_input", label: "Design input" },
  { id: "design_output", label: "Design output" },
  { id: "vv", label: "V&V" },
  { id: "transfer", label: "Design transfer" },
  { id: "regulatory", label: "Regulatory" },
  { id: "production", label: "Production" },
];

export const STATUSES = ["backlog", "in_progress", "review", "done"];

export const STATUS_LABEL = {
  backlog: "Backlog",
  in_progress: "In progress",
  review: "Review",
  done: "Done",
};

export const RISKS = ["low", "med", "high"];

export function phaseLabel(id) {
  return PHASES.find((p) => p.id === id)?.label || id;
}
