import { NextResponse } from 'next/server'
import { getSubscriptionUserId } from '@/lib/subscription-auth'
import {
  createAiosTask,
  createStarterTasks,
  getAiosState,
  hasAiosDatabase,
  normalizeAiosProfileInput,
  normalizeAiosTaskInput,
  saveAiosProfile,
} from '@/lib/aios-store'

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
  return NextResponse.json(state)
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

    if (action === 'profile') {
      const profile = await saveAiosProfile(authResult.userId, normalizeAiosProfileInput(body.profile))
      const current = await getAiosState(authResult.userId)
      let tasks = current.tasks

      if (tasks.length === 0) {
        tasks = await Promise.all(
          createStarterTasks(profile).map((task) => createAiosTask(authResult.userId, task))
        )
      }

      return NextResponse.json({ profile, tasks })
    }

    const task = await createAiosTask(authResult.userId, normalizeAiosTaskInput(body.task))
    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '保存に失敗しました' },
      { status: 400 }
    )
  }
}
