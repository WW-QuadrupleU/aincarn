import { NextResponse } from 'next/server'
import { fetchLabOutputsFromNotion, hasLabNotion } from '@/lib/aincarn-lab-notion'

// 開発用デバッグエンドポイント:
//   GET /api/debug/lab-notion?slug=writing
//
// Notion から取得したモデル別出力をそのまま JSON で返す。
// env が未設定だったり、Notion API がエラーを返した場合は
// 詳細メッセージを含めて返すので、本番環境でも問題切り分けに使える。

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get('slug') || 'writing'

  const env = {
    hasNotionToken: Boolean(process.env.NOTION_TOKEN),
    hasNotionDbId: Boolean(process.env.NOTION_LAB_OUTPUTS_DB_ID),
    notionDbIdPreview: process.env.NOTION_LAB_OUTPUTS_DB_ID?.slice(0, 8),
    integrationConfigured: hasLabNotion(),
  }

  let outputs = null
  let error: string | null = null
  try {
    outputs = await fetchLabOutputsFromNotion(slug)
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
  }

  return NextResponse.json(
    {
      slug,
      env,
      outputs,
      outputsCount: outputs?.length ?? 0,
      error,
      hint:
        outputs === null && env.integrationConfigured
          ? 'Notion からは何も返ってきませんでした。Category が "writing" (小文字) になっているか、Integration がそのデータベースに Connect されているか、LogDate が設定されているか確認してください。'
          : outputs === null
            ? 'NOTION_TOKEN / NOTION_LAB_OUTPUTS_DB_ID のどちらかが未設定です。Vercel の Environment Variables を確認して Redeploy してください。'
            : 'Notion から正常に取得できています。',
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
