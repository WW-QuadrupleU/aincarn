'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export default function AuthNav() {
  if (!clerkEnabled) return null

  return <SignedInState />
}

function SignedInState() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return <span className="h-8 w-16 rounded-full bg-white/70" aria-hidden="true" />
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          type="button"
          className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-black text-brand-text shadow-sm transition hover:-translate-y-0.5 hover:border-brand-text"
        >
          Login
        </button>
      </SignInButton>
    )
  }

  return <UserButton />
}
