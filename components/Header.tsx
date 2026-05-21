import Image from 'next/image'
import Link from 'next/link'
import AuthNav from '@/components/AuthNav'
import SmoothHashLink from '@/components/SmoothHashLink'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/82 shadow-sm shadow-rose-900/5 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-black tracking-tight text-brand-text">
          <Image
            src="/icon.png"
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-2xl object-cover shadow-lg shadow-rose-500/20"
            priority
          />
          Aincarn
        </Link>
        <nav className="hidden items-center gap-2 text-xs font-black sm:flex">
          <SmoothHashLink href="/#compare" className="rounded-full px-3 py-2 text-gray-500 transition hover:bg-white hover:text-brand-text hover:shadow-sm">
            比較ツール
          </SmoothHashLink>
          <Link href="/tools/ai-pricing" className="rounded-full px-3 py-2 text-gray-500 transition hover:bg-white hover:text-brand-text hover:shadow-sm">
            料金比較
          </Link>
          <Link href="/tools/subscriptions" className="rounded-full px-3 py-2 text-gray-500 transition hover:bg-white hover:text-brand-text hover:shadow-sm">
            サブスク
          </Link>
          <Link href="/about" className="rounded-full border border-brand-text bg-brand-text px-4 py-2 text-white shadow-sm shadow-slate-900/10 transition hover:-translate-y-0.5 hover:bg-white hover:text-brand-text">
            About
          </Link>
          <AuthNav />
        </nav>
        <div className="sm:hidden">
          <AuthNav />
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 text-xs font-black sm:hidden">
        <SmoothHashLink href="/#compare" className="shrink-0 rounded-full bg-white px-3 py-2 text-gray-600 shadow-sm shadow-rose-900/5">
          比較ツール
        </SmoothHashLink>
        <Link href="/tools/ai-pricing" className="shrink-0 rounded-full bg-white px-3 py-2 text-gray-600 shadow-sm shadow-rose-900/5">
          料金比較
        </Link>
        <Link href="/tools/subscriptions" className="shrink-0 rounded-full bg-brand-text px-3 py-2 text-white shadow-sm shadow-slate-900/10">
          サブスク
        </Link>
        <Link href="/tools" className="shrink-0 rounded-full bg-white px-3 py-2 text-gray-600 shadow-sm shadow-rose-900/5">
          Tools
        </Link>
      </nav>
    </header>
  )
}
