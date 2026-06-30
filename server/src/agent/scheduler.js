import cron from "node-cron";
import { writeFile, readFile, access } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import { analyzeProject, agentMaintainProject } from "../ai.js";
import { getItems, addItem, updateItem } from "../store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_FILE = path.join(__dirname, "../../data/agent-log.json");

async function appendLog(entry) {
  let log = [];
  try {
    await access(LOG_FILE);
    log = JSON.parse(await readFile(LOG_FILE, "utf-8"));
  } catch {
    log = [];
  }
  log.unshift(entry);
  await writeFile(LOG_FILE, JSON.stringify(log.slice(0, 50), null, 2));
}

async function deliver(analysis) {
  const webhookUrl = process.env.AGENT_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("[agent] No AGENT_WEBHOOK_URL set, logging only.");
    return;
  }
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: analysis }),
    });
    console.log("[agent] Delivered analysis to webhook.");
  } catch (err) {
    console.error("[agent] Failed to deliver to webhook:", err.message);
  }
}

export async function runAgentScan() {
  console.log("[agent] Running scheduled project scan...");
  try {
    const items = await getItems();

    // Agentic mode: Claude can create/update items autonomously
    if (process.env.AGENT_AUTONOMOUS === "true") {
      console.log("[agent] Autonomous mode — agent may modify the board.");
      // Tag every store mutation made by the agent as actor "agent" in the audit trail.
      const { actions, summary } = await agentMaintainProject(items, {
        addItem: (item) => addItem(item, "agent"),
        updateItem: (id, patch) => updateItem(id, patch, "agent"),
      });
      const entry = {
        timestamp: new Date().toISOString(),
        mode: "autonomous",
        itemCount: items.length,
        actions,
        summary,
      };
      await appendLog(entry);
      await deliver(summary || "(no summary)");
      console.log(`[agent] Autonomous scan complete. Actions taken: ${actions.length}`);
      return;
    }

    // Read-only reporting mode
    const analysis = await analyzeProject(items);
    await appendLog({ timestamp: new Date().toISOString(), mode: "report", itemCount: items.length, analysis });
    await deliver(analysis);
    console.log("[agent] Scan complete.");
  } catch (err) {
    console.error("[agent] Scan failed:", err.message);
  }
}

export function startAgentScheduler() {
  const schedule = process.env.AGENT_SCHEDULE || "0 8 * * 1-5";
  console.log(`[agent] Scheduler enabled. Cron: "${schedule}"`);
  cron.schedule(schedule, runAgentScan);
}
