import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'Aincarnのプライバシーポリシーページです。',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-[28px] border border-white bg-white/84 p-8 shadow-sm backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Privacy</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">プライバシーポリシー</h1>
        <p className="mt-2 text-xs font-bold text-gray-400">最終更新日: 2026年5月17日</p>
        <div className="mt-7 space-y-6 text-sm font-bold leading-relaxed text-gray-600">
          <p>
            Aincarn（aincarn.com）は、お問い合わせ対応、サイト改善、アクセス解析のために必要な範囲で情報を扱います。
          </p>
          <p>
            当サイトではGoogle Analyticsなどのアクセス解析を利用する場合があります。Cookieはブラウザ設定で無効化できます。
          </p>
          <p>
            外部サイトへのリンク先で収集される情報については、各サービスのプライバシーポリシーをご確認ください。
          </p>
          <p>
            お問い合わせは <a className="text-rose-500 underline" href="mailto:contact@aincarn.com">contact@aincarn.com</a> までお願いします。
          </p>
        </div>
      </section>
    </main>
  )
}
