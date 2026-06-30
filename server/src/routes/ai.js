import { Router } from "express";
import { generateItems, analyzeProject, coach } from "../ai.js";
import { getItems, addItem } from "../store.js";

const router = Router();

router.post("/generate", async (req, res) => {
  const prompt = (req.body && req.body.prompt) || "";
  if (!prompt.trim()) {
    return res.status(400).json({ error: "prompt is required" });
  }
  try {
    const suggestions = await generateItems(prompt);
    res.json({ suggestions });
  } catch (err) {
    console.error("generate error:", err.message);
    res.status(500).json({ error: "Couldn't generate items. Try rephrasing the request." });
  }
});

router.post("/generate/accept", async (req, res) => {
  const item = req.body;
  if (!item || !item.id) return res.status(400).json({ error: "item is required" });
  const actor = (req.get("X-User") || "anonymous").slice(0, 64);
  await addItem(item, `${actor} (AI-assisted)`);
  res.status(201).json(item);
});

router.post("/coach", async (req, res) => {
  const question = (req.body && req.body.question) || "";
  if (!question.trim()) return res.status(400).json({ error: "question is required" });
  try {
    const items = await getItems();
    const answer = await coach(question, items);
    res.json({ answer });
  } catch (err) {
    console.error("coach error:", err.message);
    res.status(500).json({ error: "The coach couldn't answer right now. Try again." });
  }
});

router.post("/analyze", async (req, res) => {
  try {
    const items = await getItems();
    const analysis = await analyzeProject(items);
    res.json({ analysis });
  } catch (err) {
    console.error("analyze error:", err.message);
    res.status(500).json({ error: "Couldn't analyze the project right now." });
  }
});

export default router;
