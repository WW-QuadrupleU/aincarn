import { NextResponse } from 'next/server'
import { getSubscriptionUserId, getUserEmail } from '@/lib/subscription-auth'
import {
  countAiosRunsSince,
  createAiosProject,
  createAiosTask,
  deleteAllPendingAiosTasks,
  getAiosState,
  getLatestAiosPlan,
  hasAiosDatabase,
  normalizeAiosProfileInput,
  normalizeAiosTaskInput,
  recordAiosMessage,
  recordAiosPlan,
  saveAiosProfile,
} from '@/lib/aios-store'
import {
  enrichTaskForClient,
  generateAiPlan,
  generateConversationReply,
  hasAiosAi,
  profileFromConversation,
} from '@/lib/aios-ai'
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

export async function GET(request: Request) {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  if (!hasAiosDatabase()) return configurationError()

  const projectId = new URL(request.url).searchParams.get('projectId')
  const state = await getAiosState(authResult.userId, projectId)
  const latestPlan = await getLatestAiosPlan(authResult.userId, state.project.id)
  const usage = await computeUsage(authResult.userId)
  return NextResponse.json({
    projects: state.projects,
    project: state.project,
    profile: state.profile,
    tasks: state.tasks.map(enrichTaskForClient),
    messages: state.messages,
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
    const requestedProjectId = typeof body.projectId === 'string' ? body.projectId : null
    const current = await getAiosState(authResult.userId, requestedProjectId)
    const projectId = current.project.id

    if (action === 'project') {
      const project = await createAiosProject(authResult.userId, String(body.name || '新しいプロジェクト'))
      const state = await getAiosState(authResult.userId, project.id)
      return NextResponse.json({
        projects: state.projects,
        project: state.project,
        profile: state.profile,
        tasks: [],
        messages: [],
        latestPlan: null,
        aiEnabled: hasAiosAi(),
        usage: await computeUsage(authResult.userId),
      })
    }

    if (action === 'chat') {
      const content = String(body.content || '').trim()
      if (!content) return NextResponse.json({ error: 'メッセージを入力してください' }, { status: 400 })
      await recordAiosMessage(authResult.userId, projectId, 'user', content)
      const withUserMessage = await getAiosState(authResult.userId, projectId)
      const reply = await generateConversationReply(withUserMessage.project.name, withUserMessage.messages)
      await recordAiosMessage(authResult.userId, projectId, 'assistant', reply.content)
      const state = await getAiosState(authResult.userId, projectId)
      return NextResponse.json({ messages: state.messages, project: state.project, projects: state.projects })
    }

    if (action === 'profile' || action === 'regenerate' || action === 'conversation-plan') {
      const profileInput =
        action === 'conversation-plan'
          ? profileFromConversation(current.project.name, current.messages, current.profile)
          : normalizeAiosProfileInput(body.profile)
      const profile = await saveAiosProfile(authResult.userId, projectId, profileInput)
      let tasks = current.tasks
      let plan = null

      const shouldGenerate = action === 'regenerate' || action === 'conversation-plan' || tasks.length === 0
      if (shouldGenerate) {
        if (action === 'regenerate' || action === 'conversation-plan') {
          await deleteAllPendingAiosTasks(authResult.userId, projectId)
        }
        plan = await generateAiPlan(profile)
        tasks = await Promise.all(plan.tasks.map((task) => createAiosTask(authResult.userId, task, projectId)))
        await recordAiosPlan(authResult.userId, projectId, plan.rationale, plan.model)
      }

      const usage = await computeUsage(authResult.userId)
      return NextResponse.json({
        projects: current.projects,
        project: current.project,
        profile,
        tasks: tasks.map(enrichTaskForClient),
        messages: current.messages,
        latestPlan: plan ? { rationale: plan.rationale, model: plan.model, createdAt: new Date().toISOString() } : await getLatestAiosPlan(authResult.userId, projectId),
        aiEnabled: hasAiosAi(),
        usage,
      })
    }

    const task = await createAiosTask(authResult.userId, normalizeAiosTaskInput(body.task), projectId)
    return NextResponse.json({ task: enrichTaskForClient(task) }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存に失敗しました' },
      { status: 400 }
    )
  }
}
