import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-white/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 text-xs font-bold text-gray-500 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-black text-brand-text">Aincarn</p>
          <p className="mt-1">AIモデルとサブスクを、実測で比較する。</p>
        </div>
        <nav className="flex flex-wrap gap-3">
          <Link href="/about" className="hover:text-brand-text">運営者情報</Link>
          <Link href="/privacy" className="hover:text-brand-text">プライバシーポリシー</Link>
          <Link href="/contact" className="hover:text-brand-text">お問い合わせ</Link>
        </nav>
      </div>
    </footer>
  )
}
