import type { SubscriptionInput } from '@/lib/subscription-store'

export type SubscriptionCategory =
  | 'チャット'
  | '文章'
  | '画像'
  | '動画'
  | 'コーディング'
  | '検索・リサーチ'
  | 'デザイン'
  | 'エージェント'
  | 'API'

export type SubscriptionCatalogPlanYearly = {
  monthlyCostUsd: number
  summary?: string
}

export type SubscriptionCatalogPlan = {
  id: string
  name: string
  monthlyCostUsd: number
  summary: string
  sourceUrl?: string
  yearly?: SubscriptionCatalogPlanYearly
}

export type SubscriptionCatalogService = {
  id: string
  name: string
  categories: SubscriptionCategory[]
  accent: string
  mark: string
  vibe: string
  description: string
  sourceUrl: string
  updatedAt: string
  plans: SubscriptionCatalogPlan[]
}

export type SubscriptionBillingCycle = SubscriptionInput['billingCycle']

export const catalogUpdatedAt = '2026-05-22'

export const categoryOptions: SubscriptionCategory[] = [
  'チャット',
  '文章',
  '画像',
  '動画',
  'コーディング',
  '検索・リサーチ',
  'デザイン',
  'エージェント',
  'API',
]

export const defaultSubscriptionCatalog: SubscriptionCatalogService[] = [
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    categories: ['チャット', '文章', '画像', '動画', 'コーディング', '検索・リサーチ', 'エージェント'],
    accent: 'from-[#15f5ba] via-[#39a7ff] to-[#7c3cff]',
    mark: 'CG',
    vibe: '万能型',
    description: '文章、調査、画像、動画、コード、エージェント用途まで広く使える中心サービス。',
    sourceUrl: 'https://chatgpt.com/pricing/',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'plus',
        name: 'Plus',
        monthlyCostUsd: 20,
        summary: '個人利用の標準プラン。高度な推論、画像生成、Deep Research、Codex利用を広く使う人向け。',
      },
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 200,
        summary: '最大級の利用枠、Pro推論、Deep Research、エージェント、Codexを重く使う人向け。',
      },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    categories: ['チャット', '文章', 'コーディング', '検索・リサーチ', 'エージェント'],
    accent: 'from-[#ff9a3c] via-[#ff5f6d] to-[#8f3cff]',
    mark: 'CL',
    vibe: '長文・コード',
    description: '長文読解、文章整理、Claude Codeを含む開発支援で選びやすいサービス。',
    sourceUrl: 'https://support.claude.com/en/articles/11049762-choose-a-claude-plan',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 20,
        summary: '通常利用向けの標準プラン。Claudeを毎日使う個人向け。',
        yearly: {
          monthlyCostUsd: 17,
          summary: '年払い時の月額換算（年額$204）。Claude Proを継続利用する人向け。',
        },
      },
      {
        id: 'max-5x',
        name: 'Max 5x',
        monthlyCostUsd: 100,
        summary: 'Proの約5倍の利用容量をセッションごとに使いたい頻繁利用者向け。',
      },
      {
        id: 'max-20x',
        name: 'Max 20x',
        monthlyCostUsd: 200,
        summary: 'Claudeを日常業務の中心に置くヘビーユーザー向け。',
      },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    categories: ['チャット', '文章', '画像', '動画', 'コーディング', '検索・リサーチ', 'エージェント'],
    accent: 'from-[#30d5ff] via-[#7b61ff] to-[#ff4ecd]',
    mark: 'GM',
    vibe: 'Google連携',
    description: 'Googleアプリ連携、検索、動画生成、NotebookLM周辺までまとめて使いたい人向け。',
    sourceUrl: 'https://gemini.google/us/subscriptions/?hl=en',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'ai-plus',
        name: 'Google AI Plus',
        monthlyCostUsd: 7.99,
        summary: 'Freeより多い利用枠とGoogle AI機能を軽めに使う入口プラン。',
      },
      {
        id: 'ai-pro',
        name: 'Google AI Pro',
        monthlyCostUsd: 19.99,
        summary: 'Gemini、Google Flow、NotebookLM、Googleアプリ連携を広く使う標準プラン。',
      },
      {
        id: 'ai-ultra-5x',
        name: 'Google AI Ultra 5x',
        monthlyCostUsd: 99.99,
        summary: 'AI Proより高い利用上限と先行機能を求める上位プラン。',
      },
      {
        id: 'ai-ultra-20x',
        name: 'Google AI Ultra 20x',
        monthlyCostUsd: 199.99,
        summary: 'AI Pro比で最大級の利用枠、動画生成、先行機能を重く使う人向け。',
      },
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    categories: ['チャット', '検索・リサーチ', 'エージェント'],
    accent: 'from-[#00e5ff] via-[#00c48c] to-[#7dff6a]',
    mark: 'PX',
    vibe: '調査',
    description: '検索、出典確認、調査メモ作成を高速化したい人向け。',
    sourceUrl: 'https://www.perplexity.ai/help-center/en/collections/8935108-perplexity-pro',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 20,
        summary: '日常的な検索、Pro Search、ファイル利用、モデル選択を使いたい人向け。',
        yearly: {
          monthlyCostUsd: 16.67,
          summary: '年払い時の月額換算（年額$200）。Perplexity Proを継続利用する人向け。',
        },
      },
      {
        id: 'max',
        name: 'Max',
        monthlyCostUsd: 200,
        summary: '最新モデルや新機能への高いアクセスを求める上位プラン。',
      },
    ],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    categories: ['コーディング', 'エージェント'],
    accent: 'from-[#1f2937] via-[#6d28d9] to-[#22d3ee]',
    mark: 'GH',
    vibe: '開発',
    description: 'GitHub、VS Code、CLI、コードレビュー、エージェント開発支援をまとめたい人向け。',
    sourceUrl: 'https://github.com/features/copilot/plans',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 10,
        summary: '個人開発者向け。300 premium requestsと主要IDE連携を含む。',
        yearly: {
          monthlyCostUsd: 8.33,
          summary: '年払い時の月額換算（年額$100）。Copilot Proを継続利用する個人開発者向け。',
        },
      },
      {
        id: 'pro-plus',
        name: 'Pro+',
        monthlyCostUsd: 39,
        summary: 'Proより多いpremium requestsと上位モデルアクセスを重視する人向け。',
        yearly: {
          monthlyCostUsd: 32.5,
          summary: '年払い時の月額換算（年額$390）。Pro+を継続利用する人向け。',
        },
      },
    ],
  },
  {
    id: 'cursor',
    name: 'Cursor',
    categories: ['コーディング', 'エージェント'],
    accent: 'from-[#111827] via-[#0ea5e9] to-[#f97316]',
    mark: 'CU',
    vibe: '実装',
    description: 'AIコードエディタ、エージェント、MCP、Cloud agentsを開発作業に組み込みたい人向け。',
    sourceUrl: 'https://cursor.com/pricing',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 20,
        summary: '個人利用の標準プラン。フロンティアモデル、MCP、Cloud agentsを使える。',
        yearly: {
          monthlyCostUsd: 16,
          summary: '年払い時の月額換算（年額$192）。Cursor Proを継続利用する開発者向け。',
        },
      },
      {
        id: 'teams',
        name: 'Teams',
        monthlyCostUsd: 40,
        summary: 'チーム共有、SSO/OIDC、管理・分析機能を使いたいチーム向け。',
        yearly: {
          monthlyCostUsd: 32,
          summary: '年払い時の月額換算（年額$384/ユーザー）。チーム継続利用向け。',
        },
      },
    ],
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    categories: ['画像', '動画', 'デザイン'],
    accent: 'from-[#ff47a3] via-[#ffcc00] to-[#00e0ff]',
    mark: 'MJ',
    vibe: '映像美',
    description: '画像生成を軸に、動画生成やデザイン素材作成まで使いたい人向け。',
    sourceUrl: 'https://docs.midjourney.com/hc/en-us/articles/27870484040333-Comparing-Midjourney-Plans',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'basic',
        name: 'Basic',
        monthlyCostUsd: 10,
        summary: 'まず画像・動画生成を試したい人向けの入口プラン。',
        yearly: {
          monthlyCostUsd: 8,
          summary: '年払い時の月額換算（年額$96）。Basicを継続利用する人向け。',
        },
      },
      {
        id: 'standard',
        name: 'Standard',
        monthlyCostUsd: 30,
        summary: 'Relax GPU Timeを使い、継続的に生成したい人向け。',
        yearly: {
          monthlyCostUsd: 24,
          summary: '年払い時の月額換算（年額$288）。Standardを継続利用する人向け。',
        },
      },
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 60,
        summary: 'より多いFast GPU Time、Stealth Mode、並列生成を求める人向け。',
        yearly: {
          monthlyCostUsd: 48,
          summary: '年払い時の月額換算（年額$576）。Proを継続利用する人向け。',
        },
      },
      {
        id: 'mega',
        name: 'Mega',
        monthlyCostUsd: 120,
        summary: '制作量が多い個人・事業者向けの最上位プラン。',
        yearly: {
          monthlyCostUsd: 96,
          summary: '年払い時の月額換算（年額$1,152）。Megaを継続利用する制作量の多い人向け。',
        },
      },
    ],
  },
  {
    id: 'runway',
    name: 'Runway',
    categories: ['動画', '画像', 'デザイン'],
    accent: 'from-[#b6ff00] via-[#00d5ff] to-[#3b00ff]',
    mark: 'RW',
    vibe: '動画',
    description: 'AI動画、画像、音声、映像編集ワークフローをまとめて使いたい人向け。',
    sourceUrl: 'https://runwayml.com/pricing',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'standard',
        name: 'Standard',
        monthlyCostUsd: 15,
        summary: '625 credits/月で動画・画像生成を始める人向け。',
        yearly: {
          monthlyCostUsd: 12,
          summary: '年払い時の月額換算（年額$144）。Standardを継続利用する人向け。',
        },
      },
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 35,
        summary: '2250 credits/月と高度な制作機能を使いたい人向け。',
        yearly: {
          monthlyCostUsd: 28,
          summary: '年払い時の月額換算（年額$336）。Proを継続利用する人向け。',
        },
      },
      {
        id: 'unlimited',
        name: 'Unlimited',
        monthlyCostUsd: 95,
        summary: 'Explore Modeで画像・動画生成を多く回したい人向け。',
        yearly: {
          monthlyCostUsd: 76,
          summary: '年払い時の月額換算（年額$912）。Unlimitedを継続利用する人向け。',
        },
      },
    ],
  },
]

