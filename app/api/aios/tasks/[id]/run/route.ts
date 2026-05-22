import { NextResponse } from 'next/server'
import { getSubscriptionUserId } from '@/lib/subscription-auth'
import {
  getAiosState,
  getAiosRunsForTask,
  hasAiosDatabase,
  recordAiosRun,
} from '@/lib/aios-store'
import { runPrompt } from '@/lib/aios-runner'

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
  let promptOverride = ''
  try {
    const body = await request.json().catch(() => ({}))
    promptOverride = String(body?.prompt || '').trim()
  } catch {
    // ignore
  }

  // Fetch task to know its recommended tool and stored prompt
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
    return NextResponse.json({ run: saved })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '実行に失敗しました' },
      { status: 502 },
    )
  }
}
