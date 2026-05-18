import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Aincarn Tools',
  description: 'Aincarnで提供しているAI比較、料金比較、サブスク管理ツールの一覧です。',
}

const tools = [
  {
    href: '/tools/ai-model-compare',
    label: 'AIモデル比較',
    body: '賢さ、速度、価格効率を用途別に比較します。',
    accent: 'from-[#f0187a] to-[#ff6b28]',
  },
  {
    href: '/tools/ai-pricing',
    label: 'AI料金比較',
    body: '月間利用量を入力して、API・画像・動画生成の概算コストを比較します。',
    accent: 'from-[#ff6b28] to-[#ffe431]',
  },
  {
    href: '/tools/subscriptions',
    label: 'AIサブスク管理',
    body: '契約中のAIサービス、更新日、月額換算コストをアカウントごとに保存します。',
    accent: 'from-[#5bb8ff] to-[#c72991]',
  },
]

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="rounded-[28px] border border-white/80 bg-white/86 p-6 shadow-sm shadow-rose-900/5 backdrop-blur sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Tools</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">Aincarn Tools</h1>
        <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-gray-500">
          AIを選ぶ、料金を見積もる、契約を管理する。Aincarnの比較体験をここから使えます。
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-[24px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-rose-900/5 backdrop-blur transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-rose-900/10"
          >
            <div className={`mb-5 h-2 w-20 rounded-full bg-gradient-to-r ${tool.accent}`} />
            <h2 className="text-xl font-black text-brand-text">{tool.label}</h2>
            <p className="mt-3 text-sm font-bold leading-relaxed text-gray-500">{tool.body}</p>
            <span className="mt-6 inline-flex rounded-full bg-brand-text px-4 py-2 text-xs font-black text-white transition group-hover:bg-rose-500">
              開く
            </span>
          </Link>
        ))}
      </section>
    </main>
  )
}
