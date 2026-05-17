import type { Metadata } from 'next'
import Link from 'next/link'
import AiModelCompareTool from '@/components/AiModelCompareTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Aincarn | AIモデルとサブスクを実測で比較する',
  description:
    'Aincarnは、AIモデルの公開ベンチマーク、料金、用途別の使いどころを整理し、どのAIに課金すべきかを判断しやすくする比較サイトです。',
}

const signals = [
  ['Live benchmark', 'Artificial Analysisの公開データを1時間ごとに確認'],
  ['Use-case score', 'リサーチ、文章、コード、画像、動画で用途別に比較'],
  ['Subscription lens', '性能だけでなくコスパと課金判断を並べて見る'],
]

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden px-4 py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-aurora" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,0.22),transparent_28%),linear-gradient(90deg,rgba(18,14,28,0.72)_0%,rgba(18,14,28,0.48)_44%,rgba(18,14,28,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#f8fafc] via-[#f8fafc]/92 to-transparent" />
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div className="rounded-[32px] border border-white/18 bg-[#14111f]/42 p-6 text-white shadow-2xl shadow-black/20 backdrop-blur-md sm:p-8">
            <p className="mb-4 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white/88 backdrop-blur">
              Aincarn
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.24)] sm:text-6xl">
              AIの違いを、
              <span className="block text-white">使う前に測る。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm font-bold leading-relaxed text-white/82 sm:text-base">
              Aincarnは、AIモデルとAIサブスクを用途別に比較するための実測準備メディアです。
              まずは公開ベンチマークと料金データを軸に、どのAIに課金すべきかを整理します。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#compare"
                className="rounded-full bg-white px-5 py-3 text-sm font-black text-brand-text shadow-2xl shadow-rose-600/20 transition hover:-translate-y-0.5"
              >
                比較ツールを見る
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/18"
              >
                Aincarnについて
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/65 bg-white/92 p-6 shadow-2xl shadow-slate-900/12 backdrop-blur-xl">
            <p className="text-center text-sm font-black text-brand-text">あなたに合うAIは...</p>
            <h2 className="mt-3 text-center text-3xl font-black text-[#2f8fe8]">用途で変わる</h2>
            <div className="mx-auto mt-4 h-1 w-8 rounded-full bg-[#b7dcff]" />
            <div className="mt-7 space-y-4 text-sm font-bold leading-relaxed text-gray-700">
              <p>
                文章作成に強いAI、コードに強いAI、リサーチに強いAIは同じではありません。
                Aincarnではモデルの個性を、用途別スコアとコスト感に分けて見ます。
              </p>
              <p>
                今後は、自分で契約しているAIサブスクの実測テストも追加し、公開ベンチマークだけでは見えない使い勝手まで整理します。
              </p>
              <p>
                迷ったときに「今月どのAIへ課金するか」を決められるサイトへ育てていきます。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="grid gap-3 md:grid-cols-3">
          {signals.map(([title, body]) => (
            <article key={title} className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm shadow-slate-900/5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d33472]">{title}</p>
              <p className="mt-3 text-sm font-bold leading-relaxed text-gray-600">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="compare" className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Model Compare</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-brand-text">AIモデル比較</h2>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-gray-500">
            いまは公開ベンチマーク中心の初期版です。Aincarn独自の実測データ、サブスク制限、UIの使い勝手は順次追加します。
          </p>
        </div>
        <AiModelCompareTool />
      </section>
    </>
  )
}
