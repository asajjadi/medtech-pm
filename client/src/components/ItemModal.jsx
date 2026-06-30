import { useState } from "react";
import { PHASES, STATUSES, STATUS_LABEL, RISKS } from "../lib/constants.js";

const today = () => new Date().toISOString().slice(0, 10);

export default function ItemModal({ item, defaultPhase, onSave, onDelete, onClose }) {
  const isNew = !item;
  const [form, setForm] = useState(
    item || {
      title: "",
      phase: defaultPhase && defaultPhase !== "all" ? defaultPhase : "concept",
      status: "backlog",
      risk: "med",
      owner: "",
      start: today(),
      due: today(),
    }
  );

  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--surface-2)", borderRadius: 12, padding: "1.5rem", width: 420, maxWidth: "100%" }}>
        <Field label="Title">
          <input style={{ width: "100%" }} value={form.title} onChange={set("title")} placeholder="e.g. Design input requirements (DIR)" />
        </Field>
        <Row2>
          <Field label="Phase">
            <select style={{ width: "100%" }} value={form.phase} onChange={set("phase")}>
              {PHASES.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select style={{ width: "100%" }} value={form.status} onChange={set("status")}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_LABEL[s]}</option>
              ))}
            </select>
          </Field>
        </Row2>
        <Row2>
          <Field label="Owner">
            <input style={{ width: "100%" }} value={form.owner} onChange={set("owner")} placeholder="e.g. RA, QA, Eng" />
          </Field>
          <Field label="Risk">
            <select style={{ width: "100%" }} value={form.risk} onChange={set("risk")}>
              {RISKS.map((r) => (
                <option key={r} value={r}>{r === "med" ? "Medium" : r[0].toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </Field>
        </Row2>
        <Row2>
          <Field label="Start date">
            <input style={{ width: "100%" }} type="date" value={form.start} onChange={set("start")} />
          </Field>
          <Field label="Due date">
            <input style={{ width: "100%" }} type="date" value={form.due} onChange={set("due")} />
          </Field>
        </Row2>
        {confirmDelete ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 16, padding: "10px 12px", background: "var(--bg-danger)", border: "0.5px solid var(--border-danger)", borderRadius: "var(--radius)" }}>
            <span style={{ fontSize: 13, color: "var(--text-danger)" }}>Delete this item permanently?</span>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)}>Cancel</button>
              <button style={{ background: "var(--text-danger)", color: "#fff", borderColor: "var(--text-danger)" }} onClick={() => onDelete(item.id)}>
                Delete
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
            {!isNew && (
              <button className="ghost" style={{ color: "var(--text-danger)", marginRight: "auto" }} onClick={() => setConfirmDelete(true)}>
                Delete
              </button>
            )}
            <button onClick={onClose}>Cancel</button>
            <button className="primary" onClick={() => onSave({ ...form, title: form.title.trim() || "Untitled item", owner: form.owner.trim() || "Unassigned" })}>
              {isNew ? "Add item" : "Save changes"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{label}</label>
      {children}
    </div>
  );
}

function Row2({ children }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{children}</div>;
}
