# Aincarn Agent Desktop MVP

This is the first desktop shell for Aincarn Agent.

The MVP is intentionally conservative:

- The renderer has no direct Node.js access.
- Local operations are exposed through a narrow preload API.
- Workspace access starts from an explicit folder picker.
- Shell commands require an allowlisted command and explicit user approval.
- AI execution is currently a local planning stub. Provider routing can be added after the safety layer is stable.

## Local Development

```bash
cd desktop
npm install
npm run dev
```

## MVP Flow

1. Open a local project folder.
2. Inspect a safe repository summary.
3. Enter a development task.
4. Generate a local execution plan.
5. Run allowlisted commands only after approval.

## Safety Notes

The local agent should not send secrets or full repositories to cloud models by default. Future AI calls should pass only selected files, summaries, diffs, and redacted logs.
