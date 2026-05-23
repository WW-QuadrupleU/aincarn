import { NextResponse } from 'next/server'
import { isAiosInternalTester } from '@/lib/aios-test-access'
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
  recordAiosPath,
  recordAiosSignal,
  saveAiosProfile,
  setAiosFuture,
  type AiosSignalKind,
} from '@/lib/aios-store'
import {
  enrichTaskForClient,
  generateAiPlan,
  generateConversationReply,
  generateFuturePath,
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
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
  const email = await getUserEmail(authResult.userId)
  if (!isAiosInternalTester(authResult.userId, email)) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
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
    signals: state.signals,
    future: state.future,
    path: state.path,
    latestPlan,
    aiEnabled: hasAiosAi(),
    usage,
  })
}

export async function POST(request: Request) {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
  const email = await getUserEmail(authResult.userId)
  if (!isAiosInternalTester(authResult.userId, email)) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
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
        signals: state.signals,
        future: state.future,
        path: state.path,
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

    if (action === 'signal') {
      const content = String(body.content || '').trim()
      const kind = String(body.kind || '') as AiosSignalKind
      if (!content) return NextResponse.json({ error: '記録する内容を入力してください' }, { status: 400 })
      if (!['interest', 'goal', 'action', 'achievement', 'insight'].includes(kind)) {
        return NextResponse.json({ error: '記録の種類が不正です' }, { status: 400 })
      }
      await recordAiosSignal(authResult.userId, projectId, kind, content)
      const state = await getAiosState(authResult.userId, projectId)
      return NextResponse.json({ signals: state.signals, projects: state.projects, project: state.project })
    }

    if (action === 'select-future') {
      const signalId = String(body.signalId || '').trim()
      if (!signalId) return NextResponse.json({ error: '未来として選ぶ目標を指定してください' }, { status: 400 })
      const future = await setAiosFuture(authResult.userId, signalId)
      return NextResponse.json({ future, path: null })
    }

    if (action === 'generate-path') {
      if (!current.future) return NextResponse.json({ error: '先にChosen Futureを選択してください' }, { status: 400 })
      const generated = await generateFuturePath(current.future, current.signals)
      const path = await recordAiosPath(
        authResult.userId,
        current.future.statement,
        generated.moves,
        generated.beyond,
        generated.rationale,
        generated.model,
      )
      return NextResponse.json({ future: current.future, path })
    }

    if (action === 'complete-move') {
      if (!current.future || !current.path) return NextResponse.json({ error: '完了できる現在の一手がありません' }, { status: 400 })
      const pathId = String(body.pathId || '').trim()
      const moveIndex = Number(body.moveIndex)
      const comment = String(body.comment || '').trim()
      if (pathId !== current.path.id || moveIndex !== 0 || !current.path.moves[0]) {
        return NextResponse.json({ error: '更新済みの道筋です。最新の一手を確認してください' }, { status: 409 })
      }
      if (!comment) return NextResponse.json({ error: '実行して分かったことをコメントに残してください' }, { status: 400 })

      const completedMove = current.path.moves[0]
      await recordAiosSignal(authResult.userId, projectId, 'action', `完了: ${completedMove.title} / ${comment}`)
      const updatedState = await getAiosState(authResult.userId, projectId)
      const generated = await generateFuturePath(current.future, updatedState.signals)
      const path = await recordAiosPath(
        authResult.userId,
        current.future.statement,
        generated.moves,
        generated.beyond,
        generated.rationale,
        generated.model,
      )
      return NextResponse.json({
        signals: updatedState.signals,
        future: current.future,
        path,
        completed: { title: completedMove.title, comment },
      })
    }

    if (action === 'profile' || action === 'regenerate' || action === 'conversation-plan') {
      const profileInput =
        action === 'conversation-plan'
          ? profileFromConversation(current.project.name, current.messages, current.profile, current.signals, projectId)
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
        signals: current.signals,
        future: current.future,
        path: current.path,
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
