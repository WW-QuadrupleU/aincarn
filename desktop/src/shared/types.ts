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
  mode?: 'local' | 'ai'
  model?: string
  steps: Array<{
    title: string
    detail: string
    risk: 'low' | 'medium' | 'high'
  }>
  suggestedCommands: string[]
  candidateFiles: string[]
}

export type AgentConnection = {
  proxyUrl: string
  token: string
  deviceId: string
  deviceName: string
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
  getAgentConnection: () => Promise<AgentConnection>
  saveAgentConnection: (connection: Partial<AgentConnection>) => Promise<AgentConnection>
  generatePlan: (task: string) => Promise<AgentPlan>
  runCommand: (command: string, approved: boolean) => Promise<CommandResult>
}
