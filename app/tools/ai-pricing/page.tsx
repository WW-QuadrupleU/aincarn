import type { Metadata } from 'next'
import AiPricingTool from '@/components/AiPricingTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'API料金シミュレータ',
  description:
    'ChatGPT、Claude、Geminiなど主要なAIモデルのAPI従量課金コストや、定額サブスクとの損益分岐点をシミュレーションできるツールです。',
}

export default function AiPricingPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <AiPricingTool />
      </div>
    </main>
  )
}
