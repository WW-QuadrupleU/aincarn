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
    label: 'AI性能比較',
    body: '賢さ、速度、価格効率を横並びで見て、用途に合うAIを探します。',
    tag: 'Compare',
    metric: '3指標',
    accent: 'from-indigo-500 via-sky-400 to-cyan-300',
    soft: 'from-indigo-50 to-cyan-50',
  },
  {
    href: '/tools/ai-pricing',
    label: 'AI料金比較',
    body: 'サブスク料金とAPI利用料を分けて、月額の目安を比較します。',
    tag: 'Pricing',
    metric: '月額換算',
    accent: 'from-emerald-400 via-teal-400 to-sky-400',
    soft: 'from-emerald-50 to-sky-50',
  },
  {
    href: '/tools/subscriptions',
    label: 'AIサブスク管理',
    body: '契約中のAIサービス、更新日、月額換算コストをアカウントごとに保存します。',
    tag: 'Collection',
    metric: '個別保存',
    accent: 'from-fuchsia-500 via-rose-400 to-orange-300',
    soft: 'from-fuchsia-50 to-orange-50',
  },
]

const toolStories = [
  {
    href: '/tools/ai-model-compare',
    label: 'AI性能比較',
    eyebrow: 'Model Intelligence',
    title: 'モデルの強さを、用途ごとに静かに比較する。',
    body: '公開ベンチマーク、速度、価格効率を用途別に整理。文章、コード、リサーチ、画像、動画など、自分の作業に効く指標だけを見やすく並べます。',
    stats: ['Intelligence', 'Speed', 'Value'],
    accent: 'from-indigo-500 via-sky-400 to-cyan-300',
  },
  {
    href: '/tools/ai-pricing',
    label: 'AI料金比較',
    eyebrow: 'Cost Simulator',
    title: '複雑なAI料金を、月額感覚に変換する。',
    body: 'サブスク、API、画像生成、動画生成は単位が違います。利用量を入れて同じ尺度に変換し、課金判断をシンプルにします。',
    stats: ['Plan', 'API', 'Usage'],
    accent: 'from-emerald-400 via-teal-400 to-sky-400',
  },
  {
    href: '/tools/subscriptions',
    label: 'AIサブスク管理',
    eyebrow: 'Subscription Collection',
    title: '増えていくAIサブスクを、ひとつの場所で管理する。',
    body: 'ChatGPT、Claude、Gemini、Midjourneyなどをカードとして保存。更新日、月額換算、ジャンルを見ながら、いま契約しているAIを整理できます。',
    stats: ['Cards', 'Renewal', 'Total'],
    accent: 'from-fuchsia-500 via-rose-400 to-orange-300',
  },
]

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:pb-20 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="inline-flex rounded-full border border-white/80 bg-white/82 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
                Aincarn
              </p>
              <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight text-slate-950 sm:text-7xl">
                AIを選ぶ時間を、
                <span className="block bg-gradient-to-r from-indigo-600 via-sky-500 to-teal-400 bg-clip-text text-transparent">
                  もっと美しく。
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base font-semibold leading-relaxed text-slate-600 sm:text-lg">
                Aincarnは、AIモデルの性能、料金、サブスクをひとつの視点で整理する比較ツールです。
                迷いを減らし、今月どのAIに課金するかを落ち着いて判断できます。
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <SmoothHashLink
                  href="#tools"
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  ツールを選ぶ
                </SmoothHashLink>
                <Link
                  href="/about"
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  Aincarnについて
                </Link>
              </div>
            </div>

            <div className="rounded-[36px] border border-white/80 bg-white/78 p-3 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl">
              <div className="overflow-hidden rounded-[28px] border border-white/15 bg-slate-950 p-5 text-white shadow-inner shadow-white/10">
                <div className="mb-5 h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-rose-300" />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Decision Panel</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight">AIの選び方を、3つに分ける。</h2>
                  </div>
                  <div className="grid size-12 place-items-center rounded-2xl bg-white text-sm font-black text-slate-950">AI</div>
                </div>
                <div className="mt-6 grid gap-3">
                  {[
                    ['Performance', '賢さ・速度・価格効率', 'from-indigo-400 to-sky-300'],
                    ['Pricing', 'サブスク・API・生成単価', 'from-emerald-300 to-teal-300'],
                    ['Collection', '契約中サービスと更新日', 'from-fuchsia-400 to-orange-300'],
                  ].map(([label, body, accent], index) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">{label}</p>
                          <p className="mt-1 text-sm font-bold text-white/84">{body}</p>
                        </div>
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-white/10">
                          <div className={`h-full rounded-full bg-gradient-to-r ${accent}`} style={{ width: `${86 - index * 16}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div id="tools" className="mb-7 scroll-mt-28">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tools</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">必要な比較を選ぶ</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br ${tool.soft} p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:shadow-2xl hover:shadow-slate-950/10`}
            >
              <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${tool.accent}`} />
              <div className="mb-8 flex items-center justify-between gap-3">
                <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 shadow-sm shadow-slate-950/5">
                  {tool.tag}
                </span>
                <span className="text-xs font-black text-slate-400">{tool.metric}</span>
              </div>
              <h3 className="text-2xl font-black tracking-tight text-slate-950">{tool.label}</h3>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{tool.body}</p>
              <span className={`mt-8 inline-flex rounded-full bg-gradient-to-r ${tool.accent} px-4 py-2 text-xs font-black text-white shadow-sm shadow-slate-950/10 transition group-hover:scale-[1.02]`}>
                開く
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-5">
          {toolStories.map((tool) => (
            <article
              key={tool.href}
              className="grid overflow-hidden rounded-[36px] border border-white/80 bg-white/80 shadow-xl shadow-slate-950/5 backdrop-blur-xl lg:grid-cols-[1fr_360px]"
            >
              <div className="p-6 sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">{tool.eyebrow}</p>
                <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{tool.title}</h2>
                <p className="mt-4 max-w-3xl text-sm font-semibold leading-relaxed text-slate-600">{tool.body}</p>
                <Link
                  href={tool.href}
                  className="mt-7 inline-flex rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-900 shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  {tool.label}を開く
                </Link>
              </div>
              <div className="border-t border-slate-100 bg-slate-50/80 p-6 lg:border-l lg:border-t-0">
                <div className="grid h-full content-center gap-3">
                  {tool.stats.map((stat, index) => (
                    <div key={stat} className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-950/5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400">{stat}</p>
                        <p className="text-sm font-black text-slate-950">{index === 0 ? 'High' : index === 1 ? 'Fast' : 'Clear'}</p>
                      </div>
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full bg-gradient-to-r ${tool.accent}`} style={{ width: `${88 - index * 17}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
