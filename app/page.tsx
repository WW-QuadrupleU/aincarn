import type { Metadata } from 'next'
import Link from 'next/link'
import SmoothHashLink from '@/components/SmoothHashLink'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Aincarn | AIモデルとサブスクを実測で比較する',
  description:
    'Aincarnは、AIモデルの公開ベンチマーク、料金、用途別の使いどころを整理し、どのAIに課金すべきかを判断しやすくする比較サイトです。',
}

const tools = [
  {
    href: '/tools/ai-model-compare',
    label: 'AIモデル比較',
    body: '賢さ、速度、価格効率を横並びで見て、用途に合うAIを探します。',
    accent: 'from-[#f0187a] via-[#ff6b28] to-[#ffe431]',
    tag: 'Model',
  },
  {
    href: '/tools/ai-pricing',
    label: 'AI料金比較',
    body: 'サブスク料金とAPI利用料を分けて、月額の目安を比較します。',
    accent: 'from-[#39a7ff] via-[#7c3cff] to-[#f0187a]',
    tag: 'Price',
  },
  {
    href: '/tools/subscriptions',
    label: 'AIサブスク管理',
    body: '契約中のAIサービス、更新日、月額換算コストをアカウントごとに保存します。',
    accent: 'from-[#15f5ba] via-[#39a7ff] to-[#7c3cff]',
    tag: 'Collection',
  },
]

const toolStories = [
  {
    href: '/tools/ai-model-compare',
    label: 'AIモデル比較',
    eyebrow: 'Performance Lens',
    title: 'モデルの強さを、用途ごとに眺める。',
    body: '賢さ、速度、価格効率を並べ、文章、コード、リサーチ、画像、動画などの用途に合わせて見比べます。ランキングだけでなく、どの指標が自分の使い方に効くかを掴むための入口です。',
    accent: 'from-[#f0187a] via-[#ff6b28] to-[#ffe431]',
    metrics: ['Intelligence', 'Speed', 'Price'],
  },
  {
    href: '/tools/ai-pricing',
    label: 'AI料金比較',
    eyebrow: 'Cost Simulator',
    title: 'サブスクとAPI料金を、月額感覚に変換する。',
    body: 'チャット型の月額プランと、API、画像生成、動画生成の従量課金は比較しづらいもの。利用量を入れて月額の目安に変換し、課金判断をしやすくします。',
    accent: 'from-[#39a7ff] via-[#7c3cff] to-[#f0187a]',
    metrics: ['Plan', 'API', 'Usage'],
  },
  {
    href: '/tools/subscriptions',
    label: 'AIサブスク管理',
    eyebrow: 'Subscription Collection',
    title: '契約中のAIを、カードで集めて管理する。',
    body: 'ChatGPT、Claude、Gemini、Midjourneyなどのプランをコレクションとして保存。更新日、月額換算、ジャンル別コストを見ながら、増えがちなAIサブスクを整理できます。',
    accent: 'from-[#15f5ba] via-[#39a7ff] to-[#7c3cff]',
    metrics: ['Cards', 'Renewal', 'Total'],
  },
]

