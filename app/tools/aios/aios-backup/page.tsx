import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AiosMvp from '@/components/AiosMvp'
import { isAiosInternalTester } from '@/lib/aios-test-access'
import { getSubscriptionUserId, getUserEmail } from '@/lib/subscription-auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Aincarn OS',
  description:
    'Aincarn OSは、ユーザーの目標、判断、行動、実績を保存し、人生と事業のリソース配分を最適化するAincarnの主力ツールです。',
}

export default async function AiosPage() {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) notFound()

  const email = await getUserEmail(authResult.userId)
  if (!isAiosInternalTester(authResult.userId, email)) notFound()

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <AiosMvp />
      </div>
    </main>
  )
}
