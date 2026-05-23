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
  projectId?: string
  createdAt: string
  updatedAt: string
}

export type SavedAiosProject = {
  id: string
  userId: string
  name: string
  accent: string
  createdAt: string
  updatedAt: string
}

export type SavedAiosMessage = {
  id: string
  userId: string
  projectId: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export type AiosTaskInput = {
  title: string
  reason: string
  domain: string
  impact: number
  effort: number
  dueDate?: string
  status?: 'todo' | 'doing' | 'done' | 'skipped'
  recommendedTool?: string
  prompt?: string
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
    projectId: row.project_id ? String(row.project_id) : undefined,
    goal: String(row.goal),
    horizon: String(row.horizon),
    currentState: row.current_state ? String(row.current_state) : '',
    values: row.values_text ? String(row.values_text) : '',
    constraints: row.constraints_text ? String(row.constraints_text) : '',
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

function rowToProject(row: Record<string, unknown>): SavedAiosProject {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    accent: String(row.accent || 'indigo'),
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  }
}

function rowToMessage(row: Record<string, unknown>): SavedAiosMessage {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    projectId: String(row.project_id),
    role: String(row.role) === 'assistant' ? 'assistant' : 'user',
    content: String(row.content),
    createdAt: new Date(String(row.created_at)).toISOString(),
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
    recommendedTool: row.recommended_tool ? String(row.recommended_tool) : '',
    prompt: row.prompt ? String(row.prompt) : '',
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
    CREATE TABLE IF NOT EXISTS aincarn_aios_projects (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      name text NOT NULL,
      accent text NOT NULL DEFAULT 'indigo',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS aincarn_aios_projects_user_idx
    ON aincarn_aios_projects (user_id, updated_at DESC)
  `
  await sql`
    CREATE TABLE IF NOT EXISTS aincarn_aios_project_profiles (
      project_id text PRIMARY KEY,
      user_id text NOT NULL,
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
    CREATE TABLE IF NOT EXISTS aincarn_aios_messages (
      id text PRIMARY KEY,
      project_id text NOT NULL,
      user_id text NOT NULL,
      role text NOT NULL,
      content text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS aincarn_aios_messages_project_idx
    ON aincarn_aios_messages (user_id, project_id, created_at ASC)
  `
  // Migrate existing tables to include AI-routing columns
  await sql`ALTER TABLE aincarn_aios_tasks ADD COLUMN IF NOT EXISTS recommended_tool text`
  await sql`ALTER TABLE aincarn_aios_tasks ADD COLUMN IF NOT EXISTS prompt text`
  await sql`ALTER TABLE aincarn_aios_tasks ADD COLUMN IF NOT EXISTS project_id text`
  await sql`
    CREATE INDEX IF NOT EXISTS aincarn_aios_tasks_user_idx
    ON aincarn_aios_tasks (user_id, status, due_date, updated_at)
  `

  // Plan generation log (rationale, model used)
  await sql`
    CREATE TABLE IF NOT EXISTS aincarn_aios_plans (
      id text PRIMARY KEY,
      user_id text NOT NULL,
      rationale text NOT NULL,
      model text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`ALTER TABLE aincarn_aios_plans ADD COLUMN IF NOT EXISTS project_id text`

  // Task execution runs (proxy executions of recommended AI)
  await sql`
    CREATE TABLE IF NOT EXISTS aincarn_aios_runs (
      id text PRIMARY KEY,
      task_id text NOT NULL,
      user_id text NOT NULL,
      provider text NOT NULL,
      model text NOT NULL,
      prompt text NOT NULL,
      output text NOT NULL,
      fallback_reason text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await sql`
    CREATE INDEX IF NOT EXISTS aincarn_aios_runs_task_idx
    ON aincarn_aios_runs (task_id, created_at DESC)
  `

  schemaReady = true
}

export type SavedAiosRun = {
  id: string
  taskId: string
  userId: string
  provider: string
  model: string
  prompt: string
  output: string
  fallbackReason: string
  createdAt: string
}

function rowToRun(row: Record<string, unknown>): SavedAiosRun {
  return {
    id: String(row.id),
    taskId: String(row.task_id),
    userId: String(row.user_id),
    provider: String(row.provider),
    model: String(row.model),
    prompt: String(row.prompt),
    output: String(row.output),
    fallbackReason: row.fallback_reason ? String(row.fallback_reason) : '',
    createdAt: new Date(String(row.created_at)).toISOString(),
  }
}

export async function recordAiosRun(input: {
  taskId: string
  userId: string
  provider: string
  model: string
  prompt: string
  output: string
  fallbackReason?: string
}) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    INSERT INTO aincarn_aios_runs (
      id, task_id, user_id, provider, model, prompt, output, fallback_reason
    )
    VALUES (
      ${crypto.randomUUID()},
      ${input.taskId},
      ${input.userId},
      ${input.provider},
      ${input.model},
      ${input.prompt},
      ${input.output},
      ${input.fallbackReason || null}
    )
    RETURNING *
  `
  return rowToRun(queryRows(rows)[0])
}

export async function getAiosRunsForTask(userId: string, taskId: string, limit = 5) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT *
    FROM aincarn_aios_runs
    WHERE task_id = ${taskId} AND user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return queryRows(rows).map(rowToRun)
}

export async function countAiosRunsSince(userId: string, since: Date) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT COUNT(*)::int AS run_count
    FROM aincarn_aios_runs
    WHERE user_id = ${userId} AND created_at >= ${since.toISOString()}
  `
  const row = queryRows(rows)[0]
  return Number(row?.run_count || 0)
}

export async function getAiosRunsByUser(userId: string) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT *
    FROM aincarn_aios_runs
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 200
  `
  return queryRows(rows).map(rowToRun)
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

  const recommendedTool = String(input.recommendedTool || '').trim()
  const prompt = String(input.prompt || '').trim()

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
    recommendedTool,
    prompt,
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
      recommendedTool: 'Claude',
      prompt: `あなたは戦略立案を支援するアドバイザーです。私の目標は「${profile.goal}」で、期間は${profile.horizon}です。${profile.currentState ? `現状: ${profile.currentState}` : ''}

この目標について「達成できた」と判断できる成功条件を、観測可能・具体的・優先順位付きで3つに絞ってください。各条件について、なぜそれが妥当か理由も添えてください。`,
    },
    {
      title: '今週やらないことを決める',
      reason: '目標と関係の薄い行動を減らすほど、AIの提案精度が上がります。',
      domain: 'Focus',
      impact: 4,
      effort: 2,
      status: 'todo',
      recommendedTool: 'ChatGPT',
      prompt: `私は「${profile.goal}」を${profile.horizon}で達成したいと考えています。

この目標達成のために、今週意図的に「やらないこと」を5つ提案してください。各項目について、やめることでどんな時間や注意リソースが解放されるか、そしてそれを目標達成にどう振り向けられるかを示してください。`,
    },
    {
      title: '今日の最小実行単位を1つ完了する',
      reason: '進捗ログを作ることで、次回以降の意思決定が具体化します。',
      domain: 'Action',
      impact: 4,
      effort: 3,
      status: 'todo',
      recommendedTool: 'Claude',
      prompt: `目標「${profile.goal}」を達成するために、今日30分以内で完了できる最小実行単位（MVA: Minimum Viable Action）を1つ提案してください。

具体的な作業手順、想定アウトプット、完了判定基準を含めてください。`,
    },
  ]
}

const PROJECT_ACCENTS = ['indigo', 'emerald', 'orange', 'rose', 'sky']

function projectNameFromGoal(goal?: string) {
  const name = String(goal || '').trim().replace(/\s+/g, ' ')
  return name ? name.slice(0, 24) : 'メインプロジェクト'
}

async function getOrCreateInitialProject(userId: string): Promise<SavedAiosProject> {
  await ensureAiosSchema()
  const sql = getSql()
  const existingRows = await sql`
    SELECT * FROM aincarn_aios_projects
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
    LIMIT 1
  `
  const existing = queryRows(existingRows)[0]
  if (existing) return rowToProject(existing)

  const legacyRows = await sql`
    SELECT * FROM aincarn_aios_profiles
    WHERE user_id = ${userId}
    LIMIT 1
  `
  const legacy = queryRows(legacyRows)[0]
  const id = crypto.randomUUID()
  const name = projectNameFromGoal(legacy?.goal ? String(legacy.goal) : '')
  const rows = await sql`
    INSERT INTO aincarn_aios_projects (id, user_id, name, accent)
    VALUES (${id}, ${userId}, ${name}, 'indigo')
    RETURNING *
  `

  if (legacy) {
    await sql`
      INSERT INTO aincarn_aios_project_profiles (
        project_id, user_id, goal, horizon, current_state, values_text, constraints_text
      )
      VALUES (
        ${id}, ${userId}, ${String(legacy.goal)}, ${String(legacy.horizon)},
        ${legacy.current_state ? String(legacy.current_state) : null},
        ${legacy.values_text ? String(legacy.values_text) : null},
        ${legacy.constraints_text ? String(legacy.constraints_text) : null}
      )
      ON CONFLICT (project_id) DO NOTHING
    `
  }

  await sql`
    UPDATE aincarn_aios_tasks
    SET project_id = ${id}
    WHERE user_id = ${userId} AND project_id IS NULL
  `
  await sql`
    UPDATE aincarn_aios_plans
    SET project_id = ${id}
    WHERE user_id = ${userId} AND project_id IS NULL
  `

  return rowToProject(queryRows(rows)[0])
}

export async function listAiosProjects(userId: string) {
  await getOrCreateInitialProject(userId)
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM aincarn_aios_projects
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC, created_at DESC
  `
  return queryRows(rows).map(rowToProject)
}

export async function createAiosProject(userId: string, name: string) {
  await ensureAiosSchema()
  const sql = getSql()
  const cleanName = name.trim().slice(0, 36) || '新しいプロジェクト'
  const projects = await listAiosProjects(userId)
  const accent = PROJECT_ACCENTS[projects.length % PROJECT_ACCENTS.length]
  const rows = await sql`
    INSERT INTO aincarn_aios_projects (id, user_id, name, accent)
    VALUES (${crypto.randomUUID()}, ${userId}, ${cleanName}, ${accent})
    RETURNING *
  `
  return rowToProject(queryRows(rows)[0])
}

async function resolveProject(userId: string, projectId?: string | null) {
  const projects = await listAiosProjects(userId)
  return projects.find((project) => project.id === projectId) || projects[0]
}

export async function recordAiosMessage(
  userId: string,
  projectId: string,
  role: SavedAiosMessage['role'],
  content: string,
) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    INSERT INTO aincarn_aios_messages (id, project_id, user_id, role, content)
    VALUES (${crypto.randomUUID()}, ${projectId}, ${userId}, ${role}, ${content})
    RETURNING *
  `
  await sql`
    UPDATE aincarn_aios_projects SET updated_at = now()
    WHERE id = ${projectId} AND user_id = ${userId}
  `
  return rowToMessage(queryRows(rows)[0])
}

export async function getAiosMessages(userId: string, projectId: string) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM aincarn_aios_messages
    WHERE user_id = ${userId} AND project_id = ${projectId}
    ORDER BY created_at ASC
    LIMIT 80
  `
  return queryRows(rows).map(rowToMessage)
}

export async function getAiosState(userId: string, requestedProjectId?: string | null) {
  await ensureAiosSchema()
  const sql = getSql()
  const projects = await listAiosProjects(userId)
  const project = projects.find((item) => item.id === requestedProjectId) || projects[0]
  const profileRows = await sql`
    SELECT *
    FROM aincarn_aios_project_profiles
    WHERE user_id = ${userId} AND project_id = ${project.id}
    LIMIT 1
  `
  const taskRows = await sql`
    SELECT *
    FROM aincarn_aios_tasks
    WHERE user_id = ${userId} AND project_id = ${project.id}
    ORDER BY
      CASE status WHEN 'doing' THEN 0 WHEN 'todo' THEN 1 WHEN 'done' THEN 2 ELSE 3 END,
      impact DESC,
      effort ASC,
      updated_at DESC
  `

  return {
    projects,
    project,
    profile: queryRows(profileRows)[0] ? rowToProfile(queryRows(profileRows)[0]) : null,
    tasks: queryRows(taskRows).map(rowToTask),
    messages: await getAiosMessages(userId, project.id),
  }
}

export async function saveAiosProfile(userId: string, projectId: string, input: AiosProfileInput) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    INSERT INTO aincarn_aios_project_profiles (
      project_id,
      user_id,
      goal,
      horizon,
      current_state,
      values_text,
      constraints_text
    )
    VALUES (
      ${projectId},
      ${userId},
      ${input.goal},
      ${input.horizon},
      ${input.currentState || null},
      ${input.values || null},
      ${input.constraints || null}
    )
    ON CONFLICT (project_id)
    DO UPDATE SET
      goal = EXCLUDED.goal,
      horizon = EXCLUDED.horizon,
      current_state = EXCLUDED.current_state,
      values_text = EXCLUDED.values_text,
      constraints_text = EXCLUDED.constraints_text,
      updated_at = now()
    RETURNING *
  `
  await sql`
    UPDATE aincarn_aios_projects
    SET updated_at = now()
    WHERE id = ${projectId} AND user_id = ${userId}
  `
  return rowToProfile(queryRows(rows)[0])
}

