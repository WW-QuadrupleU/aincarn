import Image from 'next/image'
import Link from 'next/link'
import AuthNav from '@/components/AuthNav'

const navItems = [
  { href: '/tools/ai-model-compare', label: 'AIモデル比較' },
  { href: '/tools/ai-pricing', label: 'AI料金比較' },
  { href: '/tools/subscriptions', label: 'サブスク管理' },
]

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
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
              {item.label}
            </Link>
          ))}
          <Link href="/lab" className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800">
            Aincarn Lab
          </Link>
          <AuthNav />
        </nav>
        <div className="sm:hidden">
          <AuthNav />
        </div>
      </div>
      <nav className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3 text-xs font-black sm:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm shadow-slate-950/5">
            {item.label}
          </Link>
        ))}
        <Link href="/lab" className="shrink-0 rounded-full bg-slate-950 px-3 py-2 text-white shadow-sm shadow-slate-950/10">
          Aincarn Lab
        </Link>
      </nav>
    </header>
  )
}
