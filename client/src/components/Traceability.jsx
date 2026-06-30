import { phaseLabel } from "../lib/constants.js";

// Visualizes requirements traceability: which items satisfy/verify which others,
// and flags design inputs that nothing traces to yet (coverage gaps).
export default function Traceability({ items }) {
  const byId = Object.fromEntries(items.map((i) => [i.id, i]));
  const linked = items.filter((i) => (i.tracesTo || []).length > 0);

  // Design inputs that no item traces to = coverage gaps.
  const tracedTargets = new Set(items.flatMap((i) => i.tracesTo || []));
  const gaps = items.filter((i) => i.phase === "design_input" && !tracedTargets.has(i.id));

  return (
    <div className="fade-in">
      <div className="card card-pad" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>What is traceability?</div>
        <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
          In design controls, every design input (requirement) should be satisfied by a design output and
          confirmed by verification/validation. Linking items here builds that chain — auditors check it closely.
          Open any item and use "Traces to" to connect it to what it satisfies or verifies.
        </div>
      </div>

      {linked.length === 0 ? (
        <div className="card card-pad" style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          No trace links yet. Edit an item and set "Traces to" to start building the chain.
        </div>
      ) : (
        <div className="card card-pad" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Trace links</div>
          {linked.map((i) => (
            <div key={i.id} style={{ padding: "6px 0", borderTop: "0.5px solid var(--border)", fontSize: 13 }}>
              <span style={{ fontWeight: 500 }}>{i.title}</span>{" "}
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>({phaseLabel(i.phase)})</span>
              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                → traces to:{" "}
                {(i.tracesTo || [])
                  .map((id) => byId[id]?.title)
                  .filter(Boolean)
                  .join(", ") || "(linked item removed)"}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card card-pad" style={{ borderLeft: gaps.length ? "3px solid var(--text-warning)" : "3px solid var(--text-success)" }}>
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
          Coverage gaps {gaps.length ? `(${gaps.length})` : "— none 🎉"}
        </div>
        {gaps.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
            Every design input is traced to by something downstream.
          </div>
        ) : (
          gaps.map((g) => (
            <div key={g.id} style={{ fontSize: 13, color: "var(--text-warning)", padding: "2px 0" }}>
              ⚠️ {g.title} — no design output or verification traces to this input yet.
            </div>
          ))
        )}
      </div>
    </div>
  );
}
