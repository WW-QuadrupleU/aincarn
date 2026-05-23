import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import AiosAiLab from '@/components/AiosAiLab'
import { isAiosInternalTester } from '@/lib/aios-test-access'
import { getSubscriptionUserId, getUserEmail } from '@/lib/subscription-auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Aincarn AI Path Lab',
  description:
    'Aincarn OSのAI経路設計を、保存データとは分離して検証する非公開テスト環境です。',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AiosTestPage() {
  const authResult = await getSubscriptionUserId()
  if (!authResult.userId) notFound()

  const email = await getUserEmail(authResult.userId)
  if (!isAiosInternalTester(authResult.userId, email)) notFound()

  return (
    <main className="aios-fullscreen">
      <div className="mx-auto h-full max-w-[1440px] px-3 py-3 sm:px-4">
        <AiosAiLab />
      </div>
    </main>
  )
}
