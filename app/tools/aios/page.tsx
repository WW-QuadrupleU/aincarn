import type { Metadata } from 'next'
import AiosMvp from '@/components/AiosMvp'

export const metadata: Metadata = {
  title: 'Aincarn OS',
  description:
    'Aincarn OSは、興味・目標・行動・実績・気づきをDigital DNAとして蓄積し、あなた自身の履歴を可視化する外部記憶です。',
}

export default function AiosPage() {
  return (
    <main className="aios-fullscreen">
      <div className="mx-auto h-full max-w-[1440px] px-3 py-3 sm:px-4">
        <AiosMvp />
      </div>
    </main>
  )
}
