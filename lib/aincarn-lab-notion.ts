// Notion → Aincarn Lab のモデル別出力データを取得するフェッチャ。
//
// 設計方針:
//  - 環境変数 NOTION_TOKEN と NOTION_LAB_OUTPUTS_DB_ID が両方揃っているときだけ Notion を叩く
//  - 取得に失敗、もしくは1件もページがなければ null を返し、呼び出し側でコード内データ（lib/aincarn-lab.ts）にフォールバックする
//  - Next.js の ISR で 5 分キャッシュ (revalidate: 300)
//
// Notion 側のデータベース設計は docs/aincarn-lab-notion-schema.md を参照。
// 必要なプロパティ: Model (Title), Category (Select: writing|coding|research),
//                  Order (Number), Brief (Rich text), LogDate (Date)
// 各ページの本文: 見出し (Heading 2/3) + 箇条書き (Bulleted list)。
// 見出しごとに 1 セクションになる。
//
// LogDate ごとに「1回の比較セッション」になる。サイトでは同じ Category 内で
// 最新の LogDate を持つ行群だけを表示する。過去ログは Notion 側にスタックで残る。

import type { LabModelOutput } from '@/lib/aincarn-lab'

const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'
const REVALIDATE_SECONDS = 300

type NotionRichText = { plain_text?: string }

type NotionPage = {
  id: string
  properties: Record<string, unknown>
}

type NotionBlock = {
  id: string
  type: string
  heading_1?: { rich_text?: NotionRichText[] }
  heading_2?: { rich_text?: NotionRichText[] }
  heading_3?: { rich_text?: NotionRichText[] }
  paragraph?: { rich_text?: NotionRichText[] }
  bulleted_list_item?: { rich_text?: NotionRichText[] }
  numbered_list_item?: { rich_text?: NotionRichText[] }
  quote?: { rich_text?: NotionRichText[] }
  code?: { rich_text?: NotionRichText[] }
}

type PropertyValue = {
  title?: NotionRichText[]
  rich_text?: NotionRichText[]
  select?: { name?: string } | null
  number?: number | null
  date?: { start?: string | null; end?: string | null } | null
}

export function hasLabNotion() {
  return Boolean(process.env.NOTION_TOKEN && process.env.NOTION_LAB_OUTPUTS_DB_ID)
}

