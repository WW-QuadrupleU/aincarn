export type WorkspaceFile = {
  path: string
  size: number
  modifiedAt: string
}

export type WorkspaceSummary = {
  root: string
  name: string
  files: WorkspaceFile[]
  ignoredCount: number
  packageScripts: string[]
}

export type AgentPlan = {
  title: string
  summary: string
  steps: Array<{
    title: string
    detail: string
    risk: 'low' | 'medium' | 'high'
  }>
  suggestedCommands: string[]
  candidateFiles: string[]
}

export type CommandResult = {
  command: string
  exitCode: number | null
  stdout: string
  stderr: string
}

export type AgentApi = {
  selectWorkspace: () => Promise<WorkspaceSummary | null>
  getWorkspace: () => Promise<WorkspaceSummary | null>
  generatePlan: (task: string) => Promise<AgentPlan>
  runCommand: (command: string, approved: boolean) => Promise<CommandResult>
}
