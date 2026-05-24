export const allowedCommands = [
  'git status --short',
  'git diff --',
  'git log -1 --oneline',
  'npm run build',
  'npm run lint',
  'npm test',
  'npm run test'
] as const

export type AllowedCommand = (typeof allowedCommands)[number]

export function isAllowedCommand(command: string): command is AllowedCommand {
  return allowedCommands.includes(command.trim() as AllowedCommand)
}
