import "dotenv/config";
import express from "express";
import cors from "cors";
import itemsRouter from "./routes/items.js";
import aiRouter from "./routes/ai.js";
import auditRouter from "./routes/audit.js";
import projectsRouter from "./routes/projects.js";
import { startAgentScheduler, runAgentScan } from "./agent/scheduler.js";

// Safety net: never let a stray async error crash the whole server.
process.on("unhandledRejection", (err) => {
  console.error("[server] Unhandled rejection:", err);
});
process.on("uncaughtException", (err) => {
  console.error("[server] Uncaught exception:", err);
});

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/items", itemsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/audit", auditRouter);
app.use("/api/projects", projectsRouter);

app.post("/api/agent/run-now", async (req, res) => {
  await runAgentScan();
  res.json({ ok: true, message: "Agent scan triggered. Check server/data/agent-log.json." });
});

app.get("/api/health", (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`medtech-pm server listening on http://localhost:${PORT}`);
  if (process.env.ENABLE_AGENT === "true") {
    startAgentScheduler();
  } else {
    console.log('[agent] Disabled. Set ENABLE_AGENT=true to enable scheduled scans.');
  }
});
