import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesktopTokenManager from '@/components/DesktopTokenManager'
import { getSubscriptionUserId } from '@/lib/subscription-auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Aincarn Agent Desktop Access',
  description: 'Aincarn Agent Desktopのユーザー別接続トークンを管理します。',
}

export default async function AiosDesktopAccessPage() {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) notFound()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(125,180,255,0.22),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(255,115,180,0.18),transparent_28%),linear-gradient(135deg,#f8fbff,#fff7fb)] px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <DesktopTokenManager />
      </div>
    </main>
  )
}
