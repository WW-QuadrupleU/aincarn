import type { AiosProfileInput, AiosTaskInput, SavedAiosTask } from '@/lib/aios-store'
import { createStarterTasks } from '@/lib/aios-store'

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const DEFAULT_MODEL = process.env.AINCARN_AIOS_MODEL || 'claude-sonnet-4-5'
const MAX_OUTPUT_TOKENS = 2048

export type GeneratedPlan = {
  tasks: AiosTaskInput[]
  rationale: string
  model: string
}

export function hasAiosAi() {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

const SYSTEM_PROMPT = `あなたはAincarn OSの中核を担うAIプランナーです。ユーザーが達成したい目標を受け取り、現実的で具体的なタスクに分解し、各タスクに最適なAIツールとそのまま貼り付けて実行できるプロンプトを添えます。

## 出力仕様
必ず以下のJSON形式のみで応答してください（前後に余計なテキストを含めない）。

{
  "rationale": "なぜこの順序・構成にしたか、80-160字程度の日本語",
  "tasks": [
    {
      "title": "20-40字程度の具体的なタスク名",
      "reason": "なぜこのタスクが目標達成に効くか、60-120字",
      "domain": "Decision | Research | Action | Build | Reflect のいずれか",
      "impact": 1-5の整数（目標達成への効きやすさ）,
      "effort": 1-5の整数（必要な労力）,
      "recommendedTool": "ChatGPT | Claude | Gemini | Perplexity | GitHub Copilot | Cursor | Midjourney | Runway | NotebookLM のいずれか",
      "prompt": "そのAIツールにそのままコピペして使える具体的なプロンプト。150-400字。日本語。"
    }
  ]
}

## タスク設計の原則
- 5〜7個生成する
- 全タスク合計で1〜2週間で完遂できる粒度
- 最初の1〜2個は「今日始められる」短時間のもの
- impactとeffortは互いに独立に評価する（impact高くてeffort低い=最優先）
- 同じツールばかりに偏らせない（目的に応じて最適なツールを選ぶ）

## AIツールの使い分け基準
- ChatGPT: 万能型。アイデア出し、企画書、汎用ライティング、画像生成
- Claude: 長文読解、構造化、Codeレビュー、戦略立案、繊細な文章
- Gemini: Google連携、調査、リサーチ、動画生成、データ分析
- Perplexity: 出典付きリサーチ、最新情報の調査、比較表作成
- GitHub Copilot / Cursor: コード実装、エディタ内補助
- Midjourney: 高品質画像生成、デザイン案
- Runway: 動画生成・編集
- NotebookLM: 既存資料の要約・対話型理解

## プロンプトの質の基準
- 役割設定 + 文脈 + 出力フォーマット指定の3点を含める
- 抽象的でなく具体例や制約を含める
- ユーザーの目標と現状を反映する`

type AnthropicResponse = {
  content: Array<{ type: string; text?: string }>
  model: string
}

function buildUserPrompt(profile: AiosProfileInput) {
  return [
    `# ユーザーの目標`,
    profile.goal,
    ``,
    `# 期間`,
    profile.horizon,
    profile.currentState ? `\n# 現状\n${profile.currentState}` : '',
    profile.values ? `\n# 価値観・優先したいこと\n${profile.values}` : '',
    profile.constraints ? `\n# 制約・避けたいこと\n${profile.constraints}` : '',
    ``,
    `上記を踏まえて、Aincarn OS用のタスクプランをJSONで生成してください。`,
  ]
    .filter(Boolean)
    .join('\n')
}

const VALID_DOMAINS = ['Decision', 'Research', 'Action', 'Build', 'Reflect']
const VALID_TOOLS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Perplexity',
  'GitHub Copilot',
  'Cursor',
  'Midjourney',
  'Runway',
  'NotebookLM',
]

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const num = Math.round(Number(value))
  if (!Number.isFinite(num)) return fallback
  return Math.max(min, Math.min(max, num))
}

function pickFromAllowed(value: unknown, allowed: string[], fallback: string) {
  const text = String(value || '').trim()
  return allowed.find((item) => item.toLowerCase() === text.toLowerCase()) || fallback
}

