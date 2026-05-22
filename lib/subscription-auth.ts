import { auth, clerkClient } from '@clerk/nextjs/server'

export function hasSubscriptionAuth() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
}

export async function getSubscriptionUserId() {
  if (!hasSubscriptionAuth()) {
    return {
      error: 'ログイン機能は現在準備中です',
      status: 501,
      userId: null,
    }
  }

  try {
    const { userId } = await auth()
    if (!userId) {
      return {
        error: 'Unauthorized',
        status: 401,
        userId: null,
      }
    }

    return {
      error: null,
      status: 200,
      userId,
    }
  } catch {
    return {
      error: 'ログイン機能は現在準備中です',
      status: 501,
      userId: null,
    }
  }
}

export async function getUserEmail(userId: string): Promise<string | null> {
  try {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    return user.primaryEmailAddress?.emailAddress || null
  } catch {
    return null
  }
}
