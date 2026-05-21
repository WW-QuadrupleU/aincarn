import type { Metadata } from 'next'
import AiosMvp from '@/components/AiosMvp'

export const metadata: Metadata = {
  title: 'Aincarn OS MVP Test',
  description:
    'Aincarn OSのテスト環境です。目標、行動、実績を保存し、最適なAIが支援する体験のMVPを検証します。',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AiosTestPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <AiosMvp />
      </div>
    </main>
  )
}
