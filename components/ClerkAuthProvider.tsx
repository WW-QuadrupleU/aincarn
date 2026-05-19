'use client'

import { ClerkProvider } from '@clerk/nextjs'
import type { ReactNode } from 'react'

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

export default function ClerkAuthProvider({ children }: { children: ReactNode }) {
  if (!clerkEnabled) return <>{children}</>

  return <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">{children}</ClerkProvider>
}
