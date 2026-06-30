import { Router } from "express";
import { getProjects, addProject, renameProject } from "../projects.js";

const router = Router();

router.get("/", async (req, res) => {
  res.json(await getProjects());
});

router.post("/", async (req, res) => {
  const name = (req.body && req.body.name) || "";
  if (!name.trim()) return res.status(400).json({ error: "name is required" });
  const project = await addProject(name.trim());
  res.status(201).json(project);
});

router.patch("/:id", async (req, res) => {
  const name = (req.body && req.body.name) || "";
  const updated = await renameProject(req.params.id, name.trim());
  if (!updated) return res.status(404).json({ error: "Project not found" });
  res.json(updated);
});

export default router;
