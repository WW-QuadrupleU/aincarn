import { NextResponse } from 'next/server'
import { getSubscriptionUserId, getUserEmail } from '@/lib/subscription-auth'
import {
  countAiosRunsSince,
  getAiosState,
  getAiosRunsForTask,
  hasAiosDatabase,
  recordAiosRun,
} from '@/lib/aios-store'
import { runPrompt } from '@/lib/aios-runner'
import {
  getTierConfig,
  getUsageWindowReset,
  getUsageWindowStart,
  resolveEffectiveTier,
} from '@/lib/aios-tier'

export const runtime = 'nodejs'
export const maxDuration = 60

function configurationError() {
  return NextResponse.json(
    { error: 'Aincarn OSの保存機能は現在準備中です' },
    { status: 501 },
  )
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!hasAiosDatabase()) return configurationError()

  const { id } = await context.params
  const runs = await getAiosRunsForTask(auth.userId, id)
  return NextResponse.json({ runs })
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) return NextResponse.json({ error: auth.error }, { status: auth.status })
  if (!hasAiosDatabase()) return configurationError()

  const { id } = await context.params

  // Resolve tier and enforce monthly rate limit
  const email = await getUserEmail(auth.userId)
  const { tier } = await resolveEffectiveTier({ userId: auth.userId, email })
  const config = getTierConfig(tier)
  const windowStart = getUsageWindowStart()
  const used = await countAiosRunsSince(auth.userId, windowStart)

  if (Number.isFinite(config.monthlyRunLimit) && used >= config.monthlyRunLimit) {
    return NextResponse.json(
      {
        error: `今月のAI実行枠（${config.monthlyRunLimit}回）を使い切りました。プランをアップグレードすると上限が増えます。`,
        usage: {
          tier: config.tier,
          tierLabel: config.label,
          used,
          limit: config.monthlyRunLimit,
          resetsAt: getUsageWindowReset().toISOString(),
        },
      },
      { status: 429 },
    )
  }

  let promptOverride = ''
  try {
    const body = await request.json().catch(() => ({}))
    promptOverride = String(body?.prompt || '').trim()
  } catch {
    // ignore
  }

  const state = await getAiosState(auth.userId)
  const task = state.tasks.find((item) => item.id === id)
  if (!task) {
    return NextResponse.json({ error: 'タスクが見つかりません' }, { status: 404 })
  }

  const tool = task.recommendedTool || 'Claude'
  const prompt = promptOverride || task.prompt || ''
  if (!prompt) {
    return NextResponse.json(
      { error: 'このタスクには実行可能なプロンプトが添付されていません。プロンプトを編集してから実行してください。' },
      { status: 400 },
    )
  }

  try {
    const result = await runPrompt(prompt, tool)
    const saved = await recordAiosRun({
      taskId: id,
      userId: auth.userId,
      provider: result.provider,
      model: result.model,
      prompt,
      output: result.output,
      fallbackReason: result.fallbackReason,
    })
    return NextResponse.json({
      run: saved,
      usage: {
        tier: config.tier,
        tierLabel: config.label,
        used: used + 1,
        limit: Number.isFinite(config.monthlyRunLimit) ? config.monthlyRunLimit : null,
        resetsAt: getUsageWindowReset().toISOString(),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '実行に失敗しました' },
      { status: 502 },
    )
  }
}
