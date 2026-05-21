import type { Metadata } from 'next'
import SubscriptionManager from '@/components/SubscriptionManager'

export const metadata: Metadata = {
  title: 'AIサブスクコレクション',
  description:
    '主要AIサービスを選んでプランを追加し、料金、更新日、ステータスをアカウントごとに保存できるAincarnのサブスク管理ツールです。',
}

export default function SubscriptionsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,rgba(224,255,72,0.32)_0%,rgba(255,255,255,0.86)_24%,rgba(0,213,255,0.22)_52%,rgba(255,255,255,0.88)_72%,rgba(240,24,122,0.18)_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <SubscriptionManager />
      </div>
    </main>
  )
}
