import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <section className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-sm shadow-rose-900/5 backdrop-blur">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Sign up</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">アカウント作成は準備中です</h1>
          <p className="mt-3 text-sm font-bold leading-relaxed text-gray-500">
            AIサブスク管理をアカウントごとに保存できるよう準備しています。公開後はこのページからアカウント作成できます。
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
