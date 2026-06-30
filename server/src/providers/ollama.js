// Ollama provider — runs a local open model. No API key, no cost, no internet.
// Requires Ollama running (https://ollama.com) with a tool-capable model pulled,
// e.g. `ollama pull llama3.1`.
import { PHASE_IDS, RISKS, uid } from "../constants.js";
import { AGENT_TOOLS, executeTool, parseItemsLoose } from "../agent-tools.js";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.1";

// Convert our Anthropic-shaped tools to Ollama's OpenAI-style function shape.
const OLLAMA_TOOLS = AGENT_TOOLS.map((t) => ({
  type: "function",
  function: { name: t.name, description: t.description, parameters: t.input_schema },
}));

async function ollamaChat({ messages, tools, format }) {
  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        ...(tools ? { tools } : {}),
        ...(format ? { format } : {}),
        stream: false,
        options: { temperature: 0.3 },
      }),
    });
  } catch (err) {
    throw new Error(
      `Cannot reach Ollama at ${OLLAMA_URL}. Is it running? (start with "ollama serve"). ${err.message}`
    );
  }
  if (!res.ok) {
    throw new Error(`Ollama ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function generateItems(prompt) {
  const system = `You generate task items for a medical device development project tracker. Respond ONLY with a JSON array, no preamble, no markdown fences. Each item: {"title": string, "phase": one of [${PHASE_IDS.join(
    ", "
  )}], "risk": one of ["low","med","high"], "owner": short role like "Eng","QA","RA","Mfg", "duration_days": integer}. Generate 3-8 relevant items. Titles should be specific and realistic for regulated medical device development (referencing standards like ISO 13485, ISO 14971, ISO 10993, IEC 62304, FDA design controls where relevant).`;

  const data = await ollamaChat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt },
    ],
    format: "json",
  });

  const raw = parseItemsLoose(data.message.content);

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

  const data = await ollamaChat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: `Project items:\n${summary || "(no items yet)"}` },
    ],
  });

  return data.message.content;
}

export async function coach(question, items) {
  const today = new Date().toISOString().slice(0, 10);
  const summary = items
    .map((i) => `- [${i.phase}] ${i.title} (status: ${i.status}, risk: ${i.risk}, owner: ${i.owner})`)
    .join("\n");

  const system = `You are a friendly mentor coaching someone who is new to medical device development but has general project-management experience. Today is ${today}.
Explain things in plain language. Always define jargon the first time you use it (e.g. "design input (the documented requirements your device must meet)"). When relevant, mention the standard or regulation involved (ISO 13485 for quality systems, ISO 14971 for risk management, IEC 62304 for software, FDA design controls / 21 CFR 820.30, 510(k) for US clearance) and say in one line why it matters. Be encouraging and concrete. Keep answers under 200 words. If the question is about what to do next, ground your advice in their actual project items below.`;

  const data = await ollamaChat({
    messages: [
      { role: "system", content: system },
      { role: "user", content: `My current project:\n${summary || "(no items yet — I'm just starting)"}\n\nQuestion: ${question}` },
    ],
  });

  return data.message.content;
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
    { role: "system", content: system },
    {
      role: "user",
      content: `Current project items:\n${summary || "(no items yet)"}\n\nReview and maintain the board.`,
    },
  ];

  const actions = [];
  let finalSummary = "";

  // Agentic loop — run until the model stops calling tools
  for (let turn = 0; turn < 10; turn++) {
    const data = await ollamaChat({ messages, tools: OLLAMA_TOOLS });
    const message = data.message;
    messages.push(message); // assistant turn (may include tool_calls)

    if (message.content) finalSummary = message.content;

    const calls = message.tool_calls || [];
    if (calls.length === 0) break;

    for (const call of calls) {
      const name = call.function?.name;
      // Ollama returns arguments already parsed as an object.
      const input = call.function?.arguments || {};
      const { result, action } = await executeTool(name, input, { today, addItem, updateItem });
      if (action) actions.push(action);
      messages.push({ role: "tool", content: JSON.stringify(result) });
    }
  }

  return { actions, summary: finalSummary };
}
