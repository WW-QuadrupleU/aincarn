import { NextResponse } from 'next/server'
import { isAiosInternalTester } from '@/lib/aios-test-access'
import { getSubscriptionUserId, getUserEmail } from '@/lib/subscription-auth'
import { deleteAiosProject, hasAiosDatabase } from '@/lib/aios-store'

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  const email = await getUserEmail(auth.userId)
  if (!isAiosInternalTester(auth.userId, email)) return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  if (!hasAiosDatabase()) {
    return NextResponse.json({ error: 'Aincarn OSの保存機能は現在準備中です' }, { status: 501 })
  }

  try {
    const { id } = await context.params
    const nextProject = await deleteAiosProject(auth.userId, id)
    return NextResponse.json({ ok: true, nextProjectId: nextProject?.id || null })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'プロジェクトの削除に失敗しました' },
      { status: 400 },
    )
  }
}
