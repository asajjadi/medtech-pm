import { Router } from "express";
import { getItems, addItem, updateItem, deleteItem } from "../store.js";
import { uid } from "../constants.js";
import { DEFAULT_PROJECT_ID } from "../projects.js";

const router = Router();

// Identify the acting user for the audit trail. Until real auth is in place,
// the client sends an X-User header; fall back to "anonymous".
function actorOf(req) {
  return (req.get("X-User") || "anonymous").slice(0, 64);
}

// An item belongs to a project if its projectId matches. Legacy items with no
// projectId are treated as belonging to the default project.
function inProject(item, projectId) {
  return (item.projectId || DEFAULT_PROJECT_ID) === projectId;
}

router.get("/", async (req, res) => {
  const items = await getItems();
  const projectId = req.query.projectId;
  res.json(projectId ? items.filter((i) => inProject(i, projectId)) : items);
});

router.post("/", async (req, res) => {
  const body = req.body || {};
  const item = {
    id: uid(),
    title: body.title || "Untitled item",
    phase: body.phase || "concept",
    status: body.status || "backlog",
    risk: body.risk || "med",
    owner: body.owner || "Unassigned",
    start: body.start || new Date().toISOString().slice(0, 10),
    due: body.due || new Date().toISOString().slice(0, 10),
    projectId: body.projectId || DEFAULT_PROJECT_ID,
  };
  await addItem(item, actorOf(req));
  res.status(201).json(item);
});

router.patch("/:id", async (req, res) => {
  const updated = await updateItem(req.params.id, req.body || {}, actorOf(req));
  if (!updated) return res.status(404).json({ error: "Item not found" });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const ok = await deleteItem(req.params.id, actorOf(req));
  if (!ok) return res.status(404).json({ error: "Item not found" });
  res.status(204).end();
});

export default router;
