import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '広告・アフィリエイト開示',
  description: 'Aincarnの広告・アフィリエイト開示ページです。',
}

export default function DisclosurePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-[28px] border border-white bg-white/84 p-8 shadow-sm backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Disclosure</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">広告・アフィリエイト開示</h1>
        <p className="mt-5 text-sm font-bold leading-relaxed text-gray-600">
          Aincarnでは、今後AIサブスクや関連サービスの紹介リンクを掲載する場合があります。
          紹介料の有無にかかわらず、公開情報と実測データを分けて記載し、読者が判断しやすい形で整理します。
        </p>
      </section>
    </main>
  )
}
