import type { Metadata } from 'next'
import Link from 'next/link'
import SmoothHashLink from '@/components/SmoothHashLink'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Aincarn | AIモデル・料金・サブスクを比較する実用ツール',
  description:
    'Aincarnは、AIモデル比較、AI料金比較、AIサブスク管理をまとめた実用ツールサイトです。性能、速度、価格、用途を整理して、AI選びを判断しやすくします。',
}

const tools = [
  {
    href: '/tools/ai-model-compare',
    label: 'AIモデル比較',
    body: '主要AIモデルの賢さ、速度、価格効率を横並びで比較します。用途別にどのAIを選ぶべきか確認できます。',
    tag: 'Compare',
    metric: '性能・速度・価格',
    accent: 'from-indigo-500 via-sky-400 to-cyan-300',
    soft: 'from-indigo-50 to-cyan-50',
  },
  {
    href: '/tools/ai-pricing',
    label: 'AI料金比較',
    body: '料金プラン比較、API料金シミュレータ、損益分岐の3つをまとめて確認できます。用途に合う課金方法を整理します。',
    tag: 'Pricing',
    metric: '月額・API',
    accent: 'from-emerald-400 via-teal-400 to-sky-400',
    soft: 'from-emerald-50 to-sky-50',
  },
  {
    href: '/tools/subscriptions',
    label: 'AIサブスク管理',
    body: '契約中のAIサブスク、更新日、月額目安をアカウントごとに保存します。使っているサービスを一覧で把握できます。',
    tag: 'Collection',
    metric: '契約・更新日',
    accent: 'from-fuchsia-500 via-rose-400 to-orange-300',
    soft: 'from-fuchsia-50 to-orange-50',
  },
]

const principles = [
  {
    title: '公開データと公式料金を分ける',
    body: '公開ベンチマーク、公式料金、販売ページ、実測予定データを混ぜずに整理し、情報源の性質が分かるようにします。',
  },
  {
    title: '用途別に翻訳する',
    body: '単なる総合点だけでなく、文章作成、コード、調査、画像、動画などの使い方に合わせて判断しやすくします。',
  },
  {
    title: 'コスト感を重視する',
    body: '高性能なAIでも、速度や単価が合わなければ日常利用では選びにくい場合があります。性能と費用のバランスを見ます。',
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
                Aincarnは、AIモデルの性能、API料金、サブスク管理をひとつの視点で整理する比較サイトです。
                公開データと公式料金をもとに、今どのAIに課金すべきかを判断しやすくします。
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
                  編集方針を見る
                </Link>
              </div>
            </div>

            <div className="rounded-[36px] border border-white/80 bg-white/78 p-3 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl">
              <div className="overflow-hidden rounded-[28px] border border-white/15 bg-slate-950 p-5 text-white shadow-inner shadow-white/10">
                <div className="mb-5 h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-rose-300" />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">Decision Panel</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight">AI選びの判断軸</h2>
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
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">目的に合わせて使う</h2>
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
