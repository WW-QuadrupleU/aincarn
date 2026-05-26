import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-xs font-bold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-black text-slate-950">Aincarn</p>
          <p className="mt-1">AIモデル、料金、サブスク、比較ログを実用目線で整理するサイトです。</p>
        </div>
        <nav className="flex flex-wrap gap-3 rounded-full border border-slate-200/70 bg-white/80 px-3 py-2 shadow-sm shadow-slate-950/5">
          <Link href="/about" className="hover:text-slate-950">運営者情報</Link>
          <Link href="/lab" className="hover:text-slate-950">Aincarn Lab</Link>
          <Link href="/privacy" className="hover:text-slate-950">プライバシーポリシー</Link>
          <Link href="/disclosure" className="hover:text-slate-950">広告開示</Link>
          <Link href="/contact" className="hover:text-slate-950">お問い合わせ</Link>
        </nav>
      </div>
    </footer>
  )
}
