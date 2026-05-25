import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Aincarn Tools',
  description: 'Aincarnで提供しているAIモデル比較、API料金シミュレータ、AIサブスク管理ツールの一覧です。',
}

const tools = [
  {
    href: '/tools/ai-model-compare',
    label: 'AIモデル比較',
    body: '主要AIモデルの性能、速度、価格効率を用途別に比較します。',
    meta: 'Performance',
  },
  {
    href: '/tools/ai-pricing',
    label: 'API料金シミュレータ',
    body: 'API従量課金と定額サブスクの月額目安、損益分岐をまとめて確認できます。',
    meta: 'Pricing',
  },
  {
    href: '/tools/subscriptions',
    label: 'AIサブスク管理',
    body: '契約中のAIサービス、更新日、月額目安をアカウントごとに管理できます。',
    meta: 'Collection',
  },
]

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="rounded-[32px] border border-white/80 bg-white/82 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:p-8">
        <p className="apple-eyebrow">Tools</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Aincarn Tools</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed text-slate-600">
          AIを選ぶ、料金を見積もる、契約中のサブスクを管理する。Aincarnの比較ツールをここから利用できます。
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-[28px] border border-white/80 bg-white/82 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-slate-950/10"
          >
            <p className="mb-8 text-xs font-black uppercase tracking-[0.16em] text-slate-400">{tool.meta}</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-950">{tool.label}</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{tool.body}</p>
            <span className="mt-7 inline-flex rounded-full bg-slate-950 px-4 py-2 text-xs font-black text-white transition group-hover:bg-slate-800">
              開く
            </span>
          </Link>
        ))}
      </section>
    </main>
  )
}
