import { createHash, timingSafeEqual } from 'node:crypto'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { hasAgentTokenDatabase, validateAgentToken } from '@/lib/agent-token-store'
import { countAiosRunsSince, hasAiosDatabase, recordAiosRun } from '@/lib/aios-store'
import { getTierConfig, getUsageWindowReset, getUsageWindowStart, resolveEffectiveTier, type AiosTier } from '@/lib/aios-tier'
import { getUserEmail, hasSubscriptionAuth } from '@/lib/subscription-auth'

export const runtime = 'nodejs'
export const maxDuration = 45

type AgentWorkspaceFile = {
  path: string
  size: number
  modifiedAt: string
}

type AgentWorkspaceSummary = {
  root?: string
  name: string
  files: AgentWorkspaceFile[]
  ignoredCount: number
  packageScripts: string[]
}

type AgentStep = {
  title: string
  detail: string
  risk: 'low' | 'medium' | 'high'
}

const MAX_TASK_CHARS = 2000
const MAX_FILES = 200
const MAX_PATH_CHARS = 180
const DEFAULT_MODEL = 'gpt-5-mini'

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status })
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

function hashToken(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function getBearerToken(request: Request) {
  const header = request.headers.get('authorization') || ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  return match ? match[1].trim() : ''
}

async function authenticate(request: Request): Promise<
  | { ok: true; userId: string; email: string | null; source: 'user-token' | 'shared-token' | 'clerk'; tierOverride?: AiosTier }
  | { ok: false; response: NextResponse }
> {
  const token = getBearerToken(request)
  const deviceId = String(request.headers.get('x-aincarn-device-id') || '').trim().slice(0, 120)
  const deviceName = String(request.headers.get('x-aincarn-device-name') || '').trim().slice(0, 120)

  if (token && hasAgentTokenDatabase()) {
    try {
      if (!deviceId) return { ok: false, response: jsonError('Device id is required', 400) }
      const record = await validateAgentToken({ token, deviceId, deviceName })
      if (record) return { ok: true, userId: record.userId, email: null, source: 'user-token' }
    } catch (error) {
      return { ok: false, response: jsonError(error instanceof Error ? error.message : 'Invalid device token', 403) }
    }
  }

  const configuredToken = process.env.AINCARN_AGENT_API_TOKEN || ''

  if (token && configuredToken && safeEqual(token, configuredToken)) {
    const tier = process.env.AINCARN_AGENT_TOKEN_TIER as AiosTier | undefined
    return {
      ok: true,
      userId: process.env.AINCARN_AGENT_TOKEN_USER_ID || `desktop:${hashToken(token).slice(0, 24)}`,
      email: null,
      source: 'shared-token',
      tierOverride: tier && ['free', 'light', 'pro', 'power', 'unlimited'].includes(tier) ? tier : 'free',
    }
  }

  if (hasSubscriptionAuth()) {
    try {
      const { userId } = await auth()
      if (userId) {
        return { ok: true, userId, email: await getUserEmail(userId), source: 'clerk' }
      }
    } catch {
      // fall through to 401
    }
  }

  return { ok: false, response: jsonError('Unauthorized', 401) }
}

function sanitizeWorkspace(value: unknown): AgentWorkspaceSummary {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const name = String(input.name || 'workspace').trim().slice(0, 80) || 'workspace'
  const ignoredCount = Math.max(0, Math.min(100000, Number(input.ignoredCount || 0)))
  const filesRaw = Array.isArray(input.files) ? input.files : []
  const scriptsRaw = Array.isArray(input.packageScripts) ? input.packageScripts : []

  const files = filesRaw.slice(0, MAX_FILES).map((item) => {
    const file = item && typeof item === 'object' ? (item as Record<string, unknown>) : {}
    return {
      path: String(file.path || '').replaceAll('\\', '/').slice(0, MAX_PATH_CHARS),
      size: Math.max(0, Math.min(5_000_000, Number(file.size || 0))),
      modifiedAt: String(file.modifiedAt || '').slice(0, 40),
    }
  }).filter((file) => file.path && !file.path.includes('..') && !file.path.startsWith('/'))

  return {
    name,
    files,
    ignoredCount,
    packageScripts: scriptsRaw.slice(0, 30).map((script) => String(script).slice(0, 60)),
  }
}

function buildSuggestedCommands(workspace: AgentWorkspaceSummary) {
  const commands = ['git status --short']
  if (workspace.packageScripts.includes('lint')) commands.push('npm run lint')
  if (workspace.packageScripts.includes('build')) commands.push('npm run build')
  if (workspace.packageScripts.includes('test')) commands.push('npm test')
  commands.push('git diff --')
  return commands
}

function pickCandidateFiles(task: string, workspace: AgentWorkspaceSummary) {
  const keywords = task
    .toLowerCase()
    .split(/[\s,./\\:;()[\]{}"'`]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 3)

  const scored = workspace.files.map((file) => {
    const path = file.path.toLowerCase()
    const score = keywords.reduce((total, keyword) => total + (path.includes(keyword) ? 1 : 0), 0)
      + (path.endsWith('package.json') ? 0.4 : 0)
      + (path.includes('/components/') ? 0.2 : 0)
      + (path.includes('/src/') ? 0.2 : 0)
    return { file, score }
  })

  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((item) => item.file.path)
}

function parsePlanJson(text: string) {
  const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  const json = start >= 0 && end >= start ? trimmed.slice(start, end + 1) : trimmed
  return JSON.parse(json) as Partial<{ title: string; summary: string; steps: AgentStep[] }>
}

function sanitizeSteps(steps: AgentStep[] | undefined): AgentStep[] {
  if (!Array.isArray(steps) || steps.length === 0) {
    return [
      { title: '状況を確認する', detail: '関連ファイルと現在の差分を確認します。', risk: 'low' },
      { title: '小さく変更する', detail: '影響範囲を限定して実装します。', risk: 'medium' },
      { title: '検証する', detail: '許可されたコマンドで検証します。', risk: 'low' },
    ]
  }

  return steps.slice(0, 3).map((step) => ({
    title: String(step.title || 'Step').slice(0, 80),
    detail: String(step.detail || '').slice(0, 360),
    risk: step.risk === 'high' || step.risk === 'medium' || step.risk === 'low' ? step.risk : 'medium',
  }))
}

async function getUsage(input: { userId: string; email: string | null; tierOverride?: AiosTier }) {
  if (!hasAiosDatabase()) return null

  const resolved = input.tierOverride
    ? { tier: input.tierOverride, periodStart: null, periodEnd: null }
    : await resolveEffectiveTier({ userId: input.userId, email: input.email })
  const config = getTierConfig(resolved.tier)
  const windowStart = getUsageWindowStart(resolved.periodStart)
  const used = await countAiosRunsSince(input.userId, windowStart)

  return {
    tier: config.tier,
    tierLabel: config.label,
    used,
    limit: Number.isFinite(config.monthlyRunLimit) ? config.monthlyRunLimit : null,
    resetsAt: getUsageWindowReset(resolved.periodEnd).toISOString(),
  }
}

export async function POST(request: Request) {
  const identity = await authenticate(request)
  if (!identity.ok) return identity.response

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return jsonError('OPENAI_API_KEY is not configured on the server', 501)

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON', 400)
  }

  const task = String(body.task || '').trim().slice(0, MAX_TASK_CHARS)
  if (!task) return jsonError('Task is required', 400)

  const workspace = sanitizeWorkspace(body.workspace)
  const candidateFiles = pickCandidateFiles(task, workspace)
  const suggestedCommands = buildSuggestedCommands(workspace)
  const model = String(body.model || process.env.AINCARN_AGENT_MODEL || DEFAULT_MODEL).slice(0, 80)
  const usage = await getUsage(identity)

  if (usage && usage.limit !== null && usage.used >= usage.limit) {
    return NextResponse.json({ error: 'AI run limit exceeded', usage }, { status: 429 })
  }

  const prompt = [
    'You are Aincarn Agent, a careful local development planning agent.',
    'Return only compact JSON with keys: title, summary, steps.',
    'steps must be an array of 3 items. Each step has title, detail, risk. risk is low, medium, or high.',
    'Do not suggest destructive commands. Do not ask to read secrets, env files, credentials, private keys, or unrelated personal files.',
    'Plan only. Never claim that you executed commands or edited files.',
    '',
    `Workspace: ${workspace.name}`,
    `Package scripts: ${workspace.packageScripts.join(', ') || 'none'}`,
    `Candidate files: ${candidateFiles.join(', ') || 'none'}`,
    `Ignored file count: ${workspace.ignoredCount}`,
    `Task: ${task}`,
  ].join('\n')

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: prompt,
      max_output_tokens: 900,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    return jsonError(`OpenAI ${response.status}: ${message.slice(0, 220)}`, 502)
  }

  const data = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }
  const text = data.output_text || data.output?.flatMap((item) => item.content || []).map((item) => item.text || '').join('\n') || ''
  let parsed: Partial<{ title: string; summary: string; steps: AgentStep[] }>
  try {
    parsed = parsePlanJson(text)
  } catch {
    parsed = {
      title: task,
      summary: text.slice(0, 600) || `${model} で生成した実行計画です。`,
      steps: [],
    }
  }
  const plan = {
    title: String(parsed.title || task).slice(0, 120),
    mode: 'ai' as const,
    model,
    summary: String(parsed.summary || `${model} で生成した実行計画です。`).slice(0, 600),
    steps: sanitizeSteps(parsed.steps),
    suggestedCommands,
    candidateFiles,
  }

  if (hasAiosDatabase()) {
    await recordAiosRun({
      taskId: 'desktop-plan',
      userId: identity.userId,
      provider: 'openai',
      model,
      prompt,
      output: JSON.stringify(plan),
      fallbackReason: identity.source === 'shared-token' ? 'desktop-shared-token' : identity.source === 'user-token' ? 'desktop-user-token' : undefined,
    }).catch(() => {})
  }

  const updatedUsage = await getUsage(identity)
  return NextResponse.json({ plan, usage: updatedUsage })
}
