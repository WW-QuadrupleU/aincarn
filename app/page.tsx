import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import SmoothHashLink from '@/components/SmoothHashLink'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Aincarn | AIモデル・料金を比較する実用ツール',
  description:
    'Aincarnは、AIモデル比較、AI料金比較、Aincarn Labの比較ログをまとめた実用サイトです。性能、速度、価格、用途を整理して、AI選びを判断しやすくします。',
}

const tools = [
  {
    href: '/tools/ai-model-compare',
    label: 'AIモデル比較',
    bodyChunks: [
      '主要AIモデルの賢さ、',
      '速度、',
      '価格効率を',
      '横並びで比較します。',
      '用途ごとの',
      '向き不向きを、',
      'まず数値で',
      '把握できます。',
    ],
    tag: 'Performance',
    metric: '性能・速度・価格',
    img: '/images/tool-performance.png',
    accent: 'from-indigo-500 via-sky-400 to-cyan-300',
    soft: 'from-indigo-50 to-cyan-50',
  },
  {
    href: '/tools/ai-pricing',
    label: 'AI料金比較',
    bodyChunks: [
      '料金プラン比較、',
      'API料金シミュレータ、',
      '損益分岐を',
      'まとめて確認できます。',
      '用途に合う',
      '課金方法を',
      '整理します。',
    ],
    tag: 'Pricing',
    metric: '月額・API',
    img: '/images/tool-pricing.png',
    accent: 'from-emerald-400 via-teal-400 to-sky-400',
    soft: 'from-emerald-50 to-sky-50',
  },
  {
    href: '/tools/subscriptions',
    label: 'AIサブスク管理',
    bodyChunks: [
      '契約中の',
      'AIサブスクを',
      'まとめて管理。',
      'プラン、',
      '料金、',
      '更新日、',
      'ステータスを',
      '一覧で把握できます。',
    ],
    tag: 'Management',
    metric: 'サブスク',
    img: '/images/tool-management.png',
    accent: 'from-violet-500 via-purple-400 to-fuchsia-300',
    soft: 'from-violet-50 to-fuchsia-50',
  },
]

const heroStats = [
  { value: '11', label: 'AIサービス' },
  { value: '32', label: '料金プラン' },
  { value: '3', label: '比較ツール' },
]