export async function createAiosTask(userId: string, input: AiosTaskInput, projectId?: string | null) {
  await ensureAiosSchema()
  const sql = getSql()
  const project = projectId ? await resolveProject(userId, projectId) : await getOrCreateInitialProject(userId)
  const id = crypto.randomUUID()
  const dueDate = input.dueDate || null
  const rows = await sql`
    INSERT INTO aincarn_aios_tasks (
      id,
      user_id,
      project_id,
      title,
      reason,
      domain,
      impact,
      effort,
      due_date,
      status,
      recommended_tool,
      prompt
    )
    VALUES (
      ${id},
      ${userId},
      ${project.id},
      ${input.title},
      ${input.reason},
      ${input.domain},
      ${input.impact},
      ${input.effort},
      ${dueDate},
      ${input.status || 'todo'},
      ${input.recommendedTool || null},
      ${input.prompt || null}
    )
    RETURNING *
  `
  return rowToTask(queryRows(rows)[0])
}

export async function deleteAiosTask(userId: string, id: string) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    DELETE FROM aincarn_aios_tasks
    WHERE id = ${id} AND user_id = ${userId}
    RETURNING id
  `
  return queryRows(rows).length > 0
}

export async function deleteAllPendingAiosTasks(userId: string, projectId: string) {
  await ensureAiosSchema()
  const sql = getSql()
  await sql`
    DELETE FROM aincarn_aios_tasks
    WHERE user_id = ${userId} AND project_id = ${projectId} AND status IN ('todo', 'doing')
  `
}

export async function getAiosTask(userId: string, id: string) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM aincarn_aios_tasks
    WHERE id = ${id} AND user_id = ${userId}
    LIMIT 1
  `
  const row = queryRows(rows)[0]
  return row ? rowToTask(row) : null
}

export async function recordAiosPlan(userId: string, projectId: string, rationale: string, model: string) {
  await ensureAiosSchema()
  const sql = getSql()
  await sql`
    INSERT INTO aincarn_aios_plans (id, user_id, project_id, rationale, model)
    VALUES (${crypto.randomUUID()}, ${userId}, ${projectId}, ${rationale}, ${model})
  `
}

export async function getLatestAiosPlan(userId: string, projectId: string) {
  await ensureAiosSchema()
  const sql = getSql()
  const rows = await sql`
    SELECT rationale, model, created_at
    FROM aincarn_aios_plans
    WHERE user_id = ${userId} AND project_id = ${projectId}
    ORDER BY created_at DESC
    LIMIT 1
  `
  const row = queryRows(rows)[0]
  if (!row) return null
  return {
    rationale: String(row.rationale),
    model: String(row.model),
    createdAt: new Date(String(row.created_at)).toISOString(),
  }
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
