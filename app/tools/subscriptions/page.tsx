import type { Metadata } from 'next'
import SubscriptionManager from '@/components/SubscriptionManager'

export const metadata: Metadata = {
  title: 'AIサブスクコレクション',
  description:
    '主要AIサービスを選んでプランを追加し、料金、更新日、ステータスをアカウントごとに保存できるAincarnのサブスク管理ツールです。',
}

export default function SubscriptionsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[linear-gradient(120deg,rgba(255,228,49,0.62)_0%,rgba(255,107,40,0.24)_28%,rgba(255,255,255,0.78)_48%,rgba(240,24,122,0.2)_72%,rgba(57,167,255,0.28)_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <SubscriptionManager />
      </div>
    </main>
  )
}
