import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー',
  description: 'Aincarnのプライバシーポリシー、アクセス解析、広告Cookie、外部サービス利用について掲載しています。',
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-[28px] border border-white bg-white/84 p-8 shadow-sm backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Privacy</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">プライバシーポリシー</h1>
        <p className="mt-2 text-xs font-bold text-gray-400">最終更新日: 2026年5月25日</p>
        <div className="mt-7 space-y-6 text-sm font-bold leading-relaxed text-gray-600">
          <section>
            <h2 className="text-lg font-black text-slate-950">取得する情報</h2>
            <p className="mt-2">
              Aincarn（aincarn.com）は、お問い合わせ対応、サイト改善、アクセス解析、ログイン機能、サブスク管理機能の提供に必要な範囲で情報を扱います。
              お問い合わせ時のメールアドレス、ログインに利用する外部認証情報、ツール内で保存したサブスク情報などが含まれます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-950">アクセス解析</h2>
            <p className="mt-2">
              当サイトでは、利用状況の把握と改善のためにGoogle Analyticsなどのアクセス解析ツールを利用する場合があります。
              これらのツールはCookieを使用することがあります。Cookieはブラウザ設定で無効化できます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-black text-slate-950">広告Cookieについて</h2>
            <p className="mt-2">
              当サイトでは、今後Google AdSenseなどの広告配信サービスを利用する場合があります。
              第三者配信事業者（Googleを含む）は、ユーザーが当サイトや他のサイトへアクセスした情報に基づいて広告を配信するためにCookieを使用することがあります。
              Googleによる広告Cookieの使用により、ユーザーの当サイトや他サイトへのアクセス情報に基づいた広告が表示される場合があります。
            </p>
            <p className="mt-2">
              パーソナライズ広告は、Googleの広告設定ページから無効にできます。
              また、第三者配信事業者のCookie利用については、各事業者の案内をご確認ください。
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
            <h2 className="text-lg font-black text-slate-950">お問い合わせ</h2>
            <p className="mt-2">
              本ポリシーに関するお問い合わせは <a className="text-slate-500 underline" href="mailto:contact@aincarn.com">contact@aincarn.com</a> までお願いします。
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
