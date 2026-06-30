// Shared agent tool definitions + execution logic, used by every LLM provider.
import { PHASE_IDS, RISKS, STATUSES, uid } from "./constants.js";

// Tool schemas in Anthropic shape (input_schema). Providers that need the
// OpenAI/Ollama shape convert this at call time.
export const AGENT_TOOLS = [
  {
    name: "create_item",
    description: "Add a new tracked item to the project board.",
    input_schema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Short, specific task title" },
        phase: { type: "string", enum: PHASE_IDS },
        risk: { type: "string", enum: RISKS },
        owner: { type: "string", description: "Short role: Eng, QA, RA, Mfg, etc." },
        due: { type: "string", description: "ISO date YYYY-MM-DD" },
      },
      required: ["title", "phase", "risk", "owner", "due"],
    },
  },
  {
    name: "update_item",
    description: "Update an existing item's status, risk, owner, or due date.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Item id to update" },
        status: { type: "string", enum: STATUSES },
        risk: { type: "string", enum: RISKS },
        owner: { type: "string" },
        due: { type: "string", description: "ISO date YYYY-MM-DD" },
      },
      required: ["id"],
    },
  },
];

// Execute one tool call against the store. Returns { result, action } where
// `result` is fed back to the model and `action` (or null) is logged.
export async function executeTool(name, input, { today, addItem, updateItem }) {
  try {
    if (name === "create_item") {
      const item = await addItem({
        id: uid(),
        title: input.title,
        phase: PHASE_IDS.includes(input.phase) ? input.phase : "design_input",
        status: "backlog",
        risk: RISKS.includes(input.risk) ? input.risk : "med",
        owner: input.owner || "Eng",
        start: today,
        due: input.due,
      });
      return { result: { ok: true, id: item.id }, action: { action: "created", id: item.id, title: item.title } };
    }
    if (name === "update_item") {
      const { id, ...patch } = input;
      const updated = await updateItem(id, patch);
      if (!updated) return { result: { ok: false, error: "Item not found" }, action: null };
      return { result: { ok: true }, action: { action: "updated", id, patch } };
    }
    return { result: { ok: false, error: "Unknown tool" }, action: null };
  } catch (err) {
    return { result: { ok: false, error: err.message }, action: null };
  }
}

// Tolerant JSON parse for model output that may include fences or wrap an array.
export function parseItemsLoose(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.items)) return parsed.items;
  throw new Error("Expected a JSON array of items");
}
