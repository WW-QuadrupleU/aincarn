import type { AiosPathMove, AiosProfileInput, AiosTaskInput, SavedAiosFuture, SavedAiosMessage, SavedAiosSignal, SavedAiosTask } from '@/lib/aios-store'
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
  usage?: {
    input_tokens?: number
    output_tokens?: number
  }
}

export type AiosModelUsage = {
  inputTokens: number
  outputTokens: number
  estimatedUsd: number | null
}

export type GeneratedFuturePath = {
  moves: AiosPathMove[]
  beyond: string[]
  rationale: string
  model: string
  usage?: AiosModelUsage
}

export type ConversationReply = {
  content: string
  model: string
}

const MODEL_TOKEN_PRICING: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-sonnet-4-5': { input: 3, output: 15 },
  'claude-opus-4-7': { input: 5, output: 25 },
}

function calculateModelUsage(model: string, usage?: AnthropicResponse['usage']): AiosModelUsage | undefined {
  if (!usage) return undefined
  const inputTokens = Number(usage.input_tokens || 0)
  const outputTokens = Number(usage.output_tokens || 0)
  const pricing = MODEL_TOKEN_PRICING[model]
  return {
    inputTokens,
    outputTokens,
    estimatedUsd: pricing ? (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000 : null,
  }
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

function fallbackFuturePath(future: SavedAiosFuture, signals: SavedAiosSignal[]): GeneratedFuturePath {
  const recentAction = signals.find((signal) => signal.kind === 'action')?.content
  const recentAchievement = signals.find((signal) => signal.kind === 'achievement')?.content
  const currentEvidence = recentAchievement || recentAction
  return {
    moves: [
      {
        title: `${future.statement}の到達条件を言葉にする`,
        reason: '向かう未来が明確になるほど、次の行動を選ぶ基準がぶれにくくなります。',
        certainty: 'now',
      },
      {
        title: currentEvidence ? `「${currentEvidence.slice(0, 22)}」から次の検証を決める` : '現在持っている資産を1つ書き出す',
        reason: '過去の行動や実績を土台にすることで、自分に合った経路へ絞り込めます。',
        certainty: 'next',
      },
      {
        title: '小さな結果を残し、道筋を更新する',
        reason: '実際の反応や成果をDNAに戻すと、先の一手を現実に合わせて変えられます。',
        certainty: 'emerging',
      },
    ],
    beyond: ['自分に合う方法が見える', '継続できる形になる', future.statement],
    rationale: '蓄積されたDNAを起点に、まず判断基準と小さな検証を置く道筋です。行動や実績が増えると、次の二手は更新できます。',
    model: 'template',
  }
}

function parseFuturePath(text: string, fallback: GeneratedFuturePath): Omit<GeneratedFuturePath, 'model'> {
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return fallback
  try {
    const parsed = JSON.parse(match[0]) as Record<string, unknown>
    const rawMoves = Array.isArray(parsed.moves) ? parsed.moves : []
    if (rawMoves.length < 3) return fallback
    const certainties: AiosPathMove['certainty'][] = ['now', 'next', 'emerging']
    const moves = rawMoves.slice(0, 3).map((rawMove, index) => {
      const move = rawMove && typeof rawMove === 'object' ? (rawMove as Record<string, unknown>) : {}
      return {
        title: String(move.title || '').trim().slice(0, 70) || fallback.moves[index].title,
        reason: String(move.reason || '').trim().slice(0, 180) || fallback.moves[index].reason,
        certainty: certainties[index],
      }
    })
    const beyond = (Array.isArray(parsed.beyond) ? parsed.beyond : fallback.beyond)
      .slice(0, 3)
      .map((item) => String(item).trim().slice(0, 36))
      .filter(Boolean)
    return {
      moves,
      beyond: beyond.length ? beyond : fallback.beyond,
      rationale: String(parsed.rationale || fallback.rationale).trim().slice(0, 260),
    }
  } catch {
    return fallback
  }
}

export async function generateFuturePath(
  future: SavedAiosFuture,
  signals: SavedAiosSignal[],
  options: { model?: string } = {},
): Promise<GeneratedFuturePath> {
  const fallback = fallbackFuturePath(future, signals)
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return fallback
  const model = options.model || DEFAULT_MODEL

  const dna = signals
    .slice(0, 20)
    .map((signal) => `[${signal.kind}] ${signal.content}`)
    .join('\n')

  try {
    const response = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 1200,
        system: `あなたはAincarn OSのPath Designerです。ユーザーが選んだ未来とDigital DNAを読み、遠いロードマップではなく、今見えている最初の3手だけを設計してください。

必ずJSONのみで返してください:
{
  "rationale": "なぜ今この道筋なのか。90〜150字の日本語",
  "moves": [
    { "title": "今日から着手できる最初の一手", "reason": "理由" },
    { "title": "一手目の結果を受けて有力な二手目", "reason": "理由" },
    { "title": "現時点では仮説である三手目", "reason": "理由" }
  ],
  "beyond": ["その先に感じられる変化", "将来像", "到達する未来"]
}

原則:
- 1手目は具体的で、小さく実行可能にする
- 2手目はDNA内の行動・実績次第で変わりうるものにする
- 3手目は断定せず仮説として描く
- 目標を勝手に変更しない
- DNAにない経歴や成果を作らない`,
        messages: [
          {
            role: 'user',
            content: `Chosen Future:\n${future.statement}\n\nDigital DNA (新しい順):\n${dna || 'まだ目標以外の断片はありません。'}\n\nこの未来に向けて、直近の3手とその先の気配をJSONで作成してください。`,
          },
        ],
      }),
    })
    if (!response.ok) throw new Error(`Anthropic ${response.status}`)
    const data = (await response.json()) as AnthropicResponse
    const text = data.content?.find((item) => item.type === 'text')?.text || ''
    const parsed = parseFuturePath(text, fallback)
    const resultModel = data.model || model
    return { ...parsed, model: resultModel, usage: calculateModelUsage(resultModel, data.usage) }
  } catch {
    return fallback
  }
}

