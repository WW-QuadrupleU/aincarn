import { SignUp } from '@clerk/nextjs'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-sm shadow-slate-950/5 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Sign up</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">アカウント作成ページ</h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-gray-500">
            現在、アカウント保存機能は限定公開です。公開中の比較ツールとAincarn Labはログインなしで利用できます。
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-12">
      <SignUp />
    </main>
  )
}
