# Aincarn Agent Desktop MVP

This is the first desktop shell for Aincarn Agent.

The MVP is intentionally conservative:

- The renderer has no direct Node.js access.
- Local operations are exposed through a narrow preload API.
- Workspace access starts from an explicit folder picker.
- Shell commands require an allowlisted command and explicit user approval.
- Optional API trial mode calls the Aincarn Vercel proxy when `AINCARN_AGENT_API_TOKEN` is set. The OpenAI key stays on Vercel and is never stored in the desktop app.

## Local Development

```bash
cd desktop
npm install
npm run dev
```

## Optional Low-cost API Trial

PowerShell example:

```powershell
$env:AINCARN_AGENT_PROXY_URL="https://aincarn.com/api/agent/plan"
$env:AINCARN_AGENT_API_TOKEN="your-vercel-side-agent-token"
$env:AINCARN_AGENT_MODEL="gpt-5-mini"
npm run dev
```

The current proxy sends only a compact workspace summary, candidate file paths, package scripts, and the user's task. It does not send full repository contents. If the proxy token is missing or the proxy fails, the app falls back to the local planner.

Required Vercel environment variables:

- `OPENAI_API_KEY`: provider key stored only on Vercel.
- `AINCARN_AGENT_API_TOKEN`: shared secret required by the desktop app.
- `AINCARN_AGENT_TOKEN_TIER`: optional `free`, `light`, `pro`, `power`, or `unlimited` limit for token-based desktop access.
- `AINCARN_AGENT_MODEL`: optional default model, currently `gpt-5-mini`.

## MVP Flow

1. Open a local project folder.
2. Inspect a safe repository summary.
3. Enter a development task.
4. Generate a local execution plan.
5. Run allowlisted commands only after approval.

## Safety Notes

The local agent should not send secrets or full repositories to cloud models by default. Future AI calls should pass only selected files, summaries, diffs, and redacted logs.
