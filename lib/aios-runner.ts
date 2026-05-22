// Aincarn proxy execution layer.
//
// Runs a task's prompt against the most appropriate provider for the
// recommended tool, falling back to Claude when a provider has no
// consumer API (Copilot, Cursor, Midjourney, Runway, NotebookLM) or
// when its key is not configured. The point of execution is that the
// user never leaves Aincarn — answers come back into the task and into
// Aincarn Memory.

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const OPENAI_API = 'https://api.openai.com/v1/chat/completions'
const PERPLEXITY_API = 'https://api.perplexity.ai/chat/completions'
const GOOGLE_API = 'https://generativelanguage.googleapis.com/v1beta/models'

const MAX_OUTPUT_TOKENS = 1800

export type RunProvider = 'anthropic' | 'openai' | 'google' | 'perplexity'

export type RunResult = {
  output: string
  provider: RunProvider
  model: string
  fallbackReason?: string
}

// Default per-run models are tuned for cost. Plan generation in
// lib/aios-ai.ts intentionally keeps a heavier model so the initial
// decomposition stays high quality, while individual task execution
// runs much more frequently and uses cheaper / faster variants.
const DEFAULT_MODELS: Record<RunProvider, string> = {
  anthropic: process.env.AINCARN_RUN_ANTHROPIC_MODEL || 'claude-haiku-4-5',
  openai: process.env.AINCARN_RUN_OPENAI_MODEL || 'gpt-5-mini',
  google: process.env.AINCARN_RUN_GOOGLE_MODEL || 'gemini-2.5-flash',
  perplexity: process.env.AINCARN_RUN_PERPLEXITY_MODEL || 'sonar',
}

const TOOLS_WITHOUT_API = new Set(['GitHub Copilot', 'Cursor', 'Midjourney', 'Runway', 'NotebookLM'])

function providerForTool(tool: string): { preferred: RunProvider; needsFallback: boolean } {
  switch (tool) {
    case 'ChatGPT':
      return { preferred: 'openai', needsFallback: false }
    case 'Claude':
      return { preferred: 'anthropic', needsFallback: false }
    case 'Gemini':
      return { preferred: 'google', needsFallback: false }
    case 'Perplexity':
      return { preferred: 'perplexity', needsFallback: false }
    default:
      return { preferred: 'anthropic', needsFallback: TOOLS_WITHOUT_API.has(tool) }
  }
}

function availability(): Record<RunProvider, boolean> {
  return {
    anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    google: Boolean(process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY),
    perplexity: Boolean(process.env.PERPLEXITY_API_KEY),
  }
}

export function getRunCapabilities() {
  const avail = availability()
  return {
    providers: avail,
    anyAvailable: Object.values(avail).some(Boolean),
  }
}

function styleHint(tool: string) {
  switch (tool) {
    case 'GitHub Copilot':
    case 'Cursor':
      return 'コード実装支援AIとして、実装に必要なコードや設計、コマンドを具体的に提示してください。コードブロックは言語名付きで出力。'
    case 'Midjourney':
      return '画像生成は実行できないため、Midjourneyに与えるべき詳細な英語プロンプト案を3パターンと、各案の意図・スタイル指定を日本語で解説してください。'
    case 'Runway':
      return '動画生成は実行できないため、Runway Gen系に渡すべき詳細な英語プロンプト案、必要なクリップ素材、推奨設定（duration, motion strength, seed戦略）を提示してください。'
    case 'NotebookLM':
      return '対象資料を読み込んでいる前提で、要点抽出、対比、質問リストを構造化された日本語で提示してください。'
    default:
      return ''
  }
}

type AnthropicResponse = {
  content: Array<{ type: string; text?: string }>
  model: string
}

async function runAnthropic(prompt: string, tool: string, fallbackReason?: string): Promise<RunResult> {
  const hint = styleHint(tool)
  const system = `あなたはAincarn OSが委任した実行AIです。返答は日本語で、最初に短い結論、続いて根拠と具体策を整理してください。${hint}`

  const response = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: DEFAULT_MODELS.anthropic,
      max_tokens: MAX_OUTPUT_TOKENS,
      system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    }),
  })
  if (!response.ok) throw new Error(`Anthropic ${response.status}: ${(await response.text()).slice(0, 200)}`)
  const data = (await response.json()) as AnthropicResponse
  return {
    output: data.content?.find((item) => item.type === 'text')?.text || '',
    provider: 'anthropic',
    model: data.model || DEFAULT_MODELS.anthropic,
    fallbackReason,
  }
}

type OpenAIResponse = {
  choices: Array<{ message: { content: string } }>
  model: string
}

async function runOpenAI(prompt: string): Promise<RunResult> {
  const response = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODELS.openai,
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        {
          role: 'system',
          content: 'あなたはAincarn OSが委任したChatGPTです。日本語で結論→根拠→具体策の順に簡潔に答えてください。',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 200)}`)
  const data = (await response.json()) as OpenAIResponse
  return {
    output: data.choices?.[0]?.message?.content || '',
    provider: 'openai',
    model: data.model || DEFAULT_MODELS.openai,
  }
}

type GeminiResponse = {
  candidates: Array<{ content: { parts: Array<{ text?: string }> } }>
}

async function runGoogle(prompt: string): Promise<RunResult> {
  const key = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY
  const model = DEFAULT_MODELS.google
  const response = await fetch(`${GOOGLE_API}/${encodeURIComponent(model)}:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: 'あなたはAincarn OSが委任したGeminiです。日本語で結論→根拠→具体策の順に答えてください。',
          },
        ],
      },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
    }),
  })
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${(await response.text()).slice(0, 200)}`)
  const data = (await response.json()) as GeminiResponse
  const output = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim() || ''
  return { output, provider: 'google', model }
}

async function runPerplexity(prompt: string): Promise<RunResult> {
  const response = await fetch(PERPLEXITY_API, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODELS.perplexity,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        {
          role: 'system',
          content: 'あなたはAincarn OSが委任したPerplexityです。日本語で、結論を最初に置き、根拠リンクと要点を整理してください。',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })
  if (!response.ok) throw new Error(`Perplexity ${response.status}: ${(await response.text()).slice(0, 200)}`)
  const data = (await response.json()) as OpenAIResponse
  return {
    output: data.choices?.[0]?.message?.content || '',
    provider: 'perplexity',
    model: data.model || DEFAULT_MODELS.perplexity,
  }
}

export async function runPrompt(prompt: string, tool: string): Promise<RunResult> {
  const trimmed = String(prompt || '').trim()
  if (!trimmed) throw new Error('プロンプトが空です')

  const { preferred, needsFallback } = providerForTool(tool)
  const avail = availability()

  let provider = preferred
  let fallbackReason: string | undefined
  if (needsFallback || !avail[preferred]) {
    if (avail.anthropic) {
      provider = 'anthropic'
      fallbackReason = needsFallback
        ? `${tool}は外部実行が必要なツールなので、Claudeで代理実行（プロンプト案や設計ガイドとして出力）`
        : `${tool}用のAPIキーが未設定のため、Claudeで代理実行`
    } else {
      throw new Error('実行できるAIプロバイダのAPIキーが設定されていません')
    }
  }

  switch (provider) {
    case 'anthropic':
      return runAnthropic(trimmed, tool, fallbackReason)
    case 'openai':
      return runOpenAI(trimmed)
    case 'google':
      return runGoogle(trimmed)
    case 'perplexity':
      return runPerplexity(trimmed)
  }
}
