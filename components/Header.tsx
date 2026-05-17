import Image from 'next/image'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/88 shadow-sm backdrop-blur-xl">
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
        <nav className="flex items-center gap-2 text-xs font-black">
          <Link href="/#compare" className="rounded-full px-3 py-2 text-gray-500 transition hover:bg-gray-100 hover:text-brand-text">
            比較ツール
          </Link>
          <Link href="/about" className="rounded-full bg-brand-text px-4 py-2 text-white transition hover:bg-gray-700">
            About
          </Link>
        </nav>
      </div>
    </header>
  )
}
