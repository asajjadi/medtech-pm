import { useEffect, useState } from "react";
import StatGrid from "./components/StatGrid.jsx";
import PhaseRail from "./components/PhaseRail.jsx";
import PhaseGuide from "./components/PhaseGuide.jsx";
import Board from "./components/Board.jsx";
import Timeline from "./components/Timeline.jsx";
import ItemModal from "./components/ItemModal.jsx";
import AiPanel from "./components/AiPanel.jsx";
import Coach from "./components/Coach.jsx";
import Onboarding from "./components/Onboarding.jsx";
import Glossary from "./components/Glossary.jsx";
import Toaster from "./components/Toaster.jsx";
import NameProjectModal from "./components/NameProjectModal.jsx";
import { api } from "./lib/api.js";
import { starterItems } from "./lib/guide.js";
import { toast } from "./lib/toast.js";

export default function App() {
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(localStorage.getItem("medtech_project_id") || "");
  const [items, setItems] = useState([]);
  const [activePhase, setActivePhase] = useState("all");
  const [view, setView] = useState("board");
  const [modalState, setModalState] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [showGuide, setShowGuide] = useState(!localStorage.getItem("medtech_onboarded"));
  const [showGlossary, setShowGlossary] = useState(false);
  const [naming, setNaming] = useState(false);

  // Load projects, pick the active one, then load its items.
  useEffect(() => {
    (async () => {
      const projs = await api.getProjects();
      setProjects(projs);
      const active = projs.find((p) => p.id === currentProjectId) ? currentProjectId : projs[0].id;
      setCurrentProjectId(active);
      localStorage.setItem("medtech_project_id", active);
      setItems(await api.getItems(active));
      setLoaded(true);
    })();
  }, []);

  const currentProject = projects.find((p) => p.id === currentProjectId);

  async function switchProject(id) {
    setCurrentProjectId(id);
    localStorage.setItem("medtech_project_id", id);
    setActivePhase("all");
    setItems(await api.getItems(id));
  }

  async function createNewProject(name) {
    const project = await api.createProject(name);
    setProjects((prev) => [...prev, project]);
    setNaming(false);
    await switchProject(project.id);
    toast(`Created project "${project.name}"`);
  }

  async function renameCurrent(name) {
    setProjects((prev) => prev.map((p) => (p.id === currentProjectId ? { ...p, name } : p)));
    await api.renameProject(currentProjectId, name);
  }

  async function finishOnboarding(scaffold) {
    if (scaffold) {
      const created = [];
      for (const it of starterItems()) {
        created.push(await api.createItem({ ...it, projectId: currentProjectId }));
      }
      setItems((prev) => [...prev, ...created]);
      toast("Starter project set up — 7 tasks added");
    }
    localStorage.setItem("medtech_onboarded", "1");
    setShowGuide(false);
  }

  const visibleItems = activePhase === "all" ? items : items.filter((i) => i.phase === activePhase);

  async function handleSave(form) {
    if (modalState.item) {
      const updated = await api.updateItem(modalState.item.id, form);
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      toast("Changes saved");
    } else {
      const created = await api.createItem({ ...form, projectId: currentProjectId });
      setItems((prev) => [...prev, created]);
      toast("Item added");
    }
    setModalState(null);
  }

  async function handleDelete(id) {
    await api.deleteItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setModalState(null);
    toast("Item deleted", "error");
  }

  function handleItemsAdded(item) {
    setItems((prev) => [...prev, item]);
  }

  if (!loaded) {
    return <div style={{ padding: 40, color: "var(--text-secondary)" }}>Loading…</div>;
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "1.5rem 1.5rem 3rem" }}>
      {/* Header / branding */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div className="brand-mark">C</div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.1 }}>ClearPath QMS</div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Learn medical device PM by doing</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="ghost" onClick={() => setShowGlossary(true)}>📖 Glossary</button>
          <button className="ghost" onClick={() => setShowGuide(true)}>🎓 Guide</button>
        </div>
      </header>

      {/* Project switcher + name + actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 280 }}>
          <input
            key={currentProjectId}
            defaultValue={currentProject?.name || ""}
            onBlur={(e) => renameCurrent(e.target.value.trim() || currentProject.name)}
            aria-label="Project name"
            style={{ fontSize: 22, fontWeight: 600, border: "0.5px solid transparent", background: "transparent", padding: "4px 8px", flex: 1 }}
            onFocus={(e) => (e.target.style.background = "var(--surface-2)")}
          />
          {projects.length > 1 && (
            <select value={currentProjectId} onChange={(e) => switchProject(e.target.value)} aria-label="Switch project">
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
        <button className="ghost" onClick={() => setNaming(true)}>＋ New project</button>
      </div>

      <StatGrid items={items} />
      <Coach items={items} />
      <AiPanel projectId={currentProjectId} onItemsAdded={handleItemsAdded} />
      <PhaseRail items={items} activePhase={activePhase} onSelect={setActivePhase} />

      {activePhase !== "all" && <PhaseGuide phaseId={activePhase} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 8, flexWrap: "wrap" }}>
        <div style={{ display: "flex", border: "0.5px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <button
            style={{ borderRadius: 0, border: "none", background: view === "board" ? "var(--bg-accent)" : "var(--surface-2)", color: view === "board" ? "var(--text-accent)" : "var(--text-primary)" }}
            onClick={() => setView("board")}
          >
            Board
          </button>
          <button
            style={{ borderRadius: 0, border: "none", background: view === "timeline" ? "var(--bg-accent)" : "var(--surface-2)", color: view === "timeline" ? "var(--text-accent)" : "var(--text-primary)" }}
            onClick={() => setView("timeline")}
          >
            Timeline
          </button>
        </div>
        <button className="primary" onClick={() => setModalState({ item: null })}>+ New item</button>
      </div>

      {items.length === 0 ? (
        <EmptyState onAdd={() => setModalState({ item: null })} onGuide={() => setShowGuide(true)} />
      ) : view === "board" ? (
        <Board items={visibleItems} onSelectItem={(item) => setModalState({ item })} />
      ) : (
        <Timeline items={visibleItems} onSelectItem={(item) => setModalState({ item })} />
      )}

      {/* Disclaimer */}
      <footer style={{ marginTop: 40, paddingTop: 16, borderTop: "0.5px solid var(--border)", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
        ⚠️ Educational tool only. The guidance and AI responses here help you learn medical device project
        management — they are not regulatory, legal, or compliance advice. Always confirm requirements against the
        current standards and your company's Quality Management System.
      </footer>

      {modalState && (
        <ItemModal
          item={modalState.item}
          defaultPhase={activePhase}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModalState(null)}
        />
      )}

      {showGuide && <Onboarding onFinish={finishOnboarding} />}
      {showGlossary && <Glossary onClose={() => setShowGlossary(false)} />}
      {naming && <NameProjectModal onCreate={createNewProject} onClose={() => setNaming(false)} />}
      <Toaster />
    </div>
  );
}

function EmptyState({ onAdd, onGuide }) {
  return (
    <div className="card card-pad fade-in" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>🗂️</div>
      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>This project is empty</div>
      <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16, maxWidth: 360, marginInline: "auto", lineHeight: 1.55 }}>
        Add your first task, or open the Guide to scaffold a starter project with the standard tasks every medical
        device project needs.
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button className="primary" onClick={onAdd}>+ Add first item</button>
        <button onClick={onGuide}>🎓 Open the Guide</button>
      </div>
    </div>
  );
}
