// Offline test of the agentic loop — NO API key required.
// Injects a fake Anthropic client that returns scripted tool_use blocks,
// then verifies the loop executes them against an in-memory store and
// terminates correctly.
import { agentMaintainProject, __setClientForTest } from "../ai.js";

// --- In-memory store stand-in (mirrors store.js signatures) ---
const board = [
  { id: "a1b2c6", title: "Risk management plan (ISO 14971)", phase: "design_input", status: "backlog", risk: "med", owner: "QA", start: "2026-05-25", due: "2026-06-24" },
];
const addItem = async (item) => { board.push(item); return item; };
const updateItem = async (id, patch) => {
  const idx = board.findIndex((i) => i.id === id);
  if (idx === -1) return null;
  board[idx] = { ...board[idx], ...patch, id };
  return board[idx];
};

// --- Fake Claude: turn 1 calls both tools, turn 2 returns a text summary ---
let turn = 0;
const fakeClient = {
  messages: {
    create: async () => {
      turn++;
      if (turn === 1) {
        return {
          stop_reason: "tool_use",
          content: [
            { type: "text", text: "Reviewing the board." },
            { type: "tool_use", id: "tu_1", name: "update_item", input: { id: "a1b2c6", status: "in_progress", risk: "high" } },
            { type: "tool_use", id: "tu_2", name: "create_item", input: { title: "Design FMEA review gate", phase: "design_output", risk: "med", owner: "Eng", due: "2026-07-15" } },
            { type: "tool_use", id: "tu_3", name: "update_item", input: { id: "does-not-exist", status: "done" } },
          ],
        };
      }
      return {
        stop_reason: "end_turn",
        content: [{ type: "text", text: "Escalated the risk management plan to high/in-progress and added a Design FMEA review gate." }],
      };
    },
  },
};

__setClientForTest(fakeClient);

console.log("Board before:", board.length, "item(s)");
const result = await agentMaintainProject(board, { addItem, updateItem });

console.log("\n--- RESULT ---");
console.log("Actions:", JSON.stringify(result.actions, null, 2));
console.log("Summary:", result.summary);
console.log("Board after:", board.length, "item(s)");

// --- Assertions ---
const errors = [];
if (turn !== 2) errors.push(`Expected loop to run 2 turns, ran ${turn}`);
if (board.length !== 2) errors.push(`Expected 2 items after create, got ${board.length}`);
const updated = board.find((i) => i.id === "a1b2c6");
if (updated.status !== "in_progress" || updated.risk !== "high") errors.push("update_item did not apply patch");
if (result.actions.filter((a) => a.action === "created").length !== 1) errors.push("create action not recorded");
if (result.actions.filter((a) => a.action === "updated").length !== 1) errors.push("update action not recorded (the bad-id update should NOT be recorded)");
if (!result.summary.includes("Design FMEA")) errors.push("final summary not captured");

if (errors.length) {
  console.error("\n❌ FAILED:\n" + errors.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}
console.log("\n✅ All assertions passed — the agentic loop works end-to-end (mocked API).");
