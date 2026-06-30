// In-browser demo backend. Used when VITE_DEMO_MODE=true so the app runs as a
// static site with no server: data persists in localStorage, AI is canned.
const uid = () => Math.random().toString(36).slice(2, 8);
const today = () => new Date().toISOString().slice(0, 10);
const future = (d) => {
  const x = new Date();
  x.setDate(x.getDate() + d);
  return x.toISOString().slice(0, 10);
};

const ITEMS_KEY = "demo_items_v1";
const PROJECTS_KEY = "demo_projects_v1";

function seedItems() {
  const di1 = uid();
  return [
    { id: uid(), title: "User needs & intended use", phase: "concept", status: "done", risk: "low", owner: "PM", start: today(), due: future(10), projectId: "default", notes: "Define who the device is for.", checklist: [], tracesTo: [] },
    { id: di1, title: "Design input requirements (DIR)", phase: "design_input", status: "in_progress", risk: "med", owner: "Eng", start: today(), due: future(30), projectId: "default", notes: "", checklist: [{ text: "Draft requirements", done: true }, { text: "Internal review", done: false }], tracesTo: [] },
    { id: uid(), title: "Risk management plan (ISO 14971)", phase: "design_input", status: "in_progress", risk: "high", owner: "QA", start: today(), due: future(35), projectId: "default", notes: "", checklist: [], tracesTo: [] },
    { id: uid(), title: "Mechanical design outputs (CAD)", phase: "design_output", status: "backlog", risk: "med", owner: "Eng", start: future(30), due: future(60), projectId: "default", notes: "", checklist: [], tracesTo: [di1] },
    { id: uid(), title: "V&V test protocols", phase: "vv", status: "backlog", risk: "med", owner: "QA", start: future(60), due: future(90), projectId: "default", notes: "", checklist: [], tracesTo: [di1] },
    { id: uid(), title: "510(k) submission package", phase: "regulatory", status: "backlog", risk: "high", owner: "RA", start: future(120), due: future(160), projectId: "default", notes: "", checklist: [], tracesTo: [] },
  ];
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
  return val;
}

function getAllItems() {
  let items = read(ITEMS_KEY, null);
  if (!items) items = write(ITEMS_KEY, seedItems());
  return items;
}
function getAllProjects() {
  let projects = read(PROJECTS_KEY, null);
  if (!projects) projects = write(PROJECTS_KEY, [{ id: "default", name: "Sample: Infusion Pump", createdAt: new Date().toISOString() }]);
  return projects;
}

const delay = (v) => new Promise((res) => setTimeout(() => res(v), 120));

export const demoApi = {
  getItems: (projectId) => {
    const items = getAllItems();
    return delay(projectId ? items.filter((i) => (i.projectId || "default") === projectId) : items);
  },
  createItem: (item) => {
    const items = getAllItems();
    const created = { id: uid(), status: "backlog", risk: "med", owner: "Unassigned", start: today(), due: today(), notes: "", checklist: [], tracesTo: [], projectId: "default", ...item };
    write(ITEMS_KEY, [...items, created]);
    return delay(created);
  },
  updateItem: (id, patch) => {
    const items = getAllItems().map((i) => (i.id === id ? { ...i, ...patch, id } : i));
    write(ITEMS_KEY, items);
    return delay(items.find((i) => i.id === id));
  },
  deleteItem: (id) => {
    write(ITEMS_KEY, getAllItems().filter((i) => i.id !== id));
    return delay(null);
  },
  getProjects: () => delay(getAllProjects()),
  createProject: (name) => {
    const project = { id: uid(), name, createdAt: new Date().toISOString() };
    write(PROJECTS_KEY, [...getAllProjects(), project]);
    return delay(project);
  },
  renameProject: (id, name) => {
    const projects = getAllProjects().map((p) => (p.id === id ? { ...p, name } : p));
    write(PROJECTS_KEY, projects);
    return delay(projects.find((p) => p.id === id));
  },

  // --- Canned AI (the real version uses a live model) ---
  generate: () =>
    delay({
      suggestions: [
        { title: "Biocompatibility testing (ISO 10993)", phase: "vv", risk: "high", owner: "RA", duration_days: 30 },
        { title: "Design FMEA (DFMEA)", phase: "design_output", risk: "med", owner: "Eng", duration_days: 21 },
        { title: "Process validation (IQ/OQ/PQ)", phase: "transfer", risk: "med", owner: "Mfg", duration_days: 28 },
      ].map((s) => ({ ...s, status: "backlog", start: today(), due: future(s.duration_days) })),
    }),
  analyze: () =>
    delay({
      analysis:
        "Demo summary: Two design-input items are in progress, including a high-risk ISO 14971 risk management plan that should be prioritized. Design output and V&V work is still in backlog — start the mechanical CAD outputs to keep the schedule moving. The 510(k) submission is the long pole and depends on completed V&V.\n\n(This is a sample response. The full version generates a live analysis of your real project via an AI model.)",
    }),
  coach: (question) =>
    delay({
      answer:
        `Great question${question ? "" : ""}! Here's the idea: in medical device development, every step traces back to "design controls" (the FDA's required, documented design process). Design inputs are your testable requirements; design outputs are what you build; verification and validation prove they work.\n\n(This is a sample answer. The full version of ClearPath QMS answers any question with a live AI coach grounded in your specific project.)`,
    }),
};
