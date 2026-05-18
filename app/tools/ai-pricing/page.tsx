import type { Metadata } from 'next'
import AiPricingTool from '@/components/AiPricingTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AI料金比較ツール',
  description:
    'AIモデルのAPI料金、画像生成コスト、動画生成コストを月間利用量から比較できるAincarnの料金比較ツールです。',
}

export default function AiPricingPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <AiPricingTool />
      </div>
    </main>
  )
}
