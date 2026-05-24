import { contextBridge, ipcRenderer } from 'electron'
import type { AgentApi } from '../shared/types'

const api: AgentApi = {
  selectWorkspace: () => ipcRenderer.invoke('workspace:select'),
  getWorkspace: () => ipcRenderer.invoke('workspace:get'),
  getAgentConnection: () => ipcRenderer.invoke('agent:connection:get'),
  saveAgentConnection: (connection) => ipcRenderer.invoke('agent:connection:save', connection),
  generatePlan: (task) => ipcRenderer.invoke('agent:plan', task),
  runCommand: (command, approved) => ipcRenderer.invoke('command:run', command, approved)
}

contextBridge.exposeInMainWorld('aincarn', api)
