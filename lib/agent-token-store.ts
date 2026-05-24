import { createHash, randomBytes, randomUUID } from 'node:crypto'
import { neon } from '@neondatabase/serverless'

type SqlClient = ReturnType<typeof neon>

let sqlClient: SqlClient | null = null
let schemaReady = false

export type SavedAgentToken = {
  id: string
  userId: string
  label: string
  deviceId: string
  deviceName: string
  status: 'active' | 'revoked'
  lastUsedAt: string | null
  createdAt: string
  revokedAt: string | null
}

export type CreatedAgentToken = {
  token: string
  record: SavedAgentToken
}

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL
}

export function hasAgentTokenDatabase() {
  return Boolean(getDatabaseUrl())
}

function getSql() {
  const url = getDatabaseUrl()
  if (!url) throw new Error('DATABASE_URL is not configured')
  if (!sqlClient) sqlClient = neon(url)
  return sqlClient
}

function queryRows(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? (value as Array<Record<string, unknown>>) : []
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

function rowToToken(row: Record<string, unknown>): SavedAgentToken {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    label: String(row.label || 'Desktop'),
    deviceId: row.device_id ? String(row.device_id) : '',
    deviceName: row.device_name ? String(row.device_name) : '',
    status: String(row.status) === 'revoked' ? 'revoked' : 'active',
    lastUsedAt: row.last_used_at ? new Date(String(row.last_used_at)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    revokedAt: row.revoked_at ? new Date(String(row.revoked_at)).toISOString() : null,
  }
}

async function ensureAgentTokenSchema() {
  if (schemaReady) return
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS aincarn_agent_tokens (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      token_hash text NOT NULL UNIQUE,
      label text NOT NULL,
      device_id text,
      device_name text,
      status text NOT NULL DEFAULT 'active',
      last_used_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      revoked_at timestamptz
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS aincarn_agent_tokens_user_idx
    ON aincarn_agent_tokens (user_id, status, created_at DESC)
  `
  schemaReady = true
}

export async function createAgentToken(input: {
  userId: string
  label?: string
  deviceName?: string
}): Promise<CreatedAgentToken> {
  await ensureAgentTokenSchema()
  const sql = getSql()
  const token = `aincarn_desktop_${randomBytes(32).toString('base64url')}`
  const rows = await sql`
    INSERT INTO aincarn_agent_tokens (
      id, user_id, token_hash, label, device_name
    )
    VALUES (
      ${randomUUID()},
      ${input.userId},
      ${hashToken(token)},
      ${String(input.label || 'Desktop').slice(0, 80)},
      ${String(input.deviceName || '').slice(0, 120) || null}
    )
    RETURNING *
  `
  return { token, record: rowToToken(queryRows(rows)[0]) }
}

export async function listAgentTokens(userId: string) {
  await ensureAgentTokenSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT *
    FROM aincarn_agent_tokens
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `
  return queryRows(rows).map(rowToToken)
}

export async function revokeAgentToken(userId: string, tokenId: string) {
  await ensureAgentTokenSchema()
  const sql = getSql()
  const rows = await sql`
    UPDATE aincarn_agent_tokens
    SET status = 'revoked', revoked_at = now()
    WHERE user_id = ${userId} AND id = ${tokenId}
    RETURNING *
  `
  const row = queryRows(rows)[0]
  return row ? rowToToken(row) : null
}

export async function validateAgentToken(input: {
  token: string
  deviceId: string
  deviceName?: string
}) {
  await ensureAgentTokenSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT *
    FROM aincarn_agent_tokens
    WHERE token_hash = ${hashToken(input.token)} AND status = 'active'
    LIMIT 1
  `
  const row = queryRows(rows)[0]
  if (!row) return null

  const existingDeviceId = row.device_id ? String(row.device_id) : ''
  if (existingDeviceId && existingDeviceId !== input.deviceId) {
    throw new Error('This desktop token is already bound to another device')
  }

  const updated = await sql`
    UPDATE aincarn_agent_tokens
    SET
      device_id = COALESCE(device_id, ${input.deviceId}),
      device_name = COALESCE(device_name, ${String(input.deviceName || '').slice(0, 120) || null}),
      last_used_at = now()
    WHERE id = ${String(row.id)}
    RETURNING *
  `
  return rowToToken(queryRows(updated)[0])
}
