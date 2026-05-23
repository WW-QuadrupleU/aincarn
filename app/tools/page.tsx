import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Aincarn Tools',
  description: 'Aincarnで提供しているAI比較、料金比較、サブスク管理ツールの一覧です。',
}

const tools = [
  {
    href: '/tools/ai-model-compare',
    label: 'AI性能比較',
    body: '賢さ、速度、価格効率を用途別に比較します。',
    meta: 'Performance',
  },
  {
    href: '/tools/ai-pricing',
    label: 'AI料金比較',
    body: '月間利用量を入力して、API・画像・動画生成の概算コストを比較します。',
    meta: 'Pricing',
  },
  {
    href: '/tools/subscriptions',
    label: 'AIサブスク管理',
    body: '契約中のAIサービス、更新日、月額換算コストをアカウントごとに保存します。',
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
          AIを選ぶ、料金を見積もる、契約を管理する。Aincarnの比較体験をここから使えます。
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
