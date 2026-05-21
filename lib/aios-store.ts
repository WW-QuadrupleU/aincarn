import { neon } from '@neondatabase/serverless'

export type AiosProfileInput = {
  goal: string
  horizon: string
  currentState?: string
  values?: string
  constraints?: string
}

export type SavedAiosProfile = AiosProfileInput & {
  userId: string
  createdAt: string
  updatedAt: string
}

export type AiosTaskInput = {
  title: string
  reason: string
  domain: string
  impact: number
  effort: number
  dueDate?: string
  status?: 'todo' | 'doing' | 'done' | 'skipped'
}

export type SavedAiosTask = AiosTaskInput & {
  id: string
  userId: string
  status: 'todo' | 'doing' | 'done' | 'skipped'
  createdAt: string
  updatedAt: string
}

type SqlClient = ReturnType<typeof neon>

let sqlClient: SqlClient | null = null
let schemaReady = false

export function hasAiosDatabase() {
  return Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL)
}

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL
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

function rowToProfile(row: Record<string, unknown>): SavedAiosProfile {
  return {
    userId: String(row.user_id),
    goal: String(row.goal),
    horizon: String(row.horizon),
    currentState: row.current_state ? String(row.current_state) : '',
    values: row.values_text ? String(row.values_text) : '',
    constraints: row.constraints_text ? String(row.constraints_text) : '',
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

function rowToTask(row: Record<string, unknown>): SavedAiosTask {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    title: String(row.title),
    reason: String(row.reason),
    domain: String(row.domain),
    impact: Number(row.impact),
    effort: Number(row.effort),
    dueDate: row.due_date ? String(row.due_date) : '',
    status: String(row.status) as SavedAiosTask['status'],
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

export async function ensureAiosSchema() {
  if (schemaReady) return

  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS aincarn_aios_profiles (
      user_id text PRIMARY KEY,
      goal text NOT NULL,
      horizon text NOT NULL,
      current_state text,
      values_text text,
      constraints_text text,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS aincarn_aios_tasks (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      title text NOT NULL,
      reason text NOT NULL,
      domain text NOT NULL,
      impact integer NOT NULL DEFAULT 3,
      effort integer NOT NULL DEFAULT 3,
      due_date date,
      status text NOT NULL DEFAULT 'todo',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS aincarn_aios_tasks_user_idx
    ON aincarn_aios_tasks (user_id, status, due_date, updated_at)
  `

  schemaReady = true
}

export function normalizeAiosProfileInput(value: unknown): AiosProfileInput {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const goal = String(input.goal || '').trim()
  const horizon = String(input.horizon || '90日').trim()
  const currentState = String(input.currentState || '').trim()
  const values = String(input.values || '').trim()
  const constraints = String(input.constraints || '').trim()

  if (!goal) throw new Error('目標を入力してください')

  return {
    goal,
    horizon: horizon || '90日',
    currentState,
    values,
    constraints,
  }
}

export function normalizeAiosTaskInput(value: unknown): AiosTaskInput {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const title = String(input.title || '').trim()
  const reason = String(input.reason || '').trim()
  const domain = String(input.domain || 'Focus').trim()
  const impact = Math.max(1, Math.min(5, Number(input.impact || 3)))
  const effort = Math.max(1, Math.min(5, Number(input.effort || 3)))
  const dueDate = String(input.dueDate || '').trim()
  const status = String(input.status || 'todo')

  if (!title) throw new Error('タスク名を入力してください')
  if (!['todo', 'doing', 'done', 'skipped'].includes(status)) throw new Error('ステータスが不正です')

  return {
    title,
    reason: reason || '目標達成に必要な行動として追加しました',
    domain: domain || 'Focus',
    impact,
    effort,
    dueDate,
    status: status as AiosTaskInput['status'],
  }
}

export function createStarterTasks(profile: AiosProfileInput): AiosTaskInput[] {
  const goalLabel = profile.goal.length > 36 ? `${profile.goal.slice(0, 36)}...` : profile.goal

  return [
    {
      title: `${goalLabel}の成功条件を3つに絞る`,
      reason: 'AIが行動を選ぶ基準を明確にするため、まず成功条件を固定します。',
      domain: 'Decision',
      impact: 5,
      effort: 2,
      status: 'todo',
    },
    {
      title: '今週やらないことを決める',
      reason: '目標と関係の薄い行動を減らすほど、AIの提案精度が上がります。',
      domain: 'Focus',
      impact: 4,
      effort: 2,
      status: 'todo',
    },
    {
      title: '今日の最小実行単位を1つ完了する',
      reason: '進捗ログを作ることで、次回以降の意思決定が具体化します。',
      domain: 'Action',
      impact: 4,
      effort: 3,
      status: 'todo',
    },
  ]
}

export async function getAiosState(userId: string) {
  await ensureAiosSchema()
  const sql = getSql()
  const profileRows = await sql`
    SELECT *
    FROM aincarn_aios_profiles
    WHERE user_id = ${userId}
    LIMIT 1
  `
  const taskRows = await sql`
    SELECT *
    FROM aincarn_aios_tasks
    WHERE user_id = ${userId}
    ORDER BY
      CASE status WHEN 'doing' THEN 0 WHEN 'todo' THEN 1 WHEN 'done' THEN 2 ELSE 3 END,
      impact DESC,
      effort ASC,
      updated_at DESC
  `

  return {
    profile: queryRows(profileRows)[0] ? rowToProfile(queryRows(profileRows)[0]) : null,
    tasks: queryRows(taskRows).map(rowToTask),
  }
}

export async function saveAiosProfile(userId: string, input: AiosProfileInput) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    INSERT INTO aincarn_aios_profiles (
      user_id,
      goal,
      horizon,
      current_state,
      values_text,
      constraints_text
    )
    VALUES (
      ${userId},
      ${input.goal},
      ${input.horizon},
      ${input.currentState || null},
      ${input.values || null},
      ${input.constraints || null}
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      goal = EXCLUDED.goal,
      horizon = EXCLUDED.horizon,
      current_state = EXCLUDED.current_state,
      values_text = EXCLUDED.values_text,
      constraints_text = EXCLUDED.constraints_text,
      updated_at = now()
    RETURNING *
  `
  return rowToProfile(queryRows(rows)[0])
}

export async function createAiosTask(userId: string, input: AiosTaskInput) {
  await ensureAiosSchema()
  const sql = getSql()
  const id = crypto.randomUUID()
  const dueDate = input.dueDate || null
  const rows = await sql`
    INSERT INTO aincarn_aios_tasks (
      id,
      user_id,
      title,
      reason,
      domain,
      impact,
      effort,
      due_date,
      status
    )
    VALUES (
      ${id},
      ${userId},
      ${input.title},
      ${input.reason},
      ${input.domain},
      ${input.impact},
      ${input.effort},
      ${dueDate},
      ${input.status || 'todo'}
    )
    RETURNING *
  `
  return rowToTask(queryRows(rows)[0])
}

export async function updateAiosTaskStatus(userId: string, id: string, status: SavedAiosTask['status']) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    UPDATE aincarn_aios_tasks
    SET status = ${status}, updated_at = now()
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING *
  `
  return queryRows(rows)[0] ? rowToTask(queryRows(rows)[0]) : null
}
