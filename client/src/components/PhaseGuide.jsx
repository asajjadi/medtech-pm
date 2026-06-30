import { LIFECYCLE, phaseReadiness } from "../lib/guide.js";

// Shown above the board when a single phase is selected — explains that phase
// in context and shows a readiness checklist of its standard deliverables.
export default function PhaseGuide({ phaseId, items, onAddDeliverable }) {
  const phase = LIFECYCLE.find((p) => p.id === phaseId);
  if (!phase) return null;
  const readiness = phaseReadiness(phaseId, items);

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

      {readiness.total > 0 && (
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "0.5px solid var(--border-accent)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Phase readiness</span>
            <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              {readiness.metCount}/{readiness.total} ({readiness.percent}%)
            </span>
          </div>
          <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
            <div style={{ width: `${readiness.percent}%`, height: "100%", background: readiness.percent === 100 ? "var(--text-success)" : "var(--text-accent)", transition: "width 0.3s ease" }} />
          </div>
          {readiness.items.map((d) => (
            <div key={d.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, padding: "3px 0" }}>
              <span style={{ color: d.met ? "var(--text-primary)" : "var(--text-secondary)" }}>
                {d.met ? "✅" : "⬜"} {d.label}
              </span>
              {!d.met && onAddDeliverable && (
                <button style={{ fontSize: 11, padding: "2px 8px" }} onClick={() => onAddDeliverable(phaseId, d.label)}>
                  + Add
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
