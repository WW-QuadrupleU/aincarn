import type { Metadata } from 'next'
import SubscriptionManager from '@/components/SubscriptionManager'

export const metadata: Metadata = {
  title: 'AIサブスクコレクション',
  description:
    '主要AIサービスを選んでプランを追加し、料金、更新日、ステータスをアカウントごとに保存できるAincarnのサブスク管理ツールです。',
}

export default function SubscriptionsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <SubscriptionManager />
      </div>
    </main>
  )
}