export default function HomePage() {
  return (
    <>
      <section className="relative isolate overflow-hidden px-4 pb-14 pt-14 sm:pb-16 sm:pt-20">
        <div className="absolute inset-0 -z-10 bg-aurora" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_16%_18%,rgba(255,255,255,0.40),transparent_26%),radial-gradient(circle_at_78%_36%,rgba(255,126,54,0.24),transparent_32%),linear-gradient(90deg,rgba(91,24,113,0.24)_0%,rgba(224,35,107,0.12)_48%,rgba(255,126,24,0.06)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-[#fbf7ff] via-[#fbf7ff]/82 to-transparent" />
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_420px] lg:items-stretch">
          <div className="relative overflow-hidden rounded-[32px] border border-white/48 bg-gradient-to-br from-fuchsia-950/48 via-rose-700/30 to-orange-500/18 p-6 text-white shadow-2xl shadow-fuchsia-900/18 backdrop-blur-lg sm:p-8 lg:p-10">
            <div className="absolute right-6 top-6 h-28 w-28 rounded-full bg-yellow-300/20 blur-2xl" />
            <div className="absolute bottom-4 right-24 h-24 w-24 rounded-full bg-sky-300/18 blur-2xl" />
            <p className="relative mb-5 inline-flex rounded-full border border-white/40 bg-white/18 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-white backdrop-blur">
              AI model intelligence
            </p>
            <h1 className="relative max-w-3xl text-4xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_18px_rgba(0,0,0,0.24)] sm:text-6xl">
              AIの違いを、
              <span className="block text-white">使う前に測る。</span>
            </h1>
            <p className="relative mt-6 max-w-2xl text-sm font-bold leading-relaxed text-white/94 sm:text-base">
              Aincarnは、AIモデルとAIサブスクを用途別に比較するメディアです。
              公開ベンチマーク、料金、速度、今後の実測データを合わせて、どのAIに課金すべきかを整理します。
            </p>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <SmoothHashLink
                href="#tools"
                className="rounded-full bg-white px-5 py-3 text-sm font-black text-brand-text shadow-2xl shadow-rose-600/20 transition hover:-translate-y-0.5 hover:bg-yellow-50"
              >
                ツールを選ぶ
              </SmoothHashLink>
              <Link
                href="/about"
                className="rounded-full border border-white/42 bg-white/18 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-white/26"
              >
                Aincarnについて
              </Link>
            </div>
            <div className="relative mt-8 grid max-w-xl grid-cols-3 gap-3">
              {['Live', 'Metrics', 'Use cases'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/20 bg-white/12 px-3 py-3 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/64">{item}</p>
                  <p className="mt-1 text-sm font-black text-white">
                    {item === 'Live' ? '自動更新' : item === 'Metrics' ? '3指標' : '3カテゴリ'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-[28px] border border-white/70 bg-white/86 p-6 shadow-2xl shadow-rose-900/12 backdrop-blur-xl">
            <div>
              <p className="text-sm font-black text-brand-text">あなたに合うAIは...</p>
              <h2 className="mt-3 text-3xl font-black text-[#f0187a]">用途で変わる</h2>
              <div className="mt-4 h-1 w-10 rounded-full bg-gradient-to-r from-yellow-300 via-rose-400 to-sky-400" />
              <div className="mt-7 space-y-4 text-sm font-bold leading-relaxed text-slate-700">
                <p>
                  文章作成に強いAI、コードに強いAI、リサーチに強いAIは同じではありません。
                  Aincarnではモデルの個性を、賢さ・速度・価格効率に分けて見ます。
                </p>
                <p>
                  迷ったときに「今月どのAIへ課金するか」を決められるサイトへ育てていきます。
                </p>
              </div>
            </div>
            <div className="mt-7 grid gap-3">
              {[
                ['Research', '長文、調査、出典確認'],
                ['Coding', '実装、設計、デバッグ'],
                ['Creative', '画像、動画、素材制作'],
              ].map(([label, body]) => (
                <div key={label} className="rounded-2xl border border-slate-200/70 bg-white/76 px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d33472]">{label}</p>
                  <p className="mt-1 text-sm font-bold text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div id="tools" className="mb-6 scroll-mt-28">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Choose Tool</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-brand-text">何を比較しますか？</h2>
          <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-gray-500">
            Aincarnのトップページから、モデル性能、料金、サブスク管理へそのまま移動できます。
          </p>
        </div>
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {tools.map((tool) => {
            const content = (
              <>
                <div className={`mb-5 h-2 w-24 rounded-full bg-gradient-to-r ${tool.accent}`} />
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-gray-500">
                  {tool.tag}
                </span>
                <h3 className="mt-4 text-xl font-black text-brand-text">{tool.label}</h3>
                <p className="mt-3 text-sm font-bold leading-relaxed text-gray-500">{tool.body}</p>
                <span className="mt-6 inline-flex rounded-full bg-brand-text px-4 py-2 text-xs font-black text-white transition group-hover:bg-rose-500">
                  開く
                </span>
              </>
            )

            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group rounded-[24px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-rose-900/5 backdrop-blur transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-rose-900/10"
              >
                {content}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-5">
          {toolStories.map((tool, index) => (
            <article
              key={tool.href}
              className="overflow-hidden rounded-[32px] border border-white/80 bg-white/88 shadow-xl shadow-rose-900/8 backdrop-blur"
            >
              <div className={`grid gap-0 lg:grid-cols-[1fr_420px] ${index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <div className="p-6 sm:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">{tool.eyebrow}</p>
                  <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-brand-text sm:text-4xl">{tool.title}</h2>
                  <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-gray-600">{tool.body}</p>
                  <Link
                    href={tool.href}
                    className="mt-6 inline-flex rounded-full bg-brand-text px-5 py-3 text-sm font-black text-white shadow-sm shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-rose-500"
                  >
                    {tool.label}を開く
                  </Link>
                </div>
                <div className={`relative min-h-[240px] bg-gradient-to-br ${tool.accent} p-6 text-white`}>
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/18 to-transparent" />
                  <div className="relative grid h-full content-between gap-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full border border-white/35 bg-white/16 px-3 py-1.5 text-xs font-black uppercase tracking-[0.16em] backdrop-blur">
                        Aincarn
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-brand-text">{tool.label}</span>
                    </div>
                    <div className="grid gap-3">
                      {tool.metrics.map((metric, metricIndex) => (
                        <div key={metric} className="rounded-2xl border border-white/24 bg-white/16 p-3 backdrop-blur">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs font-black uppercase tracking-[0.14em] text-white/74">{metric}</span>
                            <span className="text-sm font-black">{metricIndex === 0 ? 'High' : metricIndex === 1 ? 'Compare' : 'Track'}</span>
                          </div>
                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/18">
                            <div
                              className="h-full rounded-full bg-white"
                              style={{ width: `${86 - metricIndex * 18}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
