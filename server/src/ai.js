// Provider dispatcher. Select the LLM backend with LLM_PROVIDER in .env:
//   - "anthropic" (default) — Claude API, needs ANTHROPIC_API_KEY (paid)
//   - "ollama"              — local open model, free, needs Ollama running
import * as anthropic from "./providers/anthropic.js";
import * as ollama from "./providers/ollama.js";

function active() {
  const name = (process.env.LLM_PROVIDER || "anthropic").toLowerCase();
  if (name === "ollama") return ollama;
  return anthropic;
}

export function generateItems(prompt) {
  return active().generateItems(prompt);
}

export function analyzeProject(items) {
  return active().analyzeProject(items);
}

export function coach(question, items) {
  return active().coach(question, items);
}

export function agentMaintainProject(items, store) {
  return active().agentMaintainProject(items, store);
}

// Test seam — only the Anthropic provider supports an injected fake client.
export function __setClientForTest(fake) {
  return anthropic.__setClientForTest(fake);
}
