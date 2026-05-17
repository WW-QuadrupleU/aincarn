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
        <header className="mb-8">
          <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-rose-500">Aincarn Compare</p>
          <h1 className="text-3xl font-black tracking-tight text-brand-text sm:text-4xl">
            AIモデルをジャンル別に比較
          </h1>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-gray-500">
            LLM、画像生成、動画生成モデルをジャンルごとに分け、性能ランキングとコスパランキングを別々に確認できます。
            公開ベンチマーク、料金、速度、文脈長、用途別の強みをもとに、リサーチ、文章、コード、分析、エージェント、画像、Text to Video、Image to Videoの用途で整理しています。
            動画はNo Audioのサブモダリティを基準にしており、音声つき動画は公式APIで取得できる範囲を確認後に別枠化します。
          </p>
        </header>

        <AiModelCompareTool />
      </div>
    </main>
  )
}
