# Agent module

This is the part that makes the tool "agentic" rather than just "has an AI button."

`scheduler.js` runs `analyzeProject()` on a cron schedule (default: weekday mornings) without
any user interaction. It's the same analysis logic used by the manual "Analyze project" button
in the UI — the difference is *when* it runs and *what happens with the result*.

## How it delivers findings

Controlled by `AGENT_WEBHOOK_URL` in `.env`:

- **Unset (default):** writes to `server/data/agent-log.json`, one entry per run. Good for testing.
- **Set to a Slack incoming webhook URL:** posts the analysis as a Slack message.
- **Set to any other webhook URL:** POSTs `{ "text": "<analysis>" }` as JSON — works with most
  webhook-based integrations (Discord, Teams via connector, generic automation tools).

## Turning it on

```bash
ENABLE_AGENT=true npm run dev
```

Or set `ENABLE_AGENT=true` permanently in `.env`.

## Autonomous mode (tool-use loop)

Set `AGENT_AUTONOMOUS=true` in `.env` to enable. In this mode the agent runs a full
tool-use loop: Claude receives the current board, decides what changes to make, calls
`create_item` and `update_item` tools, sees the results, and continues until it stops
calling tools. The loop is capped at 10 turns to prevent runaway API usage.

Each run logs an entry with the list of `actions` taken and a plain-text `summary`.
The summary is also sent to `AGENT_WEBHOOK_URL` if set.

Without `AGENT_AUTONOMOUS=true` the scheduler falls back to read-only reporting
(original behaviour).
