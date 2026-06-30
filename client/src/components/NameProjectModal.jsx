import { useState } from "react";

export default function NameProjectModal({ onCreate, onClose }) {
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    const n = name.trim();
    if (!n || busy) return;
    setBusy(true);
    await onCreate(n);
  }

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div onClick={(e) => e.stopPropagation()} className="card card-pad" style={{ width: 420, maxWidth: "100%", boxShadow: "var(--shadow-lg)" }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 18 }}>New project</h2>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--text-secondary)" }}>
          Each project has its own board, timeline, and history. Give this one a name.
        </p>
        <input
          autoFocus
          style={{ width: "100%" }}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="e.g. Infusion pump v2"
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
          <button onClick={onClose}>Cancel</button>
          <button className="primary" disabled={!name.trim() || busy} onClick={submit}>
            {busy ? "Creating…" : "Create project"}
          </button>
        </div>
      </div>
    </div>
  );
}
