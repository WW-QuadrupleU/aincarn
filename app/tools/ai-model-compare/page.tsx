import type { Metadata } from 'next'
import AiModelCompareTool from '@/components/AiModelCompareTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AI性能比較ツール',
  description:
    'GPT、Claude、Gemini、Kling、Veo、Runway、画像生成モデルを、リサーチ、文章作成、コード、分析、エージェント、画像、Text to Video、Image to Videoのジャンル別に比較できる無料ツールです。',
}

export default function AiModelComparePage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <section className="mb-6 rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">AI Model Compare</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">AIモデル比較ツール</h1>
          <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-slate-600">
            主要AIモデルを、賢さ、速度、価格効率、用途別の向き不向きで整理します。
            公開ベンチマークや公式料金をもとにした比較であり、特定のサービスの利用を保証するものではありません。
          </p>
        </section>
        <AiModelCompareTool />
        <section className="mt-6 rounded-[28px] border border-white/80 bg-white/84 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
          <h2 className="text-xl font-black tracking-tight text-slate-950">この比較の読み方</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ['性能', '文章作成、調査、コード、推論などで使いやすいかを見るための目安です。'],
              ['速度', '同じ作業を短時間で回せるかを判断するための目安です。'],
              ['価格効率', '性能だけでなく、API単価や利用コストとのバランスも確認します。'],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <h3 className="text-sm font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-xs font-bold leading-relaxed text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
