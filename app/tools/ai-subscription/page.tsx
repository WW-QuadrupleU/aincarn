import type { Metadata } from 'next'
import AiSubscriptionTool from '@/components/AiSubscriptionTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AIサブスク管理',
  description:
    'ChatGPT、Claude、GeminiなどのAIサブスクリプションを比較・管理するツールです。2次元マトリックスでポジショニングを確認でき、AIコンシェルジュが最適な組み合わせを診断します。',
}

export default function AiSubscriptionPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <AiSubscriptionTool />
      </div>
    </main>
  )
}
