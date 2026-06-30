import { STATUSES, STATUS_LABEL } from "../lib/constants.js";

function RiskBadge({ risk }) {
  const map = {
    high: { bg: "var(--bg-danger)", text: "var(--text-danger)", label: "High risk" },
    med: { bg: "var(--bg-warning)", text: "var(--text-warning)", label: "Med risk" },
    low: { bg: "var(--bg-success)", text: "var(--text-success)", label: "Low risk" },
  };
  const s = map[risk] || map.low;
  return (
    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: "var(--radius)", fontWeight: 500, background: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
}

export default function Board({ items, onSelectItem }) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)", fontSize: 13 }}>
        No items in this phase yet.
        <br />
        Add one to start tracking.
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
      {STATUSES.map((s) => {
        const colItems = items.filter((i) => i.status === s);
        return (
          <div key={s} style={{ background: "var(--surface-1)", borderRadius: 12, padding: 10, minHeight: 80 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>{STATUS_LABEL[s]}</span>
              <span>{colItems.length}</span>
            </div>
            {colItems.map((i) => (
              <div
                key={i.id}
                onClick={() => onSelectItem(i)}
                style={{ background: "var(--surface-2)", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 12px", marginBottom: 8, cursor: "pointer" }}
              >
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 6px" }}>{i.title}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-muted)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 10 }}>
                    {i.owner} · due {i.due}
                  </span>
                  <RiskBadge risk={i.risk} />
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
