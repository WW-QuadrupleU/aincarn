import type { Metadata } from 'next'
import AiModelCompareTool from '@/components/AiModelCompareTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AIモデル用途別性能比較ツール',
  description:
    'GPT、Claude、Gemini、Kling、Veo、Runway、画像生成モデルを、リサーチ、文章作成、コード、分析、エージェント、画像、Text to Video、Image to Videoのジャンル別に比較できる無料ツールです。',
}

export default function AiModelComparePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">

        <AiModelCompareTool />
      </div>
    </main>
  )
}
