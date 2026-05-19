import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

export default function SsoCallbackPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-12">
      <AuthenticateWithRedirectCallback />
    </main>
  )
}
