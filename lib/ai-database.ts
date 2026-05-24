import type { SubscriptionInput } from '@/lib/subscription-store'

// ==========================================
// 1. AI Models (APIs) Data Structures
// ==========================================

export type AiGenreId =
  | 'research'
  | 'writing'
  | 'coding'
  | 'analysis'
  | 'agent'
  | 'textImage'
  | 'imageImage'
  | 'textVideo'
  | 'imageVideo'
  | 'textSpeech'

export type AiGenre = {
  id: AiGenreId
  label: string
  shortLabel: string
  description: string
  primaryMetrics: string[]
  sourceMetric: string
}

export type AiModel = {
  id: string
  name: string
  creator: string
  family: string
  releaseLabel: string
  modality: 'LLM' | 'Image' | 'Video' | 'Audio'
  accessType: 'Proprietary' | 'Open weights' | 'Specialized'
  costLevel: 1 | 2 | 3 | 4 | 5
  speed: number
  japanese: number
  context: number
  visibleIn: AiGenreId[]
  performance: Record<AiGenreId, number>
  costPerformance: Record<AiGenreId, number>
  strengths: string[]
  cautions: string[]
  bestFor: string
  avoidFor: string
  note: string
  rank?: number
  metric?: string
  priceLabel?: string
  sourceUrl?: string
}

export type AiModelComparePayload = {
  models: AiModel[]
  updatedAt: string
  source: 'live' | 'fallback'
  sourceLabel: string
  sourceUrl: string
  isLive: boolean
  message: string
}

// ==========================================
// 2. Subscription Data Structures
// ==========================================

export type SubscriptionCategory =
  | 'チャット'
  | '文章'
  | '画像'
  | '動画'
  | '音声'
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

  // --- Pricing Matrix Data (Merged) ---
  category?: string
  includes?: string[]
  bestFor?: string
  cautions?: string
  matrixX?: ('general' | 'coding' | 'media' | 'audio')[]
  matrixY?: 'free' | 'low' | 'mid' | 'high' | 'premium'
}