function isYearly(value: unknown): value is SubscriptionCatalogPlanYearly {
  const yearly = value as SubscriptionCatalogPlanYearly
  return Boolean(yearly && typeof yearly.monthlyCostUsd === 'number')
}

function isPlan(value: unknown): value is SubscriptionCatalogPlan {
  const plan = value as SubscriptionCatalogPlan
  if (!plan || typeof plan.id !== 'string' || typeof plan.name !== 'string') return false
  if (typeof plan.monthlyCostUsd !== 'number' || typeof plan.summary !== 'string') return false
  if (plan.yearly !== undefined && !isYearly(plan.yearly)) return false
  return true
}

function isService(value: unknown): value is SubscriptionCatalogService {
  const service = value as SubscriptionCatalogService
  return Boolean(
    service &&
      typeof service.id === 'string' &&
      typeof service.name === 'string' &&
      Array.isArray(service.categories) &&
      service.categories.length > 0 &&
      typeof service.accent === 'string' &&
      typeof service.mark === 'string' &&
      typeof service.vibe === 'string' &&
      typeof service.description === 'string' &&
      typeof service.sourceUrl === 'string' &&
      typeof service.updatedAt === 'string' &&
      Array.isArray(service.plans) &&
      service.plans.every(isPlan),
  )
}

export function normalizeSubscriptionCatalog(value: unknown) {
  if (!Array.isArray(value) || !value.every(isService)) {
    return defaultSubscriptionCatalog
  }
  return value
}

export async function getSubscriptionCatalog() {
  const remoteUrl = process.env.AINCARN_SUBSCRIPTION_CATALOG_URL
  if (!remoteUrl) return defaultSubscriptionCatalog

  try {
    const response = await fetch(remoteUrl, {
      cache: 'no-store',
      next: { revalidate: 0 },
    })
    if (!response.ok) return defaultSubscriptionCatalog
    return normalizeSubscriptionCatalog(await response.json())
  } catch {
    return defaultSubscriptionCatalog
  }
}
