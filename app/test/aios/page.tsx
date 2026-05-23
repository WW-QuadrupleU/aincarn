import type { Metadata } from 'next'
import AiosAiLab from '@/components/AiosAiLab'

export const metadata: Metadata = {
  title: 'Aincarn AI Path Lab',
  description:
    'Aincarn OSのAI経路設計を、保存データとは分離して検証する非公開テスト環境です。',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AiosTestPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-[1320px] px-4 py-6">
        <AiosAiLab />
      </div>
    </main>
  )
}
