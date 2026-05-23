import { NextResponse } from 'next/server'
import { getSubscriptionUserId, getUserEmail } from '@/lib/subscription-auth'
import {
  countAiosRunsSince,
  createAiosTask,
  deleteAllPendingAiosTasks,
  getAiosState,
  getLatestAiosPlan,
  hasAiosDatabase,
  normalizeAiosProfileInput,
  normalizeAiosTaskInput,
  recordAiosPlan,
  saveAiosProfile,
} from '@/lib/aios-store'
import { enrichTaskForClient, generateAiPlan, hasAiosAi } from '@/lib/aios-ai'
import { getTierConfig, getUsageWindowReset, getUsageWindowStart, resolveEffectiveTier } from '@/lib/aios-tier'

async function computeUsage(userId: string) {
  const email = await getUserEmail(userId)
  const { tier, source, periodStart, periodEnd } = await resolveEffectiveTier({ userId, email })
  const config = getTierConfig(tier)
  const used = await countAiosRunsSince(userId, getUsageWindowStart(periodStart))
  return {
    tier: config.tier,
    tierLabel: config.label,
    tierDescription: config.description,
    tierSource: source,
    used,
    limit: Number.isFinite(config.monthlyRunLimit) ? config.monthlyRunLimit : null,
    resetsAt: getUsageWindowReset(periodEnd).toISOString(),
  }
}

function configurationError() {
  return NextResponse.json(
    {
      error: 'Aincarn OSの保存機能は現在準備中です',
    },
    { status: 501 }
  )
}

export async function GET() {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  if (!hasAiosDatabase()) return configurationError()

  const state = await getAiosState(authResult.userId)
  const latestPlan = await getLatestAiosPlan(authResult.userId)
  const usage = await computeUsage(authResult.userId)
  return NextResponse.json({
    profile: state.profile,
    tasks: state.tasks.map(enrichTaskForClient),
    latestPlan,
    aiEnabled: hasAiosAi(),
    usage,
  })
}

export async function POST(request: Request) {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  if (!hasAiosDatabase()) return configurationError()

  try {
    const body = await request.json()
    const action = String(body.action || 'task')

    if (action === 'profile' || action === 'regenerate') {
      const profile = await saveAiosProfile(authResult.userId, normalizeAiosProfileInput(body.profile))
      const current = await getAiosState(authResult.userId)
      let tasks = current.tasks
      let plan = null

      const shouldGenerate = action === 'regenerate' || tasks.length === 0
      if (shouldGenerate) {
        if (action === 'regenerate') {
          await deleteAllPendingAiosTasks(authResult.userId)
        }
        plan = await generateAiPlan(profile)
        tasks = await Promise.all(plan.tasks.map((task) => createAiosTask(authResult.userId, task)))
        await recordAiosPlan(authResult.userId, plan.rationale, plan.model)
      }

      const usage = await computeUsage(authResult.userId)
      return NextResponse.json({
        profile,
        tasks: tasks.map(enrichTaskForClient),
        latestPlan: plan ? { rationale: plan.rationale, model: plan.model, createdAt: new Date().toISOString() } : await getLatestAiosPlan(authResult.userId),
        aiEnabled: hasAiosAi(),
        usage,
      })
    }

    const task = await createAiosTask(authResult.userId, normalizeAiosTaskInput(body.task))
    return NextResponse.json({ task: enrichTaskForClient(task) }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存に失敗しました' },
      { status: 400 }
    )
  }
}