function coerceTask(raw: unknown): AiosTaskInput {
  const obj = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
  const title = String(obj.title || '').trim() || '目標達成に必要な行動を1つ実行する'
  const reason = String(obj.reason || '').trim() || '目標から逆算した行動です。'
  const domain = pickFromAllowed(obj.domain, VALID_DOMAINS, 'Action')
  const recommendedTool = pickFromAllowed(obj.recommendedTool, VALID_TOOLS, 'ChatGPT')
  const prompt = String(obj.prompt || '').trim()
  return {
    title: title.slice(0, 120),
    reason: reason.slice(0, 280),
    domain,
    impact: clampInt(obj.impact, 1, 5, 3),
    effort: clampInt(obj.effort, 1, 5, 3),
    status: 'todo',
    recommendedTool,
    prompt: prompt.slice(0, 1200),
  }
}

function parsePlanJson(text: string, fallbackProfile: AiosProfileInput): { tasks: AiosTaskInput[]; rationale: string } {
  // Try to extract JSON object even if model wrapped in code fences
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) {
    return {
      tasks: createStarterTasks(fallbackProfile),
      rationale: 'AIの応答からJSONを抽出できなかったため、テンプレートで起動しました。',
    }
  }
  try {
    const parsed = JSON.parse(match[0]) as { tasks?: unknown[]; rationale?: unknown }
    const rawTasks = Array.isArray(parsed.tasks) ? parsed.tasks : []
    if (rawTasks.length === 0) {
      return {
        tasks: createStarterTasks(fallbackProfile),
        rationale: String(parsed.rationale || '初期テンプレートで起動しました。'),
      }
    }
    return {
      tasks: rawTasks.slice(0, 8).map(coerceTask),
      rationale: String(parsed.rationale || '').slice(0, 320),
    }
  } catch {
    return {
      tasks: createStarterTasks(fallbackProfile),
      rationale: 'AIの応答を解析できなかったため、テンプレートで起動しました。',
    }
  }
}

export async function generateAiPlan(profile: AiosProfileInput): Promise<GeneratedPlan> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return {
      tasks: createStarterTasks(profile),
      rationale: 'AI生成は環境変数 ANTHROPIC_API_KEY が未設定のため、テンプレートで起動しました。',
      model: 'template',
    }
  }

  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: [
          {
            type: 'text',
            text: SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: buildUserPrompt(profile),
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`Anthropic API ${response.status}: ${errorText.slice(0, 240)}`)
    }

    const data = (await response.json()) as AnthropicResponse
    const text = data.content?.find((item) => item.type === 'text')?.text || ''
    const { tasks, rationale } = parsePlanJson(text, profile)

    return {
      tasks,
      rationale: rationale || 'AIが目標から逆算したプランです。',
      model: data.model || DEFAULT_MODEL,
    }
  } catch (error) {
    return {
      tasks: createStarterTasks(profile),
      rationale: `AI生成でエラーが発生したためテンプレートで起動しました（${error instanceof Error ? error.message : 'unknown'}）。`,
      model: 'template',
    }
  }
}

const TOOL_URLS: Record<string, string> = {
  ChatGPT: 'https://chatgpt.com/',
  Claude: 'https://claude.ai/new',
  Gemini: 'https://gemini.google.com/app',
  Perplexity: 'https://www.perplexity.ai/',
  'GitHub Copilot': 'https://github.com/copilot',
  Cursor: 'https://cursor.com/',
  Midjourney: 'https://www.midjourney.com/explore',
  Runway: 'https://app.runwayml.com/',
  NotebookLM: 'https://notebooklm.google.com/',
}

export function getToolUrl(tool: string | undefined | null) {
  if (!tool) return ''
  return TOOL_URLS[tool] || ''
}

export type ClientTask = SavedAiosTask & {
  toolUrl?: string
}

export function enrichTaskForClient(task: SavedAiosTask): ClientTask {
  return {
    ...task,
    toolUrl: getToolUrl(task.recommendedTool),
  }
}