const principles = [
  {
    title: '公開データと実測ログを分ける',
    bodyChunks: [
      '公開ベンチマーク、',
      '公式料金、',
      'Aincarn Labの',
      '比較ログを',
      '混ぜずに整理し、',
      '情報源の',
      '性質が分かるようにします。',
    ],
  },
  {
    title: '用途別に翻訳する',
    bodyChunks: [
      '単なる総合点だけでなく、',
      '文章作成、',
      'コード、',
      '調査、',
      '画像、',
      '動画などの',
      '使い方に合わせて',
      '判断しやすくします。',
    ],
  },
  {
    title: 'その時点の条件で見る',
    bodyChunks: [
      'AIは頻繁に',
      '更新されます。',
      '比較日、',
      '使用モデル、',
      'プロンプトを残し、',
      'モデルごとの',
      '変化を追える形にします。',
    ],
  },
]

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden px-4 pb-16 pt-16 sm:pb-20 sm:pt-24">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/82 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
                <span className="live-dot inline-block size-1.5 rounded-full bg-emerald-500" />
                Aincarn · AI比較ハブ
              </p>
              <h1 className="animate-fade-up mt-7 max-w-4xl text-[2.2rem] font-black leading-[1.02] tracking-tight text-slate-950 [animation-delay:80ms] min-[360px]:text-[2.5rem] min-[390px]:text-[2.8rem] sm:text-[3.5rem] md:text-7xl">
                <span className="inline-block">AI選びを、</span>
                <span className="text-shimmer block whitespace-nowrap bg-gradient-to-r from-indigo-600 via-sky-500 to-teal-400 bg-clip-text text-transparent">
                  使う前に整理する。
                </span>
              </h1>
              <p className="animate-fade-up mt-6 max-w-2xl text-base font-semibold leading-relaxed text-slate-600 [animation-delay:160ms] sm:text-lg">
                <span className="inline-block">Aincarnは、</span>
                <span className="inline-block">AIモデルの性能、</span>
                <span className="inline-block">AI料金、</span>
                <span className="inline-block">実際の比較ログを</span>
                <span className="inline-block">ひとつの視点で</span>
                <span className="inline-block">整理するサイトです。</span>
                <br className="hidden sm:inline" />
                <span className="inline-block">公開データと</span>
                <span className="inline-block">Aincarn Labの検証をもとに、</span>
                <span className="inline-block">今どのAIを</span>
                <span className="inline-block">使うべきか</span>
                <span className="inline-block">判断しやすくします。</span>
              </p>
              <div className="animate-fade-up mt-9 flex flex-wrap gap-3 [animation-delay:240ms]">
                <SmoothHashLink
                  href="#tools"
                  className="group relative overflow-hidden rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  <span className="shine-sweep" aria-hidden />
                  <span className="relative inline-flex items-center gap-1.5">
                    ツールを選ぶ
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </span>
                </SmoothHashLink>
                <Link
                  href="/lab"
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  Aincarn Labを見る
                </Link>
              </div>
              <div className="animate-fade-up mt-9 flex flex-wrap gap-6 [animation-delay:320ms]">
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-3xl font-black tracking-tight text-slate-950 tabular-nums">{stat.value}</p>
                    <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-fade-up rounded-[36px] border border-white/80 bg-white/78 p-3 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl [animation-delay:200ms]">
              <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-slate-950 text-white shadow-inner shadow-white/10">
                <div className="flow-bar absolute left-5 right-5 top-5 z-10 h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-rose-300 shadow-lg shadow-sky-500/15" />
                <Image
                  src="/images/A_modern_editorial_hero_image_202605282220.jpeg"
                  alt="AIモデル比較と料金判断を表すAincarnのビジュアル"
                  width={2048}
                  height={1024}
                  priority
                  className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/78 to-transparent p-4 pt-16 sm:p-5 sm:pt-20">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/55 sm:text-xs">Decision Panel</p>
                  <h2 className="mt-1 text-xl font-black tracking-tight sm:mt-2 sm:text-2xl">AI選びの判断軸</h2>
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4">
                    {[
                      ['Performance', '賢さ・速度'],
                      ['Pricing', '月額・API'],
                      ['Compare', '比較ログ'],
                    ].map(([label, body]) => (
                      <div key={label} className="rounded-2xl border border-white/12 bg-white/[0.08] p-2 backdrop-blur-md sm:p-3">
                        <p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/45 sm:text-[10px]">{label}</p>
                        <p className="mt-0.5 text-[11px] font-bold text-white/86 sm:mt-1 sm:text-xs">{body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <div id="tools" className="mb-7 scroll-mt-28">
          <p className="apple-eyebrow">Tools</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            <span className="inline-block">目的に合わせて</span>
            <span className="inline-block">使う</span>
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((tool, index) => (
            <div
              key={tool.href}
              className="group animate-fade-up relative"
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div
                aria-hidden
                className={`pointer-events-none absolute -inset-1.5 -z-10 rounded-[34px] bg-gradient-to-r ${tool.accent} opacity-0 blur-2xl transition duration-500 group-hover:opacity-25`}
              />
              <Link
                href={tool.href}
                className={`relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br ${tool.soft} p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl transition duration-300 group-hover:-translate-y-1.5 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-slate-950/10`}
              >
                <span className="shine-sweep" aria-hidden />
                <div className={`flow-bar mb-5 h-2 rounded-full bg-gradient-to-r ${tool.accent}`} />
                <div className="mb-6 flex items-center justify-between gap-3">
                  <span className="grid size-14 place-items-center rounded-2xl border border-white/80 bg-white/85 shadow-lg shadow-slate-950/10 ring-1 ring-slate-900/5 transition duration-300 group-hover:scale-[1.06] group-hover:shadow-xl">
                    <Image src={tool.img} alt="" width={44} height={44} className="size-11 object-contain drop-shadow-sm" />
                  </span>
                  <span className="text-xs font-black text-slate-400">{tool.metric}</span>
                </div>
                <span className="self-start rounded-full border border-white/80 bg-white/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-600 shadow-sm shadow-slate-950/5">
                  {tool.tag}
                </span>
                <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950">{tool.label}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                  {tool.bodyChunks.map((chunk, chunkIndex) => (
                    <span key={chunkIndex} className="inline-block">{chunk}</span>
                  ))}
                </p>
                <span className={`mt-7 inline-flex items-center gap-1.5 self-start rounded-full bg-gradient-to-r ${tool.accent} px-4 py-2 text-xs font-black text-white shadow-sm shadow-slate-950/10`}>
                  開く
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <Link
          href="/lab"
          className="group relative grid overflow-hidden rounded-[36px] border border-slate-900/80 bg-slate-950 text-white shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 hover:shadow-slate-950/30 lg:grid-cols-[1fr_360px]"
        >
          <Image
            src="/images/hero-neural.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="pointer-events-none absolute inset-0 object-cover opacity-45 mix-blend-screen"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/30" aria-hidden="true" />
          <span className="shine-sweep" aria-hidden />
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/20 to-transparent blur-3xl" aria-hidden="true" />
          <div className="relative p-6 sm:p-8">
            <div className="flow-bar h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-rose-300" />
            <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-white/45">Compare</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">AINCARN LAB</h2>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-white/68">
              <span className="inline-block">最新モデルに</span>
              <span className="inline-block">同じプロンプトを投げ、</span>
              <span className="inline-block">文章作成、</span>
              <span className="inline-block">コード生成、</span>
              <span className="inline-block">調査・要約などの</span>
              <span className="inline-block">結果を用途別に</span>
              <span className="inline-block">蓄積します。</span>
              <br className="hidden sm:inline" />
              <span className="inline-block">単なる印象ではなく、</span>
              <span className="inline-block">比較日・使用モデル・</span>
              <span className="inline-block">評価軸を残して、</span>
              <span className="inline-block">AIの変化を</span>
              <span className="inline-block">追えるログに</span>
              <span className="inline-block">していきます。</span>
            </p>
            <span className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 transition group-hover:scale-[1.02]">
              比較ログを見る
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
          </div>
          <div className="relative border-t border-white/10 bg-white/[0.04] p-6 lg:border-l lg:border-t-0">
            <div className="grid gap-3">
              {['文章作成比較ログ', 'コード生成比較ログ', '調査・要約比較ログ'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-black text-white/92 transition group-hover:border-white/20">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-[36px] border border-white/80 bg-white/84 p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl sm:p-8">
          <p className="apple-eyebrow">Editorial Policy</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
            <span className="inline-block">Aincarnの</span>
            <span className="inline-block">比較方針</span>
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {principles.map((item, index) => (
              <article
                key={item.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5 transition hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-xl hover:shadow-slate-950/5"
              >
                <span className="absolute -right-2 -top-3 text-7xl font-black text-slate-900/[0.04] tabular-nums">
                  {index + 1}
                </span>
                <h3 className="relative text-lg font-black text-slate-950">{item.title}</h3>
                <p className="relative mt-3 text-sm font-semibold leading-relaxed text-slate-600">
                  {item.bodyChunks.map((chunk, chunkIndex) => (
                    <span key={chunkIndex} className="inline-block">{chunk}</span>
                  ))}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
