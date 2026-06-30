// One-off agent run for testing — does NOT start the web server or the cron.
// Usage: npm run agent:once   (forces autonomous mode for the run)
import "dotenv/config";
import { runAgentScan } from "./scheduler.js";

process.env.AGENT_AUTONOMOUS = process.env.AGENT_AUTONOMOUS || "true";

console.log(`[agent] One-off run. Autonomous=${process.env.AGENT_AUTONOMOUS}`);
await runAgentScan();
console.log("[agent] Done. See server/data/agent-log.json for the logged result.");
