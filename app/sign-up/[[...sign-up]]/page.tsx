import { SignUp } from '@clerk/nextjs'
import AuthSetupNotice from '@/components/AuthSetupNotice'

export default function SignUpPage() {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <AuthSetupNotice title="アカウント作成機能の設定が必要です" />
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-12">
      <SignUp />
    </main>
  )
}
