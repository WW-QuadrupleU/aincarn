'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export default function AuthNav() {
  if (!clerkEnabled) return null

  return <SignedInState />
}

function SignedInState() {
  const { isLoaded, isSignedIn } = useUser()
  const [planLabel, setPlanLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setPlanLabel(null)
      return
    }

    let active = true
    fetch('/api/account/plan', { cache: 'no-store' })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data?.label) setPlanLabel(String(data.label))
      })
      .catch(() => {
        if (active) setPlanLabel(null)
      })

    return () => {
      active = false
    }
  }, [isLoaded, isSignedIn])

  if (!isLoaded) {
    return <span className="h-8 w-16 rounded-full bg-white/70" aria-hidden="true" />
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button
          type="button"
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 shadow-sm shadow-slate-950/5 transition hover:-translate-y-0.5 hover:border-slate-300"
        >
          Login
        </button>
      </SignInButton>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {planLabel && (
        <Link
          href="/tools/aios/pricing"
          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          title="現在のAincarn OSプラン"
        >
          {planLabel}
        </Link>
      )}
      <UserButton />
    </div>
  )
}
