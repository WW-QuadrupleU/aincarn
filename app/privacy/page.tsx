import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description:
    'Aincarnのプライバシーポリシーです。アクセス解析、広告Cookie、外部サービス、問い合わせ情報の取り扱いについて記載しています。',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-[28px] border border-white bg-white/84 p-8 shadow-sm backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Privacy</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">プライバシーポリシー</h1>
        <p className="mt-2 text-xs font-bold text-gray-400">最終更新日: 2026年5月28日</p>

        <div className="mt-7 space-y-6 text-sm font-bold leading-relaxed text-gray-600">
          <section>
            <h2 className="text-lg font-black text-slate-950">取得する情報</h2>
            <p className="mt-2">
              Aincarn（aincarn.com）は、お問い合わせ対応、サイト改善、アクセス解析、各種ツールの提供に必要な範囲で情報を扱います。
              お問い合わせ時のメールアドレス、ツール利用時に入力された内容、ブラウザや端末に関する技術情報などが含まれる場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-950">アクセス解析について</h2>
            <p className="mt-2">
              当サイトでは、利用状況の把握と改善のためにアクセス解析ツールを利用する場合があります。
              これらのツールはCookieを使用して、閲覧ページ、利用環境、訪問回数などの情報を収集することがあります。
              Cookieはブラウザ設定で無効化できます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-950">広告配信とCookieについて</h2>
            <p className="mt-2">
              当サイトでは、Google AdSenseなどの第三者配信広告サービスを利用する場合があります。
              広告配信事業者は、ユーザーが当サイトや他のサイトにアクセスした情報に基づいて広告を表示するため、Cookieを使用することがあります。
              パーソナライズ広告は、Googleの広告設定ページから無効にできます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-950">外部リンク・外部サービス</h2>
            <p className="mt-2">
              当サイトから外部サイトへ移動した場合、移動先で収集される情報は各サービスのプライバシーポリシーに従います。
              Aincarnは、外部サイトの内容や個人情報の取り扱いについて責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-950">情報の修正・削除</h2>
            <p className="mt-2">
              お問い合わせ内容など、当サイトが保有する情報の確認、修正、削除を希望される場合は、下記の連絡先までご連絡ください。
              合理的な範囲で対応します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-950">お問い合わせ</h2>
            <p className="mt-2">
              本ポリシーに関するお問い合わせは{' '}
              <a className="text-slate-500 underline" href="mailto:contact@aincarn.com">
                contact@aincarn.com
              </a>{' '}
              までお願いします。
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
