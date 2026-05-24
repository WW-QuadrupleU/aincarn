import { app } from 'electron'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import type { AgentConnection } from '../shared/types'

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
