# AI Agent Governance Boundary

## Purpose
ClearPath may use AI to summarize project context, suggest next actions, and support learning. AI output is advisory.

## Required safeguards
- AI does not establish regulatory compliance, release a product, or make clinical decisions.
- Autonomous mode must be explicitly enabled and limited to a defined project scope.
- Any change to a regulated record requires authenticated human review and approval before becoming an approved record.
- Every suggested or executed action must be logged with time, scope, rationale, and before/after values.
- Secrets, patient data, client data, and proprietary records must not be included in model prompts unless an approved controlled deployment explicitly permits it.
- External webhooks are optional integrations and must be allowlisted, authenticated, and reviewed before production use.

## Portfolio note
The public portfolio demonstration is read-only and synthetic. It does not expose this implementation or connect to an AI provider.
