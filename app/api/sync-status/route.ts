import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.json({
    ok: true,
    message: 'Aincarn does not use the legacy Gadgepath Notion sync endpoint.',
  })
}
