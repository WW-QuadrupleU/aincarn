import Image from 'next/image'
import Link from 'next/link'
import AuthNav from '@/components/AuthNav'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/78 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 text-lg font-black tracking-tight text-slate-950">
          <Image
            src="/icon.png"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-2xl border border-slate-200/70 object-cover shadow-sm shadow-slate-950/5"
            priority
          />
          Aincarn
        </Link>
        <nav className="hidden items-center gap-1 rounded-full border border-slate-200/70 bg-white/72 p-1 text-xs font-black shadow-sm shadow-slate-950/5 sm:flex">
          <Link
            href="/tools/aios"
            className="rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-rose-400 px-3 py-2 text-white shadow-sm shadow-indigo-500/20 transition hover:-translate-y-0.5"
          >
            Aincarn OS
          </Link>
          <Link href="/tools/ai-model-compare" className="rounded-full px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
            比較ツール
          </Link>
          <Link href="/tools/ai-pricing" className="rounded-full px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
            料金比較
          </Link>
          <Link href="/tools/subscriptions" className="rounded-full px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
            サブスク管理
          </Link>
          <Link href="/about" className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800">
            About
          </Link>
          <AuthNav />
        </nav>
        <div className="sm:hidden">
          <AuthNav />
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 text-xs font-black sm:hidden">
        <Link
          href="/tools/aios"
          className="shrink-0 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-rose-400 px-3 py-2 text-white shadow-sm shadow-indigo-500/15"
        >
          Aincarn OS
        </Link>
        <Link href="/tools/ai-model-compare" className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm shadow-slate-950/5">
          比較ツール
        </Link>
        <Link href="/tools/ai-pricing" className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm shadow-slate-950/5">
          料金比較
        </Link>
        <Link href="/tools/subscriptions" className="shrink-0 rounded-full bg-slate-950 px-3 py-2 text-white shadow-sm shadow-slate-950/10">
          サブスク管理
        </Link>
      </nav>
    </header>
  )
}
