import type { Metadata } from 'next'
import AiosMvp from '@/components/AiosMvp'

export const metadata: Metadata = {
  title: 'Aincarn OS',
  description:
    'Aincarn OSは、目標から逆算したタスクと最適AIをセットで提案します。プロンプトはAincarn内で実行され、回答と実績がそのままMemoryに残ります。',
}

export default function AiosPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <AiosMvp />
      </div>
    </main>
  )
}
