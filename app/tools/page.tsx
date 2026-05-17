import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Aincarn Tools',
  description: 'Aincarnで提供しているAIモデル比較ツール一覧です。',
}

export default function ToolsPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <section className="rounded-[28px] border border-white bg-white/84 p-8 shadow-sm backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Tools</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">Aincarn Tools</h1>
        <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-gray-500">
          初期版ではAIモデル比較ツールのみを公開しています。AIサブスク診断や実測テストビューは順次追加します。
        </p>
        <Link
          href="/tools/ai-model-compare"
          className="mt-6 inline-flex rounded-full bg-brand-text px-5 py-3 text-sm font-black text-white transition hover:bg-gray-700"
        >
          AIモデル比較を見る
        </Link>
      </section>
    </main>
  )
}
