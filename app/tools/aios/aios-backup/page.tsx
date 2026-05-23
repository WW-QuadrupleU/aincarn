import type { Metadata } from 'next'
import AiosMvp from '@/components/AiosMvp'

export const metadata: Metadata = {
  title: 'Aincarn OS',
  description:
    'Aincarn OSは、ユーザーの目標、判断、行動、実績を保存し、人生と事業のリソース配分を最適化するAincarnの主力ツールです。',
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
