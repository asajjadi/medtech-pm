import { useState } from "react";
import { LIFECYCLE } from "../lib/guide.js";

export default function Onboarding({ onFinish }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  async function choose(scaffold) {
    setBusy(true);
    await onFinish(scaffold);
    // parent unmounts this component on completion
  }

  const card = {
    background: "var(--surface-2)",
    border: "0.5px solid var(--border)",
    borderRadius: 14,
    padding: "1.75rem",
    width: 560,
    maxWidth: "100%",
    maxHeight: "85vh",
    overflowY: "auto",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div style={card}>
        {step === 0 && (
          <>
            <h2 style={{ margin: "0 0 8px", fontSize: 22 }}>Welcome 👋</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 14 }}>
              New to medical devices? That's fine. This tool walks you through running a real
              medical device project step by step, explaining the "why" as you go. By the end
              you'll have built a project and learned how the field works.
            </p>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontSize: 14 }}>
              First, here's the big picture: every medical device goes through the same seven
              phases. Let's look at them.
            </p>
            <Nav>
              <span />
              <button onClick={() => setStep(1)}>See the lifecycle →</button>
            </Nav>
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ margin: "0 0 4px", fontSize: 20 }}>The medical device lifecycle</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 0 }}>
              Your board is organized by these phases. Work flows top to bottom.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "14px 0" }}>
              {LIFECYCLE.map((p, i) => (
                <div key={p.id} style={{ borderLeft: "3px solid var(--border-accent)", paddingLeft: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>
                    {i + 1}. {p.label}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{p.what}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    Why it matters: {p.why}
                  </div>
                </div>
              ))}
            </div>
            <Nav>
              <button onClick={() => setStep(0)}>← Back</button>
              <button onClick={() => setStep(2)}>Got it, let's start →</button>
            </Nav>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ margin: "0 0 8px", fontSize: 20 }}>How do you want to begin?</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
              Most newcomers learn fastest from a worked example. We can set up a starter project
              with the standard tasks every medical device project needs — one per phase — so you
              have a real backbone to explore, edit, and build on.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
              <button
                disabled={busy}
                onClick={() => choose(true)}
                style={{ padding: "12px 14px", textAlign: "left", background: "var(--bg-accent)", border: "0.5px solid var(--border-accent)", color: "var(--text-accent)" }}
              >
                <div style={{ fontWeight: 600 }}>⭐ Set up a starter project (recommended)</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  Adds 7 standard tasks across the lifecycle. Best for learning.
                </div>
              </button>
              <button
                disabled={busy}
                onClick={() => choose(false)}
                style={{ padding: "12px 14px", textAlign: "left" }}
              >
                <div style={{ fontWeight: 600 }}>Start from a blank board</div>
                <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                  I'll add my own items. The Coach is still here to help.
                </div>
              </button>
            </div>
            {busy && <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 12 }}>Setting up…</div>}
          </>
        )}
      </div>
    </div>
  );
}

function Nav({ children }) {
  return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>{children}</div>;
}
