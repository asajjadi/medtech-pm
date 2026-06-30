import { PHASES } from "../lib/constants.js";

export default function PhaseRail({ items, activePhase, onSelect }) {
  const countFor = (id) => (id === "all" ? items.length : items.filter((i) => i.phase === id).length);

  const pills = [{ id: "all", label: "All phases" }, ...PHASES];

  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 24, overflowX: "auto" }}>
      {pills.map((p) => {
        const active = activePhase === p.id;
        return (
          <div
            key={p.id}
            onClick={() => onSelect(p.id)}
            style={{
              flex: 1,
              minWidth: 92,
              textAlign: "center",
              padding: "8px 6px",
              fontSize: 12,
              borderBottom: `3px solid ${active ? "var(--text-accent)" : "var(--border)"}`,
              cursor: "pointer",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              fontWeight: active ? 500 : 400,
              whiteSpace: "nowrap",
            }}
          >
            {p.label}
            <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
              {countFor(p.id)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
