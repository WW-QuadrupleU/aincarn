'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import AuthNav from '@/components/AuthNav'

const navItems = [
  { href: '/tools/ai-model-compare', label: 'AIモデル比較', activeColor: 'sky' },
  { href: '/tools/ai-pricing', label: 'AI料金比較', activeColor: 'emerald' },
  { href: '/tools/subscriptions', label: 'AIサブスク管理', activeColor: 'violet' },
]

export default function Header() {
  const pathname = usePathname() || ''

  const getDesktopClasses = (item: typeof navItems[0]) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    if (isActive) {
      if (item.activeColor === 'sky') {
        return 'rounded-full px-3 py-2 text-sky-600 bg-sky-50 border border-sky-100/50 font-black shadow-sm shadow-sky-100/10'
      }
      if (item.activeColor === 'emerald') {
        return 'rounded-full px-3 py-2 text-emerald-600 bg-emerald-50 border border-emerald-100/50 font-black shadow-sm shadow-emerald-100/10'
      }
      if (item.activeColor === 'violet') {
        return 'rounded-full px-3 py-2 text-violet-600 bg-violet-50 border border-violet-100/50 font-black shadow-sm shadow-violet-100/10'
      }
    }
    return 'rounded-full px-3 py-2 text-slate-500 border border-transparent transition hover:bg-slate-100 hover:text-slate-950'
  }

  const getMobileClasses = (item: typeof navItems[0]) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    if (isActive) {
      if (item.activeColor === 'sky') {
        return 'shrink-0 rounded-full border border-sky-200/80 bg-sky-50 px-3 py-2 text-sky-600 font-black shadow-sm'
      }
      if (item.activeColor === 'emerald') {
        return 'shrink-0 rounded-full border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-emerald-600 font-black shadow-sm'
      }
      if (item.activeColor === 'violet') {
        return 'shrink-0 rounded-full border border-violet-200/80 bg-violet-50 px-3 py-2 text-violet-600 font-black shadow-sm'
      }
    }
    return 'shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm shadow-slate-950/5'
  }

  const isLabActive = pathname === '/lab' || pathname.startsWith('/lab/')

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
            <Link key={item.href} href={item.href} className={getDesktopClasses(item)}>
              {item.label}
            </Link>
          ))}
          <Link
            href="/lab"
            className={
              isLabActive
                ? 'rounded-full bg-slate-950 px-4 py-2 text-sky-300 font-black border border-sky-400/25 shadow-[0_0_14px_rgba(91,184,255,0.3)] transition hover:bg-slate-900'
                : 'rounded-full bg-slate-950 px-4 py-2 text-white border border-transparent transition hover:bg-slate-800'
            }
          >
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
          <Link key={item.href} href={item.href} className={getMobileClasses(item)}>
            {item.label}
          </Link>
        ))}
        <Link
          href="/lab"
          className={
            isLabActive
              ? 'shrink-0 rounded-full bg-slate-950 px-3 py-2 text-sky-300 font-black border border-sky-400/25 shadow-[0_0_12px_rgba(91,184,255,0.25)]'
              : 'shrink-0 rounded-full bg-slate-950 px-3 py-2 text-white shadow-sm shadow-slate-950/10 border border-transparent'
          }
        >
          Aincarn Lab
        </Link>
      </nav>
    </header>
  )
}
