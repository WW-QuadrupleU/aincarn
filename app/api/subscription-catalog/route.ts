import { NextResponse } from 'next/server'
import { catalogUpdatedAt, getSubscriptionCatalog } from '@/lib/subscription-catalog'

export const dynamic = 'force-dynamic'

export async function GET() {
  const services = await getSubscriptionCatalog()
  return NextResponse.json(
    {
      updatedAt: catalogUpdatedAt,
      services,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    },
  )
}
