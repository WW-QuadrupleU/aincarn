import { auth } from '@clerk/nextjs/server'

export function hasSubscriptionAuth() {
  return Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
}

export async function getSubscriptionUserId() {
  if (!hasSubscriptionAuth()) {
    return {
      error: 'Clerk authentication is not configured',
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
      error: 'Clerk authentication is not available',
      status: 501,
      userId: null,
    }
  }
}