function templateConversationReply(messages: SavedAiosMessage[]) {
  const userTurns = messages.filter((message) => message.role === 'user').length
  if (userTurns <= 1) {
    return 'いいですね。まず、このプロジェクトで「達成できた」と判断できる変化を1つだけ教えてください。数字でなくても、明確な状態で大丈夫です。'
  }
  if (userTurns === 2) {
    return 'その状態を目指すうえで、今すでに持っている資産と、いちばん詰まっていることは何でしょうか。時間、経験、集客、予算のどれでも構いません。'
  }
  if (userTurns === 3) {
    return '優先順位を決めるため、使える時間と避けたいリスクを教えてください。ここまで整理できれば、最初の行動案へ変換できます。'
  }
  return '整理できてきました。「行動案を作る」を押すと、この会話をもとに次に進むためのタスクと実行手順を作成します。別の方針を検討したい場合は、迷っている選択肢を書いてください。'
}

export async function generateConversationReply(
  projectName: string,
  messages: SavedAiosMessage[],
): Promise<ConversationReply> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return { content: templateConversationReply(messages), model: 'guided-template' }
  }

  const transcript = messages
    .slice(-12)
    .map((message) => `${message.role === 'user' ? 'ユーザー' : 'Aincarn'}: ${message.content}`)
    .join('\n')

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
        max_tokens: 420,
        system:
          'あなたはAincarn OSの対話ナビゲーターです。結論を急がず、ユーザーが目標・成功条件・制約・選択肢を整理できるよう支援してください。返答は日本語で120〜240字程度。必要なら観点を整理し、最後に答えやすい問いを1つだけ置いてください。',
        messages: [
          {
            role: 'user',
            content: `プロジェクト名: ${projectName}\n\nこれまでの対話:\n${transcript}\n\n次に返すべき支援メッセージを書いてください。`,
          },
        ],
      }),
    })
    if (!response.ok) throw new Error(`Anthropic ${response.status}`)
    const data = (await response.json()) as AnthropicResponse
    const content = data.content?.find((item) => item.type === 'text')?.text?.trim()
    if (!content) throw new Error('empty response')
    return { content, model: data.model || DEFAULT_MODEL }
  } catch {
    return { content: templateConversationReply(messages), model: 'guided-template' }
  }
}

export function profileFromConversation(
  projectName: string,
  messages: SavedAiosMessage[],
  existing?: AiosProfileInput | null,
  signals: SavedAiosSignal[] = [],
  projectId?: string,
): AiosProfileInput {
  const userNotes = messages
    .filter((message) => message.role === 'user')
    .map((message) => message.content.trim())
    .filter(Boolean)
  const relevantSignals = signals.filter((signal) => !projectId || signal.projectId === projectId)
  const goals = relevantSignals.filter((signal) => signal.kind === 'goal').map((signal) => signal.content)
  const interests = relevantSignals.filter((signal) => signal.kind === 'interest').map((signal) => signal.content)
  const actions = relevantSignals.filter((signal) => signal.kind === 'action').map((signal) => signal.content)
  const achievements = relevantSignals.filter((signal) => signal.kind === 'achievement').map((signal) => signal.content)
  const insights = relevantSignals.filter((signal) => signal.kind === 'insight').map((signal) => signal.content)
  const first = goals[0] || userNotes[0] || existing?.goal || projectName
  const dnaContext = [
    interests.length ? `関心: ${interests.slice(0, 3).join(' / ')}` : '',
    actions.length ? `最近の行動: ${actions.slice(0, 3).join(' / ')}` : '',
    achievements.length ? `実績: ${achievements.slice(0, 3).join(' / ')}` : '',
    insights.length ? `気づき: ${insights.slice(0, 3).join(' / ')}` : '',
  ].filter(Boolean)
  return {
    goal: first,
    horizon: existing?.horizon || '90日',
    currentState: [...dnaContext, ...userNotes.slice(1)].join('\n') || existing?.currentState || '',
    values: interests.join(' / ') || existing?.values || '',
    constraints: existing?.constraints || '',
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
