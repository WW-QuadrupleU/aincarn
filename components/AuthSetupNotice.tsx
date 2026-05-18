export default function AuthSetupNotice({ title = 'ログイン機能の設定が必要です' }: { title?: string }) {
  return (
    <div className="rounded-[24px] border border-white/80 bg-white/90 p-6 shadow-sm shadow-rose-900/5 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">Account setup</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight text-brand-text">{title}</h1>
      <p className="mt-3 text-sm font-bold leading-relaxed text-gray-500">
        サブスク管理をアカウントごとに保存するには、Clerkの認証キーとPostgresのDATABASE_URLをVercelに設定してください。
        設定後に再デプロイすると、ログイン・保存機能が有効になります。
      </p>
      <div className="mt-5 grid gap-3 text-xs font-bold text-gray-500 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="font-black text-brand-text">1. Clerk</p>
          <p className="mt-1">ログイン用の公開キーとシークレットキーを追加</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="font-black text-brand-text">2. Neon/Postgres</p>
          <p className="mt-1">ユーザー別サブスク保存用のDATABASE_URLを追加</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
          <p className="font-black text-brand-text">3. Deploy</p>
          <p className="mt-1">環境変数を反映して本番へ再デプロイ</p>
        </div>
      </div>
    </div>
  )
}
