# Aincarn Agent Desktop MVP

This is the first desktop shell for Aincarn Agent.

The MVP is intentionally conservative:

- The renderer has no direct Node.js access.
- Local operations are exposed through a narrow preload API.
- Workspace access starts from an explicit folder picker.
- Shell commands require an allowlisted command and explicit user approval.
- Optional API trial mode uses `OPENAI_API_KEY` only when it is set in the local shell. Without it, the app stays in local planning mode.

## Local Development

```bash
cd desktop
npm install
npm run dev
```

## Optional Low-cost API Trial

PowerShell example:

```powershell
$env:OPENAI_API_KEY="sk-..."
$env:AINCARN_AGENT_MODEL="gpt-5-mini"
npm run dev
```

The current API trial sends only a compact workspace summary, candidate file paths, package scripts, and the user's task. It does not send full repository contents.

## MVP Flow

1. Open a local project folder.
2. Inspect a safe repository summary.
3. Enter a development task.
4. Generate a local execution plan.
5. Run allowlisted commands only after approval.

## Safety Notes

The local agent should not send secrets or full repositories to cloud models by default. Future AI calls should pass only selected files, summaries, diffs, and redacted logs.