export type SubscriptionCatalogService = {
  id: string
  name: string
  provider: string
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

// For flat array generation
export type PlanRow = {
  service: string
  plan: string
  provider: string
  monthlyUsd: number
  yearlyUsd?: number
  category: string
  includes: string[]
  bestFor: string
  cautions: string
  sourceUrl: string
  matrixX: ('general' | 'coding' | 'media' | 'audio')[]
  matrixY: 'free' | 'low' | 'mid' | 'high' | 'premium'
  isApi?: boolean
}

// ==========================================
// 3. Static Data (Constants)
// ==========================================

export const AI_GENRES: AiGenre[] = [
  {
    id: 'research',
    label: 'リサーチ・情報整理',
    shortLabel: 'リサーチ',
    description: '情報収集、出典確認、比較検討、長い資料の整理に向くLLMを比較します。',
    primaryMetrics: ['推論力', '長文読解', '出典確認', '情報整理'],
    sourceMetric: '公開ベンチマーク、速度、価格、文脈長、用途適性を項目別に確認します。',
  },
  {
    id: 'writing',
    label: '文章作成・記事改善',
    shortLabel: '文章',
    description: '記事作成、リライト、構成整理、トーン調整に向くLLMを比較します。',
    primaryMetrics: ['推論力', '指示追従', '長文編集', '日本語運用'],
    sourceMetric: '文章品質、長文処理、指示追従、料金バランスを項目別に確認します。',
  },
  {
    id: 'coding',
    label: 'コード・開発補助',
    shortLabel: 'コード',
    description: '実装、デバッグ、設計相談、既存コード読解に向くLLMを比較します。',
    primaryMetrics: ['Coding Index', '実装力', 'デバッグ', '設計相談'],
    sourceMetric: 'コード系ベンチマーク、推論力、価格、実装補助の相性を項目別に確認します。',
  },
  {
    id: 'analysis',
    label: 'データ分析・表計算',
    shortLabel: '分析',
    description: '数値処理、表計算、グラフ化、業務データ整理に向くLLMを比較します。',
    primaryMetrics: ['Math Index', '数値処理', '表計算', '推論力'],
    sourceMetric: '数理・分析系ベンチマーク、推論力、表計算やデータ整理の相性を項目別に確認します。',
  },
  {
    id: 'agent',
    label: 'エージェント性能',
    shortLabel: 'エージェント',
    description: 'ツール実行、複数ステップの作業、長時間の自律タスクに向くLLMを比較します。',
    primaryMetrics: ['Agentic Index', 'ツール利用', '長時間タスク', '指示追従'],
    sourceMetric: 'エージェント系ベンチマーク、コード理解、長時間タスク適性、ツール利用のしやすさを項目別に確認します。',
  },
  {
    id: 'textImage',
    label: '画像生成（Text to Image）',
    shortLabel: '画像生成',
    description: 'テキストプロンプトから画像を生成するモデルを比較します。',
    primaryMetrics: ['Text to Image Elo', '画質', '指示追従', '商用運用'],
    sourceMetric: '画像生成の公開評価、価格、用途適性、商用利用時の確認しやすさを項目別に確認します。',
  },
  {
    id: 'imageImage',
    label: '画像編集（Image Editing）',
    shortLabel: '画像編集',
    description: '画像をもとに編集やバリエーション生成を行うモデルを比較します。',
    primaryMetrics: ['Image Editing Elo', '画質', '指示追従', '商用運用'],
    sourceMetric: '画像編集の公開評価、価格、用途適性、商用利用時の確認しやすさを項目別に確認します。',
  },
  {
    id: 'textVideo',
    label: '動画生成（Text to Video）',
    shortLabel: 'テキストから動画',
    description: 'テキストプロンプトだけから動画を生成するモデルを比較します。',
    primaryMetrics: ['Text to Video Elo', '映像品質', '動き', '素材化'],
    sourceMetric: '動画生成の公開評価、価格、生成品質、制作ワークフローへの組み込みやすさを項目別に確認します。',
  },
  {
    id: 'imageVideo',
    label: '動画生成（Image to Video）',
    shortLabel: '画像から動画',
    description: '参照画像をもとに動画を生成するモデルを比較します。',
    primaryMetrics: ['Image to Video Elo', '映像品質', '動き', '素材化'],
    sourceMetric: 'Image to Videoの公開評価、価格、動きの自然さ、素材制作での扱いやすさを項目別に確認します。',
  },
  {
    id: 'textSpeech',
    label: '音声生成（Text to Speech）',
    shortLabel: '音声生成',
    description: 'テキストを自然な音声に変換するモデルを比較します。ナレーション、読み上げ、対話エージェントに利用できます。',
    primaryMetrics: ['自然さ', '多言語対応', '感情表現', 'クローニング'],
    sourceMetric: 'TTSの自然さ、多言語対応、価格、クローニングの可否、商用利用時の制約を項目別に確認します。',
  },
]

const ZERO_PERFORMANCE: Record<AiGenreId, number> = {
  research: 0,
  writing: 0,
  coding: 0,
  analysis: 0,
  agent: 0,
  textImage: 0,
  imageImage: 0,
  textVideo: 0,
  imageVideo: 0,
  textSpeech: 0,
}

function scores(values: Partial<Record<AiGenreId, number>>): Record<AiGenreId, number> {
  return { ...ZERO_PERFORMANCE, ...values }
}

export const FALLBACK_UPDATED_AT = '2026-05-06T00:00:00.000+09:00'

export const FALLBACK_AI_MODELS: AiModel[] = [
  {
    id: 'gpt-5-5-xhigh',
    name: 'GPT-5.5 (xhigh)',
    creator: 'OpenAI',
    family: 'GPT',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 5,
    speed: 73,
    japanese: 92,
    context: 92,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 1,
    metric: 'Intelligence Index 60',
    priceLabel: '$11.25 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 100, writing: 100, coding: 96, analysis: 96, agent: 98 }),
    costPerformance: scores({ research: 67, writing: 67, coding: 65, analysis: 65, agent: 66 }),
    strengths: ['総合推論が非常に強い', 'コード、分析、複雑な設計相談に向く', '難しい指示を粘り強く処理しやすい'],
    cautions: ['高コストで待ち時間も長め', '軽い要約や分類には過剰になりやすい'],
    bestFor: '難しい分析、コード、設計、記事改善の最終判断まで任せたい人。',
    avoidFor: '低コストで大量処理したい用途。',
    note: '公開ベンチマークと料金情報をもとにした初期評価データです。',
  },
  {
    id: 'gpt-5-5-high',
    name: 'GPT-5.5 (high)',
    creator: 'OpenAI',
    family: 'GPT',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 5,
    speed: 71,
    japanese: 92,
    context: 92,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 2,
    metric: 'Intelligence Index 59',
    priceLabel: '$7.50 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 98, writing: 98, coding: 95, analysis: 94, agent: 96 }),
    costPerformance: scores({ research: 68, writing: 68, coding: 66, analysis: 65, agent: 67 }),
    strengths: ['xhigh版に肉薄する推論能力', 'コストと知能のバランスが良い'],
    cautions: ['それでも日常使いには少し高額', 'APIリミットに注意が必要'],
    bestFor: '高い推論能力を求めるが、最上位ほどのコストはかけたくない人。',
    avoidFor: '大量の翻訳や短文の対話。',
    note: '公開ベンチマークと料金情報をもとにした初期評価データです。',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    creator: 'Anthropic',
    family: 'Claude',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 4,
    speed: 85,
    japanese: 90,
    context: 95,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 3,
    metric: 'Intelligence Index 58',
    priceLabel: '$3.00 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 96, writing: 97, coding: 99, analysis: 91, agent: 94 }),
    costPerformance: scores({ research: 82, writing: 83, coding: 85, analysis: 78, agent: 80 }),
    strengths: ['コーディング能力が圧倒的', '自然で人間らしい長文執筆', '生成スピードが速い'],
    cautions: ['API利用時のシステムプロンプトの扱いに癖がある'],
    bestFor: 'AIエディタでのコーディング、長文の記事作成・推敲を行いたい人。',
    avoidFor: '数学的な厳密なパズルを解かせる用途。',
    note: '公開ベンチマークと料金情報をもとにした初期評価データです。',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    creator: 'OpenAI',
    family: 'GPT',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 4,
    speed: 92,
    japanese: 88,
    context: 80,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 4,
    metric: 'Intelligence Index 55',
    priceLabel: '$2.50 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 92, writing: 90, coding: 88, analysis: 92, agent: 90 }),
    costPerformance: scores({ research: 85, writing: 83, coding: 81, analysis: 85, agent: 83 }),
    strengths: ['非常に高速なレスポンス', 'バランスの良いマルチモーダル能力', 'JSON等の出力安定性が高い'],
    cautions: ['複雑な推論ではo1系やClaudeに譲る', 'コンテキスト長が他より短い'],
    bestFor: '一般的なアシスタント用途、音声対話、画像解析を伴う処理。',
    avoidFor: '数万行のコードベースを一度に読ませる用途。',
    note: '公開ベンチマークと料金情報をもとにした初期評価データです。',
  },
  {
    id: 'gemini-1-5-pro',
    name: 'Gemini 1.5 Pro',
    creator: 'Google',
    family: 'Gemini',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 4,
    speed: 78,
    japanese: 86,
    context: 100,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 5,
    metric: 'Intelligence Index 54',
    priceLabel: '$1.25 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 95, writing: 85, coding: 86, analysis: 88, agent: 85 }),
    costPerformance: scores({ research: 92, writing: 82, coding: 83, analysis: 85, agent: 82 }),
    strengths: ['圧倒的なコンテキスト長(2M tokens)', '長時間の動画・音声解析に強い'],
    cautions: ['出力が長くなりやすい', '検閲がやや厳格に働くことがある'],
    bestFor: '本一冊分のテキストや長編動画を一括で解析・要約したい人。',
    avoidFor: '1問1答の素早いレスポンスを求める用途。',
    note: '公開ベンチマークと料金情報をもとにした初期評価データです。',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o-mini',
    creator: 'OpenAI',
    family: 'GPT',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 1,
    speed: 98,
    japanese: 85,
    context: 80,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 6,
    metric: 'Intelligence Index 50',
    priceLabel: '$0.15 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 80, writing: 82, coding: 75, analysis: 78, agent: 70 }),
    costPerformance: scores({ research: 100, writing: 100, coding: 98, analysis: 100, agent: 95 }),
    strengths: ['圧倒的な低コスト', '超高速レスポンス', '基本タスクには十分すぎる性能'],
    cautions: ['複雑な指示を無視しやすい', '高度な推論タスクでは破綻する'],
    bestFor: '単純な分類、翻訳、要約の大量バッチ処理、ルーチンワーク。',
    avoidFor: 'ゼロからの企画立案や、複雑なロジックの実装。',
    note: '公開ベンチマークと料金情報をもとにした初期評価データです。',
  },

  // ==========================================
  // Audio (Text to Speech) models
  // ==========================================
  {
    id: 'elevenlabs-v3',
    name: 'ElevenLabs v3',
    creator: 'ElevenLabs',
    family: 'ElevenLabs',
    releaseLabel: '2026年5月',
    modality: 'Audio',
    accessType: 'Specialized',
    costLevel: 4,
    speed: 86,
    japanese: 92,
    context: 0,
    visibleIn: ['textSpeech'],
    metric: 'TTS Arena top-tier',
    priceLabel: '$0.30 / 1000文字',
    sourceUrl: 'https://elevenlabs.io/pricing',
    performance: scores({ textSpeech: 96 }),
    costPerformance: scores({ textSpeech: 70 }),
    strengths: ['業界トップクラスの自然さ', '感情表現', '70+言語のクローニング'],
    cautions: ['日本語の細かいニュアンスはまだ揺れる場面がある', '料金は中〜上位'],
    bestFor: 'ナレーション、オーディオブック、プロフェッショナル用途のVA代替。',
    avoidFor: '大量・低単価のバッチTTS。',
    note: 'TTSの自然さでは現状最上位。商用利用条件は契約プランで異なる。',
  },
  {
    id: 'openai-tts-hd',
    name: 'OpenAI TTS-1 HD',
    creator: 'OpenAI',
    family: 'GPT-Audio',
    releaseLabel: '2024年11月',
    modality: 'Audio',
    accessType: 'Specialized',
    costLevel: 2,
    speed: 92,
    japanese: 85,
    context: 0,
    visibleIn: ['textSpeech'],
    metric: 'GPT-4o系のTTSラッパー',
    priceLabel: '$0.030 / 1000文字',
    sourceUrl: 'https://platform.openai.com/docs/guides/text-to-speech',
    performance: scores({ textSpeech: 84 }),
    costPerformance: scores({ textSpeech: 95 }),
    strengths: ['API統合が容易', '安定品質', '低コスト'],
    cautions: ['カスタム声は不可', '感情指定の幅が狭い'],
    bestFor: 'チャットアプリの読み上げ、ナビゲーション、通知音声。',
    avoidFor: '声優レベルの演技指定。',
    note: 'OpenAI Platform経由。Realtime APIでは別料金体系。',
  },
  {
    id: 'google-tts-chirp3',
    name: 'Google Chirp 3 HD',
    creator: 'Google',
    family: 'Chirp',
    releaseLabel: '2025年8月',
    modality: 'Audio',
    accessType: 'Specialized',
    costLevel: 2,
    speed: 90,
    japanese: 88,
    context: 0,
    visibleIn: ['textSpeech'],
    metric: 'Google Cloud TTS最新世代',
    priceLabel: '$0.030 / 1000文字',
    sourceUrl: 'https://cloud.google.com/text-to-speech/pricing',
    performance: scores({ textSpeech: 86 }),
    costPerformance: scores({ textSpeech: 93 }),
    strengths: ['日本語の自然さが高い', 'Google Cloud連携', 'カスタムボイス対応'],
    cautions: ['請求が分単位ではなく文字単位で計算しにくい'],
    bestFor: 'Google Cloud上のアプリで使うTTS、業務システムの音声化。',
    avoidFor: 'ハイエンドな演技音声制作。',
    note: 'Vertex AI経由でカスタムボイス（Studio）も利用可能。',
  },

]

export const FALLBACK_AI_PAYLOAD: AiModelComparePayload = {
  models: FALLBACK_AI_MODELS,
  updatedAt: FALLBACK_UPDATED_AT,
  source: 'fallback',
  sourceLabel: '公開ベンチマーク・料金情報・公式情報',
  sourceUrl: '/about',
  isLive: false,
  message:
    '現在は公開ベンチマーク、料金情報、公式情報をもとにしたAincarn編集データを表示しています。独自実測データは順次追加します。',
}

export const catalogUpdatedAt = '2026-05-22'

export const categoryOptions: SubscriptionCategory[] = [
  'チャット',
  '文章',
  '画像',
  '動画',
  '音声',
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
    provider: 'OpenAI',
    categories: ['チャット', '文章', '画像', '動画', 'コーディング', '検索・リサーチ', 'エージェント'],
    accent: 'from-[#15f5ba] via-[#39a7ff] to-[#7c3cff]',
    mark: 'CG',
    vibe: '万能型',
    description: '文章、調査、画像、動画、コード、エージェント用途まで広く使える中心サービス。',
    sourceUrl: 'https://chatgpt.com/pricing/',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'free',
        name: 'Free',
        monthlyCostUsd: 0,
        summary: 'まずは無料で高性能なAI対話を体験し、ライトな日常会話を行いたい人向け。',
        category: '無料総合',
        includes: ['GPT-4o利用制限枠', 'GPT-4o-mini無制限', '基本チャット機能'],
        bestFor: 'まずは無料で高性能なAI対話を体験し、ライトな日常会話を行いたい人',
        cautions: 'ピークタイムには一時的にレスポンスが制限される場合があります。',
        matrixX: ['general'],
        matrixY: 'free',
      },
      {
        id: 'go',
        name: 'Go',
        monthlyCostUsd: 8,
        summary: '無料版の制限に引っかかるが、Plusの20ドルは少し高いと感じるライトユーザー向け。',
        category: '総合AI (ライト)',
        includes: ['Plusより少なめの利用枠', '画像生成', '高度な機能の制限'],
        bestFor: '無料版の制限に不満だが20ドルは高いと感じるライトユーザー',
        cautions: 'Deep Researchなどの一部高度な機能は含まれていません。',
        matrixX: ['general'],
        matrixY: 'low',
      },
      {
        id: 'plus',
        name: 'Plus',
        monthlyCostUsd: 20,
        summary: '個人利用の標準プラン。高度な推論、画像生成、Deep Research、Codex利用を広く使う人向け。',
        category: '総合AI',
        includes: ['GPT-4o / o1系', '画像生成 (DALL-E 3)', '音声・高度な解析'],
        bestFor: '文章・画像生成から高度な推論まで、万能に使い倒したい人',
        cautions: 'ピーク時にはモデル利用枠に制限がかかることがあります。',
        matrixX: ['general', 'coding', 'media'],
        matrixY: 'mid',
      },
      {
        id: 'pro-100',
        name: 'Pro ($100)',
        monthlyCostUsd: 100,
        summary: '日常業務や開発でAIをヘビーに使い、Plusの制限にすぐ到達する人向け。',
        category: '高負荷AI',
        includes: ['Plusの5倍の利用枠', 'o1 pro mode等', '優先アクセス'],
        bestFor: '日常業務や開発でAIをヘビーに使い、Plusの制限にすぐ到達する人',
        cautions: '単独で元を取れる業務ワークフローが求められます。',
        matrixX: ['general', 'coding', 'media'],
        matrixY: 'high',
      },
      {
        id: 'pro-200',
        name: 'Pro ($200)',
        monthlyCostUsd: 200,
        summary: '最大級の利用枠、Pro推論、Deep Research、エージェント、Codexを重く使う人向け。',
        category: '超高負荷AI',
        includes: ['Plusの20倍の利用枠', 'o1 pro mode等', '最優先の利用枠'],
        bestFor: '研究、先端エンジニアリング、ビジネス推進で限界まで使うプロ向け',
        cautions: '一般の文章作成や単純なコード作成では費用過剰になりやすいです。',
        matrixX: ['general', 'coding', 'media'],
        matrixY: 'premium',
      },
    ],
  },
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    categories: ['チャット', '文章', 'コーディング', '検索・リサーチ', 'エージェント'],
    accent: 'from-[#ff9a3c] via-[#ff5f6d] to-[#8f3cff]',
    mark: 'CL',
    vibe: '長文・コード',
    description: '長文読解、文章整理、Claude Codeを含む開発支援で選びやすいサービス。',
    sourceUrl: 'https://support.claude.com/en/articles/11049762-choose-a-claude-plan',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'free',
        name: 'Free',
        monthlyCostUsd: 0,
        summary: '無料でClaude 3.5 Sonnetを使いたい方向け。',
        category: '無料文章',
        includes: ['Claude 3.5 Sonnet制限枠', 'Artifactsお試し', '文章支援'],
        bestFor: '自然な文章表現やコードの書きっぷりをとりあえず無料で確認したい人',
        cautions: '利用制限が非常に厳しく、すぐに上限に達します。',
        matrixX: ['general'],
        matrixY: 'free',
      },
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 20,
        summary: '通常利用向けの標準プラン。Claudeを毎日使う個人向け。',
        category: '文章・分析',
        includes: ['Claude 3.5 Sonnet', '長文処理', 'Artifacts / Project機能'],
        bestFor: '長文の推敲・リライト、資料分析、高精度のコーディングを望む人',
        cautions: 'メッセージ送信数が一定時間ごとに制限される仕組みがあります。',
        matrixX: ['general', 'coding'],
        matrixY: 'mid',
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
        category: '文章・分析',
        includes: ['Claude上位モデル', 'Proの5倍の利用制限枠', '優先ネットワーク'],
        bestFor: 'Claude Proの回数制限を突破して、日常的に長文執筆や開発を行う人',
        cautions: '高額プランのため、単独で元を取れるワークフロー構築が鍵です。',
        matrixX: ['general', 'coding'],
        matrixY: 'high',
      },
      {
        id: 'max-20x',
        name: 'Max 20x',
        monthlyCostUsd: 200,
        summary: 'Claudeを日常業務の中心に置くヘビーユーザー向け。',
        category: '文章・分析',
        includes: ['Claude上位モデル', 'Proの20倍の利用制限枠', '最優先ネットワーク'],
        bestFor: 'Claudeを日常業務の中心に置くヘビーユーザー',
        cautions: '利用目的に見合う費用対効果の確認が必要です。',
        matrixX: ['general', 'coding'],
        matrixY: 'premium',
      },
    ],
  },
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
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
        category: 'Google連携',
        includes: ['Gemini上位モデル（制限あり）', 'Googleアプリ連携'],
        bestFor: 'Google Workspace機能を中心に軽めにAIを使いたい人',
        cautions: '本格的なプログラミング用途では上位プランが必要です。',
        matrixX: ['general'],
        matrixY: 'low',
      },
      {
        id: 'ai-pro',
        name: 'Advanced (AI Pro)',
        monthlyCostUsd: 19.99,
        summary: 'Gemini、Google Flow、NotebookLM、Googleアプリ連携を広く使う標準プラン。',
        category: 'Google連携',
        includes: ['Gemini 1.5 Pro', 'Googleアプリ連携', 'Google One 2TB枠'],
        bestFor: 'Gmail, Google Workspace, Android環境でシームレスにAIを使いたい人',
        cautions: '長文コンテキストに強いですが、推論ロジックは他サービスと好みが分かれます。',
        matrixX: ['general', 'coding'],
        matrixY: 'mid',
      },
      {
        id: 'ai-ultra-5x',
        name: 'Google AI Ultra 5x',
        monthlyCostUsd: 99.99,
        summary: 'AI Proより高い利用上限と先行機能を求める上位プラン。',
        category: 'Google連携',
        includes: ['高い利用上限', '先行機能アクセス'],
        bestFor: 'AI Proの利用上限を超えるヘビーユーザー',
        cautions: '費用対効果を確認する必要があります。',
        matrixX: ['general', 'coding'],
        matrixY: 'high',
      },
      {
        id: 'ai-ultra-20x',
        name: 'Google AI Ultra 20x',
        monthlyCostUsd: 199.99,
        summary: 'AI Pro比で最大級の利用枠、動画生成、先行機能を重く使う人向け。',
        category: 'Google連携',
        includes: ['最大級の利用枠', '動画生成', '先行機能アクセス'],
        bestFor: '動画生成や複雑なコンテキスト処理を頻繁に行う人',
        cautions: '一般的な用途にはオーバースペックです。',
        matrixX: ['general', 'coding'],
        matrixY: 'premium',
      },
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    provider: 'Perplexity',
    categories: ['チャット', '検索・リサーチ', 'エージェント'],
    accent: 'from-[#00e5ff] via-[#00c48c] to-[#7dff6a]',
    mark: 'PX',
    vibe: '調査',
    description: '検索、出典確認、調査メモ作成を高速化したい人向け。',
    sourceUrl: 'https://www.perplexity.ai/pro',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 20,
        summary: '日常的な検索、Pro Search、ファイル利用、モデル選択を使いたい人向け。',
        category: '検索・調査',
        includes: ['AIネット検索', '複数モデル選択', '画像生成・ファイル分析'],
        bestFor: '出典が明示されたリサーチ、ニュースや最新情報のまとめを重視する人',
        cautions: '文章制作や対話の深さは、特化型の他チャットAIに分があります。',
        matrixX: ['general', 'coding'],
        matrixY: 'mid',
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
        category: '検索・調査',
        includes: ['最高速レスポンス', '新機能早期アクセス', '大量の検索クエリ'],
        bestFor: '膨大なリサーチ業務を抱えるプロフェッショナル',
        cautions: '検索以外の用途（プログラミング等）には向いていません。',
        matrixX: ['general'],
        matrixY: 'premium',
      },
    ],
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    provider: 'GitHub',
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
        category: 'コーディング',
        includes: ['エディタ補完', 'チャット機能', 'コードレビュー補助'],
        bestFor: 'VS CodeやJetBrainsなどのエディタ内で爆速にコードを書きたい開発者',
        cautions: '日常の一般的な会話や情報整理の用途には向きません。',
        matrixX: ['general', 'coding'],
        matrixY: 'low',
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
        category: 'コーディング',
        includes: ['多くのpremium requests', '上位モデルアクセス'],
        bestFor: 'より頻繁にAIの提案を求める開発者',
        cautions: 'チーム機能は含まれません。',
        matrixX: ['coding'],
        matrixY: 'mid',
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
    provider: 'Anysphere',
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
        category: '開発エディタ',
        includes: ['高速リクエスト500回', '無制限スローリクエスト', 'Cursor Tab補完'],
        bestFor: 'AI支援エディタCursorを使いこなし、高度なプロジェクト開発をしたい人',
        cautions: 'GitHub Copilotとの競合や、エディタへの依存度が高まります。',
        matrixX: ['general', 'coding'],
        matrixY: 'mid',
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
        category: '開発エディタ',
        includes: ['チーム共有', '管理機能', 'SSO'],
        bestFor: 'チームでCursorを導入する組織',
        cautions: '個人利用の場合はProプランで十分です。',
        matrixX: ['coding'],
        matrixY: 'high',
        yearly: {
          monthlyCostUsd: 32,
          summary: '年払い時の月額換算（年額$384/ユーザー）。チーム継続利用向け。',
        },
      },
    ],
  },
  {
    id: 'v0',
    name: 'v0',
    provider: 'Vercel',
    categories: ['コーディング', 'デザイン'],
    accent: 'from-[#000000] via-[#333333] to-[#666666]',
    mark: 'V0',
    vibe: 'UI生成',
    description: 'プロンプトからWeb UIを生成するツール。',
    sourceUrl: 'https://v0.dev/pricing',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'premium',
        name: 'Premium',
        monthlyCostUsd: 20,
        summary: '優先アクセスと高品質な生成機能を求める人向け。',
        category: 'UIプロトタイプ',
        includes: ['高品質なUIコード生成', 'Vercelデプロイ連携', '優先生成クレジット'],
        bestFor: 'フロントエンド開発者、デザイナー、Webアプリ構築を圧倒的時短したい人',
        cautions: 'UI生成に特化しているため、一般的な長いドキュメント作成には適しません。',
        matrixX: ['coding', 'media'],
        matrixY: 'mid',
      }
    ]
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'Midjourney',
    categories: ['画像', '動画', 'デザイン'],
    accent: 'from-[#ff47a3] via-[#ffcc00] to-[#00e0ff]',
    mark: 'MJ',
    vibe: '映像美',
    description: '画像生成を軸に、動画生成やデザイン素材作成まで使いたい人向け。',
    sourceUrl: 'https://www.midjourney.com/account/',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'basic',
        name: 'Basic',
        monthlyCostUsd: 10,
        summary: 'まず画像・動画生成を試したい人向けの入口プラン。',
        category: '画像生成',
        includes: ['画像生成 約200回/月', '商用利用ライセンス', 'Discord/Web生成'],
        bestFor: '圧倒的クオリティのアート・ビジュアル生成を安価に試したい人',
        cautions: 'プロンプトでの正確な文字指定や細かな修正はやや苦手です。',
        matrixX: ['media'],
        matrixY: 'low',
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
        category: '画像生成',
        includes: ['Relax GPU Time無制限', '高速生成15時間'],
        bestFor: '月に数百枚以上の画像を生成するクリエイター',
        cautions: '商用利用ライセンスはBasicと同じです。',
        matrixX: ['media'],
        matrixY: 'mid',
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
        category: '画像生成',
        includes: ['Stealth Mode', '高速生成30時間', '並列生成'],
        bestFor: '機密性の高い案件を扱うプロフェッショナル',
        cautions: '料金がやや高額になります。',
        matrixX: ['media'],
        matrixY: 'high',
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
        category: '画像生成',
        includes: ['高速生成60時間', '並列生成最大12件'],
        bestFor: '大量のアセット生成を自動化・効率化したい事業者',
        cautions: '一般のクリエイターにはオーバースペックです。',
        matrixX: ['media'],
        matrixY: 'premium',
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
    provider: 'Runway',
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
        category: '動画生成',
        includes: ['動画生成クレジット', '高度な編集ツール', '商用利用可能'],
        bestFor: '動画制作、SNSクリエイティブ動画、プロモーション映像を作りたい人',
        cautions: '動画の秒数ごとに大きくクレジットを消費するため、不足しやすいです。',
        matrixX: ['media'],
        matrixY: 'low',
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
        category: '動画生成',
        includes: ['2250クレジット', 'Gen-3 Alpha等の全機能'],
        bestFor: '日常的に動画生成を業務で利用するクリエイター',
        cautions: '本格的な長編制作にはまだ制限があります。',
        matrixX: ['general', 'coding'],
        matrixY: 'mid',
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
        category: '動画生成',
        includes: ['無制限のビデオ生成(Explore Mode)', '優先レンダリング'],
        bestFor: '大量の動画素材をトライアンドエラーで生成したいプロ',
        cautions: '費用が比較的高額になります。',
        matrixX: ['media'],
        matrixY: 'high',
        yearly: {
          monthlyCostUsd: 76,
          summary: '年払い時の月額換算（年額$912）。Unlimitedを継続利用する人向け。',
        },
      },
    ],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    provider: 'ElevenLabs',
    categories: ['音声'],
    accent: 'from-[#1a1a1a] via-[#3a3a3a] to-[#6b6b6b]',
    mark: 'EL',
    vibe: '音声',
    description: 'プロ品質の音声合成・ナレーション・対話エージェントを作るための音声特化サービス。',
    sourceUrl: 'https://elevenlabs.io/pricing',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'starter',
        name: 'Starter',
        monthlyCostUsd: 5,
        summary: '月30,000文字の音声生成。個人プロジェクト向け。',
        category: '音声生成',
        includes: ['30,000文字/月', 'Instant Voice Cloning', '商用利用可'],
        bestFor: 'YouTuber、Podcaster、小規模アプリへのTTS組み込み',
        cautions: '長尺コンテンツでは月内に枠を使い切ります。',
        matrixX: ['audio'],
        matrixY: 'low',
      },
      {
        id: 'creator',
        name: 'Creator',
        monthlyCostUsd: 22,
        summary: '月100,000文字、Professional Voice Clone対応。',
        category: '音声生成',
        includes: ['100,000文字/月', 'Professional Voice Clone', '高音質オーディオ'],
        bestFor: 'コンテンツ制作者、オーディオブック、教育動画',
        cautions: '商用配信ではプロビジョニング条件を確認。',
        matrixX: ['audio'],
        matrixY: 'mid',
      },
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 99,
        summary: '月500,000文字、高優先キュー、44.1kHz PCM出力。',
        category: '音声生成',
        includes: ['500,000文字/月', '44.1kHz PCM', '優先サポート'],
        bestFor: 'スタジオ制作、放送品質のナレーション',
        cautions: '個人ユースには過剰枠の可能性あり。',
        matrixX: ['audio'],
        matrixY: 'high',
      },
    ],
  },
  {
    id: 'openai-tts',
    name: 'OpenAI TTS',
    provider: 'OpenAI',
    categories: ['音声', 'API'],
    accent: 'from-[#15f5ba] via-[#39a7ff] to-[#7c3cff]',
    mark: 'OT',
    vibe: '音声API',
    description: 'OpenAI APIで使えるテキスト音声化サービス。アプリやBotへの組み込み向き。',
    sourceUrl: 'https://platform.openai.com/docs/guides/text-to-speech',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'tts-pay',
        name: 'TTS (従量課金)',
        monthlyCostUsd: 5,
        summary: '$0.015 / 1,000文字。標準TTS音声。',
        category: '音声生成',
        includes: ['標準音声', 'API経由', '商用利用可'],
        bestFor: 'チャットアプリの読み上げ、通知、軽量ナビゲーション',
        cautions: 'クローニング不可。声のバリエーションは標準セットのみ。',
        matrixX: ['audio'],
        matrixY: 'low',
      },
      {
        id: 'tts-hd-pay',
        name: 'TTS-HD',
        monthlyCostUsd: 15,
        summary: '$0.030 / 1,000文字。高音質モード。',
        category: '音声生成',
        includes: ['高音質モード', 'API経由', '商用利用可'],
        bestFor: 'プロ品質のナレーション、商品紹介音声',
        cautions: 'カスタムボイス不可。',
        matrixX: ['audio'],
        matrixY: 'mid',
      },
    ],
  },
]

// ==========================================
// 4. Utility Functions
// ==========================================

export function getFlatSubscriptionPlans(): PlanRow[] {
  const flatPlans: PlanRow[] = []
  for (const service of defaultSubscriptionCatalog) {
    for (const plan of service.plans) {
      // 必須の項目がない場合はデフォルトを設定（あるいは無視）
      if (!plan.matrixX || !plan.matrixY) continue

      flatPlans.push({
        service: service.name,
        plan: plan.name,
        provider: service.provider,
        monthlyUsd: plan.monthlyCostUsd,
        yearlyUsd: plan.yearly?.monthlyCostUsd,
        category: plan.category || service.categories[0],
        includes: plan.includes || [],
        bestFor: plan.bestFor || plan.summary,
        cautions: plan.cautions || '',
        sourceUrl: plan.sourceUrl || service.sourceUrl,
        matrixX: plan.matrixX,
        matrixY: plan.matrixY,
        isApi: false,
      })
    }
  }
  return flatPlans
}

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
      typeof service.provider === 'string' &&
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
