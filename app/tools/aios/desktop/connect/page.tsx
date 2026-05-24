import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import DesktopConnectApproval from '@/components/DesktopConnectApproval'
import { getSubscriptionUserId } from '@/lib/subscription-auth'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Connect Aincarn Agent',
}

export default async function DesktopConnectPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const auth = await getSubscriptionUserId()
  if (!auth.userId) notFound()
  const params = await searchParams
  const code = String(params.code || '').trim().toUpperCase()
  if (!code) notFound()

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(125,180,255,0.22),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(255,115,180,0.18),transparent_28%),linear-gradient(135deg,#f8fbff,#fff7fb)] px-4 py-16">
      <DesktopConnectApproval userCode={code} />
    </main>
  )
}
