export const dynamic = 'force-static'

export function GET() {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.replace(/^ca-/, '')
  if (!publisherId) {
    return new Response('', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    })
  }

  return new Response(`google.com, ${publisherId}, DIRECT, f08c47fec0942fa0\n`, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  })
}
