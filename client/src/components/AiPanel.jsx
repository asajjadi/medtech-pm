import { useState } from "react";
import { phaseLabel } from "../lib/constants.js";
import { api } from "../lib/api.js";

export default function AiPanel({ onItemsAdded, projectId }) {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult("");
    setSuggestions([]);
    try {
      const { suggestions: items } = await api.generate(prompt);
      setSuggestions(items);
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  }

  async function handleAnalyze() {
    setLoading(true);
    setResult("");
    try {
      const { analysis } = await api.analyze();
      setResult(analysis);
    } catch (err) {
      setResult(err.message);
    }
    setLoading(false);
  }

  async function acceptSuggestion(s) {
    const created = await api.createItem({ ...s, projectId });
    setSuggestions((prev) => prev.filter((x) => x !== s));
    onItemsAdded(created);
  }

  return (
    <div style={{ background: "var(--surface-1)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500, marginBottom: 10 }}>
        AI assistant
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        <input
          style={{ flex: 1 }}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
          placeholder="e.g. Generate a DFMEA checklist for the mechanical subassembly"
        />
        <button onClick={handleGenerate}>Generate items</button>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleAnalyze}>Analyze project</button>
      </div>
      {loading && <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 8 }}>Thinking…</div>}
      {result && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "0.5px solid var(--border)", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {result}
        </div>
      )}
      {suggestions.length > 0 && (
        <div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 10 }}>
            Suggested items — add the ones you want:
          </div>
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--surface-2)",
                border: "0.5px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: "8px 10px",
                marginTop: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontSize: 13 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                  {phaseLabel(s.phase)} · {s.owner} · {s.risk} risk
                </div>
              </div>
              <button style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => acceptSuggestion(s)}>
                Add
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
