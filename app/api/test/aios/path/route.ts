import { NextResponse } from 'next/server'
import { generateFuturePath } from '@/lib/aios-ai'
import { getSubscriptionUserId } from '@/lib/subscription-auth'
import type { AiosSignalKind, SavedAiosFuture, SavedAiosSignal } from '@/lib/aios-store'

const TEST_MODEL = process.env.AINCARN_AIOS_TEST_MODEL || 'claude-sonnet-4-6'
const VALID_KINDS: AiosSignalKind[] = ['interest', 'goal', 'action', 'achievement', 'insight']

export async function POST(request: Request) {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const body = await request.json()
    const statement = String(body.future || '').trim()
    if (!statement) return NextResponse.json({ error: 'Chosen Futureを入力してください' }, { status: 400 })

    const now = new Date().toISOString()
    const future: SavedAiosFuture = {
      userId: authResult.userId,
      signalId: 'test-future',
      statement: statement.slice(0, 240),
      createdAt: now,
      updatedAt: now,
    }
    const rawSignals = Array.isArray(body.signals) ? body.signals : []
    const signals: SavedAiosSignal[] = rawSignals.slice(0, 20).flatMap((item: unknown, index: number) => {
      if (!item || typeof item !== 'object') return []
      const signal = item as Record<string, unknown>
      const content = String(signal.content || '').trim()
      const kind = String(signal.kind || '') as AiosSignalKind
      if (!content || !VALID_KINDS.includes(kind)) return []
      return [{
        id: `test-signal-${index}`,
        userId: authResult.userId,
        projectId: 'test-lab',
        kind,
        content: content.slice(0, 240),
        createdAt: now,
      }]
    })

    const path = await generateFuturePath(future, signals, { model: TEST_MODEL })
    return NextResponse.json({
      path,
      modelRequested: TEST_MODEL,
      persisted: false,
      signalCount: signals.length,
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '生成に失敗しました' }, { status: 400 })
  }
}
