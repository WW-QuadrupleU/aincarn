import { NextResponse } from 'next/server'
import { getSubscriptionUserId } from '@/lib/subscription-auth'
import { deleteAiosTask, hasAiosDatabase, updateAiosTaskStatus, type SavedAiosTask } from '@/lib/aios-store'
import { enrichTaskForClient } from '@/lib/aios-ai'

function configurationError() {
  return NextResponse.json(
    {
      error: 'Aincarn OSの保存機能は現在準備中です',
    },
    { status: 501 }
  )
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  if (!hasAiosDatabase()) return configurationError()

  const { id } = await context.params
  const body = await request.json()
  const status = String(body.status || '')

  if (!['todo', 'doing', 'done', 'skipped'].includes(status)) {
    return NextResponse.json({ error: 'ステータスが不正です' }, { status: 400 })
  }

  const task = await updateAiosTaskStatus(authResult.userId, id, status as SavedAiosTask['status'])
  if (!task) return NextResponse.json({ error: 'タスクが見つかりません' }, { status: 404 })

  return NextResponse.json({ task: enrichTaskForClient(task) })
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }
  if (!hasAiosDatabase()) return configurationError()

  const { id } = await context.params
  const ok = await deleteAiosTask(authResult.userId, id)
  if (!ok) return NextResponse.json({ error: 'タスクが見つかりません' }, { status: 404 })

  return NextResponse.json({ ok: true })
}
