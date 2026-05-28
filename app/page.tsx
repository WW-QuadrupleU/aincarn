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
    body: '主要AIモデルの賢さ、速度、価格効率を横並びで比較します。用途ごとの向き不向きを、まず数値で把握できます。',
    tag: 'Performance',
    metric: '性能・速度・価格',
    accent: 'from-indigo-500 via-sky-400 to-cyan-300',
    soft: 'from-indigo-50 to-cyan-50',
  },
  {
    href: '/tools/ai-pricing',
    label: 'AI料金比較',
    body: '料金プラン比較、API料金シミュレータ、損益分岐をまとめて確認できます。用途に合う課金方法を整理します。',
    tag: 'Pricing',
    metric: '月額・API',
    accent: 'from-emerald-400 via-teal-400 to-sky-400',
    soft: 'from-emerald-50 to-sky-50',
  },
  {
    href: '/tools/subscriptions',
    label: 'AIサブスク管理',
    body: '契約中のAIサブスクをまとめて管理。プラン、料金、更新日、ステータスを一覧で把握できます。',
    tag: 'Management',
    metric: 'サブスク',
    accent: 'from-violet-500 via-purple-400 to-fuchsia-300',
    soft: 'from-violet-50 to-fuchsia-50',
  },
]

const principles = [
  {
    title: '公開データと実測ログを分ける',
    body: '公開ベンチマーク、公式料金、Aincarn Labの比較ログを混ぜずに整理し、情報源の性質が分かるようにします。',
  },
  {
    title: '用途別に翻訳する',
    body: '単なる総合点だけでなく、文章作成、コード、調査、画像、動画などの使い方に合わせて判断しやすくします。',
  },
  {
    title: 'その時点の条件で見る',
    body: 'AIは頻繁に更新されます。比較日、使用モデル、プロンプトを残し、モデルごとの変化を追える形にします。',
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
                AI選びを、
                <span className="block bg-gradient-to-r from-indigo-600 via-sky-500 to-teal-400 bg-clip-text text-transparent">
                  使う前に整理する。
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-base font-semibold leading-relaxed text-slate-600 sm:text-lg">
                Aincarnは、AIモデルの性能、AI料金、実際の比較ログをひとつの視点で整理するサイトです。
                公開データとAincarn Labの検証をもとに、今どのAIを使うべきか判断しやすくします。
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <SmoothHashLink
                  href="#tools"
                  className="rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  ツールを選ぶ
                </SmoothHashLink>
                <Link
                  href="/lab"
                  className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-black text-slate-800 shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300"
                >
                  Aincarn Labを見る
                </Link>
              </div>
            </div>

            <div className="rounded-[36px] border border-white/80 bg-white/78 p-3 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl">
              <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-slate-950 text-white shadow-inner shadow-white/10">
                <Image
                  src="/images/A_modern_editorial_hero_image_202605282220.jpeg"
                  alt="AIモデル比較と料金判断を表すAincarnのビジュアル"
                  width={2048}
                  height={1024}
                  priority
                  className="aspect-[16/10] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/78 to-transparent p-5 pt-20">
                  <div className="mb-4 h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-rose-300" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Decision Panel</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">AI選びの判断軸</h2>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {[
                      ['Performance', '賢さ・速度'],
                      ['Pricing', '月額・API'],
                      ['Compare', '比較ログ'],
                    ].map(([label, body]) => (
                      <div key={label} className="rounded-2xl border border-white/12 bg-white/[0.08] p-3 backdrop-blur-md">
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/45">{label}</p>
                        <p className="mt-1 text-xs font-bold text-white/86">{body}</p>
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
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Tools</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">目的に合わせて使う</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br ${tool.soft} p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:shadow-2xl hover:shadow-slate-950/10`}
            >
              <div className={`mb-5 h-2 rounded-full bg-gradient-to-r ${tool.accent}`} />
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

      <section className="mx-auto max-w-6xl px-4 pb-12">
        <Link
          href="/lab"
          className="group grid overflow-hidden rounded-[36px] border border-slate-900/80 bg-slate-950 text-white shadow-2xl shadow-slate-950/20 transition hover:-translate-y-1 hover:shadow-slate-950/30 lg:grid-cols-[1fr_360px]"
        >
          <div className="p-6 sm:p-8">
            <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-rose-300" />
            <p className="mt-7 text-xs font-black uppercase tracking-[0.2em] text-white/45">Compare</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">AINCARN LAB</h2>
            <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-white/68">
              最新モデルに同じプロンプトを投げ、文章作成、コード生成、調査・要約などの結果を用途別に蓄積します。
              単なる印象ではなく、比較日・使用モデル・評価軸を残して、AIの変化を追えるログにしていきます。
            </p>
            <span className="mt-7 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 transition group-hover:scale-[1.02]">
              比較ログを見る
            </span>
          </div>
          <div className="border-t border-white/10 bg-white/[0.04] p-6 lg:border-l lg:border-t-0">
            <div className="grid gap-3">
              {['文章作成比較ログ', 'コード生成比較ログ', '調査・要約比較ログ'].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 text-sm font-black text-white/92">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="rounded-[36px] border border-white/80 bg-white/84 p-6 shadow-xl shadow-slate-950/5 backdrop-blur-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Editorial Policy</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Aincarnの比較方針</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {principles.map((item) => (
              <article key={item.title} className="rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5">
                <h3 className="text-lg font-black text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
