// Append-only audit trail (21 CFR Part 11 oriented).
// Every record mutation is appended as one JSON line. The file is never
// rewritten or truncated in normal operation, so history is tamper-evident.
import { appendFile, readFile, access } from "fs/promises";
import { fileURLToPath } from "url";
import path from "path";
import { uid } from "./constants.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT_FILE = path.join(__dirname, "../data/audit-log.jsonl");

// Record one audit event. `action` is "create" | "update" | "delete".
// `before`/`after` capture the record state for change tracking.
export async function appendAudit({ actor, action, itemId, before = null, after = null }) {
  const entry = {
    id: uid(),
    ts: new Date().toISOString(),
    actor: actor || "system",
    action,
    itemId,
    before,
    after,
  };
  await appendFile(AUDIT_FILE, JSON.stringify(entry) + "\n");
  return entry;
}

// Read the audit trail back as an array (newest first). Optional filter by itemId.
export async function getAudit({ itemId } = {}) {
  try {
    await access(AUDIT_FILE);
  } catch {
    return [];
  }
  const raw = await readFile(AUDIT_FILE, "utf-8");
  const entries = raw
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => JSON.parse(line));
  const filtered = itemId ? entries.filter((e) => e.itemId === itemId) : entries;
  return filtered.reverse();
}
