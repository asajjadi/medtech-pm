import { useState } from "react";
import { api } from "../lib/api.js";
import { COACH_PROMPTS } from "../lib/guide.js";

export default function Coach() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(q) {
    const text = (q ?? question).trim();
    if (!text) return;
    setQuestion(text);
    setLoading(true);
    setAnswer("");
    try {
      const { answer } = await api.coach(text);
      setAnswer(answer);
    } catch (err) {
      setAnswer(err.message);
    }
    setLoading(false);
  }

  return (
    <div style={{ background: "var(--bg-accent)", border: "0.5px solid var(--border-accent)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, marginBottom: 4, color: "var(--text-accent)" }}>
        🎓 Coach — new to medical devices? Ask anything
      </div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
        Plain-language answers grounded in your project. Jargon gets explained.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          style={{ flex: 1 }}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && ask()}
          placeholder="e.g. What is design input and why does it matter?"
        />
        <button onClick={() => ask()}>Ask</button>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {COACH_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => ask(p)}
            style={{ fontSize: 11, padding: "3px 8px", background: "var(--surface-2)", color: "var(--text-secondary)" }}
          >
            {p}
          </button>
        ))}
      </div>
      {loading && <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 10 }}>Coach is thinking…</div>}
      {answer && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "0.5px solid var(--border-accent)", fontSize: 13, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>
          {answer}
        </div>
      )}
    </div>
  );
}
