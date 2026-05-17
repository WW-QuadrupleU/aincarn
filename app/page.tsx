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
        <div className="absolute inset-x-0 bottom-0 -z-10 h-44 bg-gradient-to-t from-white via-white/86 to-transparent" />
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div className="pt-8 text-white">
            <p className="mb-4 inline-flex rounded-full border border-white/35 bg-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] backdrop-blur">
              Aincarn
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
              AIの違いを、
              <span className="block text-white/90">使う前に測る。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm font-bold leading-relaxed text-white/86 sm:text-base">
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
                className="rounded-full border border-white/40 bg-white/15 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/25"
              >
                Aincarnについて
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/55 bg-white/88 p-6 shadow-2xl shadow-rose-700/15 backdrop-blur-xl">
            <p className="text-center text-sm font-black text-brand-text">あなたに合うAIは...</p>
            <h2 className="mt-3 text-center text-3xl font-black text-sky-400">用途で変わる</h2>
            <div className="mx-auto mt-4 h-1 w-8 rounded-full bg-sky-200" />
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
            <article key={title} className="rounded-2xl border border-white bg-white/82 p-5 shadow-sm backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-500">{title}</p>
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
