export default function Timeline({ items, onSelectItem }) {
  if (items.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "2rem 1rem", color: "var(--text-muted)", fontSize: 13 }}>
        No items in this phase yet.
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => a.start.localeCompare(b.start));
  const allDates = sorted.flatMap((i) => [i.start, i.due]);
  const minD = new Date(allDates.reduce((a, b) => (a < b ? a : b)));
  const maxD = new Date(allDates.reduce((a, b) => (a > b ? a : b)));
  const totalDays = Math.max(1, (maxD - minD) / 86400000);

  return (
    <div>
      {sorted.map((i) => {
        const startOff = (new Date(i.start) - minD) / 86400000;
        const dur = Math.max(1, (new Date(i.due) - new Date(i.start)) / 86400000);
        const leftPct = (startOff / totalDays) * 100;
        const widthPct = Math.max(2, (dur / totalDays) * 100);
        const isDone = i.status === "done";
        const isRisk = !isDone && i.risk === "high";
        const barColor = isDone ? "var(--bg-success)" : isRisk ? "var(--bg-danger)" : "var(--bg-accent)";
        const barBorder = isDone ? "var(--border-success)" : isRisk ? "var(--border-danger)" : "var(--border-accent)";

        return (
          <div
            key={i.id}
            onClick={() => onSelectItem(i)}
            style={{ display: "grid", gridTemplateColumns: "200px 1fr", alignItems: "center", marginBottom: 6, gap: 8, cursor: "pointer" }}
          >
            <div style={{ fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.title}</div>
            <div style={{ position: "relative", height: 22, background: "var(--surface-1)", borderRadius: 4 }}>
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  bottom: 3,
                  left: `${leftPct}%`,
                  width: `${widthPct}%`,
                  borderRadius: 4,
                  background: barColor,
                  border: `0.5px solid ${barBorder}`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
