// Anthropic (Claude) provider. Requires ANTHROPIC_API_KEY.
import Anthropic from "@anthropic-ai/sdk";
import { PHASE_IDS, RISKS, uid } from "../constants.js";
import { AGENT_TOOLS, executeTool, parseItemsLoose } from "../agent-tools.js";

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not set. Copy server/.env.example to server/.env and add your key.");
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

// Test seam: inject a fake client (e.g. for offline tests without an API key).
export function __setClientForTest(fake) {
  client = fake;
}

const MODEL = "claude-sonnet-4-6";

export async function generateItems(prompt) {
  const system = `You generate task items for a medical device development project tracker. Respond ONLY with a JSON array, no preamble, no markdown fences. Each item: {"title": string, "phase": one of [${PHASE_IDS.join(
    ", "
  )}], "risk": one of ["low","med","high"], "owner": short role like "Eng","QA","RA","Mfg", "duration_days": integer}. Generate 3-8 relevant items. Titles should be specific and realistic for regulated medical device development (referencing standards like ISO 13485, ISO 14971, ISO 10993, IEC 62304, FDA design controls where relevant).`;

  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1000,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
  const raw = parseItemsLoose(text);

  const today = new Date();
  return raw.map((it) => {
    const due = new Date(today);
    due.setDate(due.getDate() + (it.duration_days || 14));
    return {
      id: uid(),
      title: it.title,
      phase: PHASE_IDS.includes(it.phase) ? it.phase : "design_input",
      status: "backlog",
      risk: RISKS.includes(it.risk) ? it.risk : "med",
      owner: it.owner || "Eng",
      start: today.toISOString().slice(0, 10),
      due: due.toISOString().slice(0, 10),
    };
  });
}

export async function analyzeProject(items) {
  const today = new Date().toISOString().slice(0, 10);
  const summary = items
    .map(
      (i) =>
        `- [${i.phase}] ${i.title} | status: ${i.status} | risk: ${i.risk} | owner: ${i.owner} | due: ${i.due}`
    )
    .join("\n");

  const system = `You are a medical device program management assistant. Given a list of project items, write a concise status analysis in plain text (no markdown headers, no bullet symbols, short paragraphs or simple dashes). Cover: overdue or at-risk items, phase bottlenecks, risk concentration, and 2-3 concrete next actions. Keep it under 180 words. Today's date is ${today}.`;

  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 600,
    system,
    messages: [{ role: "user", content: `Project items:\n${summary || "(no items yet)"}` }],
  });

  return msg.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
}

export async function coach(question, items) {
  const today = new Date().toISOString().slice(0, 10);
  const summary = items
    .map((i) => `- [${i.phase}] ${i.title} (status: ${i.status}, risk: ${i.risk}, owner: ${i.owner})`)
    .join("\n");

  const system = `You are a friendly mentor coaching someone who is new to medical device development but has general project-management experience. Today is ${today}.
Explain things in plain language. Always define jargon the first time you use it (e.g. "design input (the documented requirements your device must meet)"). When relevant, mention the standard or regulation involved (ISO 13485 for quality systems, ISO 14971 for risk management, IEC 62304 for software, FDA design controls / 21 CFR 820.30, 510(k) for US clearance) and say in one line why it matters. Be encouraging and concrete. Keep answers under 200 words. If the question is about what to do next, ground your advice in their actual project items below.`;

  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 700,
    system,
    messages: [
      { role: "user", content: `My current project:\n${summary || "(no items yet — I'm just starting)"}\n\nQuestion: ${question}` },
    ],
  });

  return msg.content.map((b) => (b.type === "text" ? b.text : "")).join("\n");
}

export async function agentMaintainProject(items, { addItem, updateItem }) {
  const today = new Date().toISOString().slice(0, 10);
  const summary = items
    .map(
      (i) =>
        `id:${i.id} [${i.phase}] ${i.title} | status:${i.status} | risk:${i.risk} | owner:${i.owner} | due:${i.due}`
    )
    .join("\n");

  const system = `You are an autonomous medical device program management agent. Today is ${today}.
Your job: review the project board and keep it healthy. You may call create_item to add missing standard tasks and update_item to correct statuses, escalate risks, or adjust owners. Be conservative — only make changes that are clearly beneficial. After taking all needed actions, write a brief plain-text summary (under 120 words) of what you did and why.`;

  const messages = [
    {
      role: "user",
      content: `Current project items:\n${summary || "(no items yet)"}\n\nReview and maintain the board.`,
    },
  ];

  const actions = [];
  let finalSummary = "";

  // Agentic loop — run until Claude stops calling tools
  for (let turn = 0; turn < 10; turn++) {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: 2000,
      tools: AGENT_TOOLS,
      system,
      messages,
    });

    messages.push({ role: "assistant", content: response.content });

    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const textBlocks = response.content.filter((b) => b.type === "text");

    if (textBlocks.length) {
      finalSummary = textBlocks.map((b) => b.text).join("\n");
    }

    if (response.stop_reason !== "tool_use" || toolUseBlocks.length === 0) {
      break;
    }

    const toolResults = [];
    for (const block of toolUseBlocks) {
      const { result, action } = await executeTool(block.name, block.input, { today, addItem, updateItem });
      if (action) actions.push(action);
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
    }

    messages.push({ role: "user", content: toolResults });
  }

  return { actions, summary: finalSummary };
}
