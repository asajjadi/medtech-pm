import { LIFECYCLE } from "../lib/guide.js";

// Shown above the board when a single phase is selected — explains that phase in context.
export default function PhaseGuide({ phaseId }) {
  const phase = LIFECYCLE.find((p) => p.id === phaseId);
  if (!phase) return null;
  return (
    <div className="fade-in" style={{ background: "var(--bg-accent)", border: "0.5px solid var(--border-accent)", borderRadius: 12, padding: "0.85rem 1.1rem", marginBottom: 16 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-accent)", marginBottom: 2 }}>
        About this phase: {phase.label}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55 }}>{phase.what}</div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5, marginTop: 4 }}>
        <strong>Why it matters:</strong> {phase.why}
      </div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>📋 {phase.standards}</div>
    </div>
  );
}
