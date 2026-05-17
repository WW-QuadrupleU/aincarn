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
  ['Composite score', '公開ベンチマーク、価格、速度、用途適性を総合評価'],
  ['Use-case lens', 'リサーチ、文章、コード、画像、動画で用途別に比較'],
  ['Subscription view', '性能だけでなくコスパと課金判断を並べて見る'],
]

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden px-4 py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-aurora" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.36),transparent_26%),radial-gradient(circle_at_78%_36%,rgba(255,126,54,0.26),transparent_32%),linear-gradient(90deg,rgba(91,24,113,0.30)_0%,rgba(224,35,107,0.14)_48%,rgba(255,126,24,0.08)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#fbf7ff] via-[#fbf7ff]/82 to-transparent" />
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_420px] lg:items-end">
          <div className="rounded-[32px] border border-white/42 bg-gradient-to-br from-fuchsia-950/46 via-rose-700/28 to-orange-500/18 p-6 text-white shadow-2xl shadow-fuchsia-900/18 backdrop-blur-lg sm:p-8">
            <p className="mb-4 inline-flex rounded-full border border-white/40 bg-white/18 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur">
              Aincarn
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.24)] sm:text-6xl">
              AIの違いを、
              <span className="block text-white">使う前に測る。</span>
            </h1>
            <p className="mt-6 max-w-2xl text-sm font-bold leading-relaxed text-white sm:text-base">
              Aincarnは、AIモデルとAIサブスクを用途別に比較するメディアです。
              公開ベンチマーク、料金、速度、使い勝手、今後の実測データを合わせて、どのAIに課金すべきかを整理します。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="#compare"
                className="rounded-full bg-white px-5 py-3 text-sm font-black text-brand-text shadow-2xl shadow-rose-600/20 transition hover:-translate-y-0.5 hover:bg-yellow-50"
              >
                比較ツールを見る
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-white/42 bg-white/18 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/26"
              >
                Aincarnについて
              </Link>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/70 bg-white/82 p-6 shadow-2xl shadow-rose-900/12 backdrop-blur-xl">
            <p className="text-center text-sm font-black text-brand-text">あなたに合うAIは...</p>
            <h2 className="mt-3 text-center text-3xl font-black text-[#f0187a]">用途で変わる</h2>
            <div className="mx-auto mt-4 h-1 w-8 rounded-full bg-gradient-to-r from-yellow-300 via-rose-400 to-sky-400" />
            <div className="mt-7 space-y-4 text-sm font-bold leading-relaxed text-slate-700">
              <p>
                文章作成に強いAI、コードに強いAI、リサーチに強いAIは同じではありません。
                Aincarnではモデルの個性を、用途別スコアとコスト感に分けて見ます。
              </p>
              <p>
                今後は、自分で契約しているAIサブスクの実測テストも追加し、数値だけでは見えない使い勝手まで整理します。
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
          {signals.map(([title, body], index) => (
            <article
              key={title}
              className="rounded-2xl border border-white/75 bg-white/86 p-5 shadow-sm shadow-rose-900/5 backdrop-blur"
            >
              <div
                className={`mb-4 h-1.5 w-16 rounded-full ${
                  index === 0
                    ? 'bg-gradient-to-r from-yellow-300 to-orange-400'
                    : index === 1
                      ? 'bg-gradient-to-r from-rose-500 to-fuchsia-500'
                      : 'bg-gradient-to-r from-sky-400 to-cyan-300'
                }`}
              />
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
            公開ベンチマーク、料金、速度、文脈長、用途別の強みを合わせてAincarn総合スコアとして整理します。独自の実測データ、サブスク制限、UIの使い勝手も順次追加します。
          </p>
        </div>
        <AiModelCompareTool />
      </section>
    </>
  )
}
