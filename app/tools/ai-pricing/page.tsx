import type { Metadata } from 'next'
import AiPricingTool from '@/components/AiPricingTool'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'AI料金比較',
  description:
    'ChatGPT、Claude、Geminiなど主要なAIサービスの料金プラン、API従量課金コスト、定額サブスクとの損益分岐点を比較できるツールです。',
}

export default function AiPricingPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="mb-6 rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">AI Pricing</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">AI料金比較ツール</h1>
          <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-slate-600">
            月額サブスク、API従量課金、利用量ごとの損益分岐をまとめて確認するためのツールです。
            AIサービスの料金や利用制限は変わりやすいため、表示内容は目安として扱い、契約前には公式ページを確認してください。
          </p>
        </section>
        <AiPricingTool />
        <section className="mt-6 rounded-[28px] border border-white/80 bg-white/84 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
          <h2 className="text-xl font-black tracking-tight text-slate-950">料金比較で注意したいこと</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {[
              ['月額とAPIは別料金', 'ChatGPT Plusなどの月額プランを契約しても、API利用料が無料になるわけではありません。'],
              ['少量利用はAPIが有利な場合もある', 'ただし長文処理や自動化を多く回すと、月額プランより高くなる可能性があります。'],
              ['価格は変動する', '為替、税、地域、アプリストア経由の価格差、プラン改定に注意が必要です。'],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <h3 className="text-sm font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-xs font-bold leading-relaxed text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