async function notionFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${NOTION_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    },
    next: { revalidate: REVALIDATE_SECONDS },
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Notion API ${response.status} on ${path}: ${body.slice(0, 200)}`)
  }
  return response.json() as Promise<T>
}

function plainText(rich: NotionRichText[] | undefined): string {
  if (!rich || !Array.isArray(rich)) return ''
  return rich.map((item) => item.plain_text || '').join('').trim()
}

function readTitle(page: NotionPage, key: string): string {
  const prop = page.properties[key] as PropertyValue | undefined
  if (!prop) return ''
  if (prop.title && prop.title.length > 0) return plainText(prop.title)
  if (prop.rich_text && prop.rich_text.length > 0) return plainText(prop.rich_text)
  return ''
}

function readRichText(page: NotionPage, key: string): string {
  const prop = page.properties[key] as PropertyValue | undefined
  if (!prop) return ''
  if (prop.rich_text) return plainText(prop.rich_text)
  if (prop.title) return plainText(prop.title)
  return ''
}

async function fetchPageBlocks(pageId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = []
  let cursor: string | undefined
  do {
    const query = cursor ? `?start_cursor=${cursor}&page_size=100` : '?page_size=100'
    const data = await notionFetch<{ results: NotionBlock[]; next_cursor: string | null; has_more: boolean }>(
      `/blocks/${pageId}/children${query}`,
    )
    blocks.push(...data.results)
    cursor = data.has_more ? data.next_cursor || undefined : undefined
  } while (cursor)
  return blocks
}

function blocksToSections(blocks: NotionBlock[]): Array<{ heading: string; body?: string; bullets?: string[] }> {
  const sections: Array<{ heading: string; body?: string; bullets?: string[] }> = []
  let current: { heading: string; body?: string; bullets?: string[] } | null = null

  const flush = () => {
    if (current) {
      sections.push(current)
      current = null
    }
  }

  for (const block of blocks) {
    const type = block.type
    if (type === 'heading_1' || type === 'heading_2' || type === 'heading_3') {
      const text = plainText(
        block.heading_1?.rich_text || block.heading_2?.rich_text || block.heading_3?.rich_text,
      )
      if (!text) continue
      flush()
      current = { heading: text }
    } else if (type === 'bulleted_list_item' || type === 'numbered_list_item') {
      const text = plainText(block.bulleted_list_item?.rich_text || block.numbered_list_item?.rich_text)
      if (!text) continue
      if (!current) current = { heading: 'メモ' }
      if (!current.bullets) current.bullets = []
      current.bullets.push(text)
    } else if (type === 'paragraph' || type === 'quote' || type === 'code') {
      const text = plainText(
        block.paragraph?.rich_text || block.quote?.rich_text || block.code?.rich_text,
      )
      if (!text) continue
      if (!current) current = { heading: 'メモ' }
      current.body = current.body ? `${current.body}\n\n${text}` : text
    }
  }
  flush()
  return sections
}

function compareOrder(a: NotionPage, b: NotionPage): number {
  const ao = (a.properties['Order'] as PropertyValue | undefined)?.number ?? Number.POSITIVE_INFINITY
  const bo = (b.properties['Order'] as PropertyValue | undefined)?.number ?? Number.POSITIVE_INFINITY
  return ao - bo
}

function readLogDate(page: NotionPage): string {
  const prop = page.properties['LogDate'] as PropertyValue | undefined
  const start = prop?.date?.start
  return typeof start === 'string' ? start : ''
}

function pickLatestLogPages(pages: NotionPage[]): NotionPage[] {
  // LogDate プロパティ未設定の場合は「すべて同じ最新ログ」とみなす（後方互換）
  const dated = pages.filter((page) => Boolean(readLogDate(page)))
  if (dated.length === 0) return pages

  // 同じ Category 内で最新の LogDate (YYYY-MM-DD の辞書順 = 時系列順) を選ぶ
  const latestDate = dated
    .map(readLogDate)
    .sort()
    .reverse()[0]

  return pages.filter((page) => {
    const logDate = readLogDate(page)
    // LogDate 未設定の行は無視する。日付があるグループの方を信頼する。
    return logDate === latestDate
  })
}

export async function fetchLabOutputsFromNotion(slug: string): Promise<LabModelOutput[] | null> {
  if (!hasLabNotion()) return null

  try {
    const query = await notionFetch<{ results: NotionPage[] }>(
      `/databases/${process.env.NOTION_LAB_OUTPUTS_DB_ID}/query`,
      {
        method: 'POST',
        body: JSON.stringify({
          filter: {
            property: 'Category',
            select: { equals: slug },
          },
          page_size: 20,
        }),
      },
    )

    // LogDate が新しい行群だけに絞り込み、その中で Order 昇順に整列する
    const latestLogPages = pickLatestLogPages(query.results)
    const pages = [...latestLogPages].sort(compareOrder)
    const outputs: LabModelOutput[] = []

    for (const page of pages) {
      const model = readTitle(page, 'Model')
      if (!model) continue
      const brief = readRichText(page, 'Brief')
      let sections: Array<{ heading: string; body?: string; bullets?: string[] }> = []
      try {
        const blocks = await fetchPageBlocks(page.id)
        sections = blocksToSections(blocks)
      } catch (error) {
        console.warn(`[lab-notion] block fetch failed for page ${page.id}:`, error)
      }
      outputs.push({ model, brief, sections })
    }

    return outputs.length > 0 ? outputs : null
  } catch (error) {
    console.warn(`[lab-notion] outputs fetch failed for slug=${slug}:`, error)
    return null
  }
}
