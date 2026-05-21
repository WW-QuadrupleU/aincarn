import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ',
  description: 'Aincarnへのお問い合わせページです。',
}

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <section className="rounded-[28px] border border-white bg-white/84 p-8 shadow-sm backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Contact</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">お問い合わせ</h1>
        <p className="mt-4 text-sm font-bold leading-relaxed text-gray-500">
          掲載内容に関するご指摘、AIモデル比較への追加希望、実測テストのリクエストなどはメールでお送りください。
        </p>
        <a
          href="mailto:contact@aincarn.com"
          className="mt-6 inline-flex rounded-full bg-brand-text px-5 py-3 text-sm font-black text-white transition hover:bg-gray-700"
        >
          contact@aincarn.com
        </a>
      </section>
    </main>
  )
}

