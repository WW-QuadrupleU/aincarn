import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse, type NextFetchEvent, type NextRequest } from 'next/server'

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
const isSubscriptionRoute = createRouteMatcher(['/api/subscriptions(.*)'])

const clerkProxy = clerkEnabled
  ? clerkMiddleware(
      async (auth, request) => {
        if (isSubscriptionRoute(request)) {
          await auth.protect()
        }
      },
      {
        frontendApiProxy: {
          enabled: true,
          path: '/__clerk',
        },
      },
    )
  : null

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!clerkProxy) return NextResponse.next()
  return clerkProxy(request, event)
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api)(.*)',
    '/__clerk/(.*)',
  ],
}
