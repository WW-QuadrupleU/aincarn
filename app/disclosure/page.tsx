import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '広告・アフィリエイト開示',
  description: 'Aincarnの広告掲載、アフィリエイトリンク、比較情報の扱いについて掲載しています。',
}

export default function DisclosurePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-[28px] border border-white bg-white/84 p-8 shadow-sm backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Disclosure</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">広告・アフィリエイト開示</h1>
        <div className="mt-7 space-y-6 text-sm font-bold leading-relaxed text-gray-600">
          <p>
            Aincarnでは、今後Google AdSenseなどの広告、またはAIサービスや関連ツールの紹介リンクを掲載する場合があります。
            広告や紹介リンクから収益が発生する場合でも、掲載内容の評価や比較方針が不当に左右されないように運営します。
          </p>
          <p>
            料金、仕様、提供条件は変更されることがあります。Aincarnでは公式ページ、公開ベンチマーク、運営者による確認情報を分けて扱い、
            読者が自分の用途に合うか判断しやすい形で整理します。
          </p>
          <p>
            誤りや古い情報を見つけた場合は、お問い合わせページまたはメールでご連絡ください。
          </p>
        </div>
      </section>
    </main>
  )
}
