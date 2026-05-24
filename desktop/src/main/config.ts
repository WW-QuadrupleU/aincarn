import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { AgentConnection, AgentDeviceLogin } from '../shared/types'

const DEFAULT_PROXY_URL = 'https://aincarn.com/api/agent/plan'

type StoredConfig = AgentConnection

function configPath() {
  return join(app.getPath('userData'), 'agent-connection.json')
}

function readConfig(): StoredConfig {
  try {
    const file = configPath()
    if (!existsSync(file)) return createDefaultConfig()
    const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<StoredConfig>
    return {
      proxyUrl: String(parsed.proxyUrl || process.env.AINCARN_AGENT_PROXY_URL || DEFAULT_PROXY_URL),
      token: String(parsed.token || process.env.AINCARN_AGENT_API_TOKEN || ''),
      deviceId: String(parsed.deviceId || crypto.randomUUID()),
      deviceName: String(parsed.deviceName || process.env.COMPUTERNAME || process.env.HOSTNAME || 'Desktop'),
    }
  } catch {
    return createDefaultConfig()
  }
}

function createDefaultConfig(): StoredConfig {
  return {
    proxyUrl: process.env.AINCARN_AGENT_PROXY_URL || DEFAULT_PROXY_URL,
    token: process.env.AINCARN_AGENT_API_TOKEN || '',
    deviceId: crypto.randomUUID(),
    deviceName: process.env.COMPUTERNAME || process.env.HOSTNAME || 'Desktop',
  }
}

export function getAgentConnection(): AgentConnection {
  const config = readConfig()
  if (!existsSync(configPath()) || !config.deviceId) saveAgentConnection(config)
  return config
}

export function saveAgentConnection(input: Partial<AgentConnection>): AgentConnection {
  const current = readConfig()
  const next: AgentConnection = {
    proxyUrl: String(input.proxyUrl || current.proxyUrl || DEFAULT_PROXY_URL),
    token: String(input.token ?? current.token ?? ''),
    deviceId: String(input.deviceId || current.deviceId || crypto.randomUUID()),
    deviceName: String(input.deviceName || current.deviceName || 'Desktop'),
  }
  const file = configPath()
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(next, null, 2), 'utf8')
  return next
}

function agentApiBase(connection: AgentConnection) {
  return connection.proxyUrl.replace(/\/api\/agent\/plan$/, '')
}

export async function startAgentDeviceLogin(): Promise<AgentDeviceLogin> {
  const connection = getAgentConnection()
  const response = await fetch(`${agentApiBase(connection)}/api/agent/device/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceId: connection.deviceId,
      deviceName: connection.deviceName,
    }),
  })
  const data = await response.json().catch(() => null) as AgentDeviceLogin & { error?: string } | null
  if (!response.ok || !data) throw new Error(data?.error || `Login start failed: ${response.status}`)
  return data
}

export async function pollAgentDeviceLogin(deviceCode: string) {
  const connection = getAgentConnection()
  const response = await fetch(`${agentApiBase(connection)}/api/agent/device/poll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      deviceCode,
      deviceId: connection.deviceId,
    }),
  })
  const data = await response.json().catch(() => null) as { status?: string; token?: string; error?: string } | null
  if (!response.ok || !data) throw new Error(data?.error || `Login poll failed: ${response.status}`)
  if (data.status === 'approved' && data.token) {
    saveAgentConnection({ token: data.token })
  }
  return { status: data.status || 'unknown', token: data.token }
}
