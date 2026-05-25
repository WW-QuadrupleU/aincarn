import type { Metadata } from 'next'
import AiPricingTool from '@/components/AiPricingTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AI料金比較',
  description:
    'ChatGPT、Claude、Geminiなど主要なAIサービスの料金プラン、API従量課金コスト、定額サブスクとの損益分岐点を比較できるツールです。',
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
