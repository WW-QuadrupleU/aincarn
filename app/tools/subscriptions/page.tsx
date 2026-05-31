import type { Metadata } from 'next'
import SubscriptionManager from '@/components/SubscriptionManager'

export const metadata: Metadata = {
  title: 'AIサブスク管理',
  description:
    '主要AIサービスを選んでプラン、料金、更新日、ステータスをアカウントごとに保存できるAincarnのサブスク管理ツールです。',
}

export default function SubscriptionsPage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <section className="mx-auto max-w-6xl px-4 pt-10">
        <div className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">AI Subscription Manager</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">AIサブスク管理</h1>
          <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-slate-600">
            ChatGPT、Claude、Gemini、Midjourney、Runwayなど、契約中または検討中のAIサブスクを整理するためのツールです。
            サービスごとの用途、料金目安、更新日、利用ジャンルを分けて見ることで、重複契約や使っていないプランに気づきやすくします。
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              ['契約の見える化', '月額・年額・更新日をまとめ、毎月の固定費を確認しやすくします。'],
              ['用途別の整理', '文章、画像、動画、コード、検索など、複数ジャンルにまたがるAIサービスも分けて扱います。'],
              ['公式料金の確認', '表示料金は目安です。契約前には必ず各サービスの公式ページで最新条件を確認してください。'],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <h2 className="text-sm font-black text-slate-950">{title}</h2>
                <p className="mt-2 text-xs font-bold leading-relaxed text-slate-600">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <SubscriptionManager />
    </main>
  )
}
