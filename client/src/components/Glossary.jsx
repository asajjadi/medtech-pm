import { useState } from "react";
import { GLOSSARY } from "../lib/guide.js";

export default function Glossary({ onClose }) {
  const [q, setQ] = useState("");
  const terms = GLOSSARY.filter(
    (t) => t.term.toLowerCase().includes(q.toLowerCase()) || t.def.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: 560, maxWidth: "100%", maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-lg)" }}>
        <div style={{ padding: "1.25rem 1.5rem 0.75rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Glossary</h2>
            <button className="ghost" onClick={onClose}>✕</button>
          </div>
          <input style={{ width: "100%" }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search terms…" />
        </div>
        <div style={{ overflowY: "auto", padding: "0 1.5rem 1.25rem" }}>
          {terms.map((t) => (
            <div key={t.term} style={{ padding: "10px 0", borderTop: "0.5px solid var(--border)" }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{t.term}</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>{t.def}</div>
            </div>
          ))}
          {terms.length === 0 && <div style={{ padding: "16px 0", color: "var(--text-muted)", fontSize: 13 }}>No terms match "{q}".</div>}
        </div>
      </div>
    </div>
  );
}
