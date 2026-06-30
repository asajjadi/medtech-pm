export default function StatGrid({ items }) {
  const today = new Date().toISOString().slice(0, 10);
  const total = items.length;
  const done = items.filter((i) => i.status === "done").length;
  const highRisk = items.filter((i) => i.risk === "high" && i.status !== "done").length;
  const overdue = items.filter((i) => i.status !== "done" && i.due < today).length;

  const stats = [
    { label: "Total items", value: total },
    { label: "Completed", value: done },
    { label: "Open high risk", value: highRisk, danger: highRisk > 0 },
    { label: "Overdue", value: overdue, danger: overdue > 0 },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 24 }}>
      {stats.map((s) => (
        <div key={s.label} style={{ background: "var(--surface-1)", borderRadius: "var(--radius)", padding: 16 }}>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 4px" }}>{s.label}</p>
          <p style={{ fontSize: 24, fontWeight: 500, margin: 0, color: s.danger ? "var(--text-danger)" : "var(--text-primary)" }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
