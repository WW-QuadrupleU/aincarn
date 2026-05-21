'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  FALLBACK_AI_PAYLOAD,
  type AiModel,
  type AiModelComparePayload,
} from '@/lib/ai-model-compare-data'

type PricingMode = 'plans' | 'llm' | 'image' | 'video'
type ViewMode = 'list' | 'matrix' | 'breakeven' | 'diagnosis'

type PricingRow = {
  model: AiModel
  unitPrice: number
  unitLabel: string
  estimatedCost: number
  performance: number
}

type PlanRow = {
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
  matrixX: 'general' | 'writing' | 'coding' | 'media'
  matrixY: 'free' | 'low' | 'mid' | 'high' | 'premium'
}

const AI_PLANS: PlanRow[] = [
  {
    service: 'ChatGPT',
    plan: 'Plus',
    provider: 'OpenAI',
    monthlyUsd: 20,
    category: '総合AI',
    includes: ['GPT-4o / o1系', '画像生成 (DALL-E 3)', '音声・高度な解析'],
    bestFor: '文章・画像生成から高度な推論まで、万能に使い倒したい人',
    cautions: 'ピーク時にはモデル利用枠に制限がかかることがあります。',
    sourceUrl: 'https://openai.com/chatgpt/pricing/',
    matrixX: 'general',
    matrixY: 'mid',
  },
  {
    service: 'ChatGPT',
    plan: 'Pro',
    provider: 'OpenAI',
    monthlyUsd: 200,
    category: '超高負荷AI',
    includes: ['o1 pro mode等', '最優先の利用枠', '無制限レベルの推論'],
    bestFor: '研究、先端エンジニアリング、ビジネス推進で高負荷に使うプロ向け',
    cautions: '一般の文章作成や単純なコード作成では費用過剰になりやすいです。',
    sourceUrl: 'https://openai.com/chatgpt/pricing/',
    matrixX: 'general',
    matrixY: 'premium',
  },
  {
    service: 'Claude',
    plan: 'Pro',
    provider: 'Anthropic',
    monthlyUsd: 20,
    category: '文章・分析',
    includes: ['Claude 3.5 Sonnet', '長文処理', 'Artifacts / Project機能'],
    bestFor: '長文の推敲・リライト、資料分析、高精度のコーディングを望む人',
    cautions: 'メッセージ送信数が一定時間ごとに制限される仕組みがあります。',
    sourceUrl: 'https://www.anthropic.com/pricing',
    matrixX: 'writing',
    matrixY: 'mid',
  },
  {
    service: 'Claude',
    plan: 'Max',
    provider: 'Anthropic',
    monthlyUsd: 100,
    category: '文章・分析',
    includes: ['Claude上位モデル', 'Proの5倍の利用制限枠', '優先ネットワーク'],
    bestFor: 'Claude Proの回数制限を突破して、日常的に長文執筆や開発を行う人',
    cautions: '高額プランのため、単独で元を取れるワークフロー構築が鍵です。',
    sourceUrl: 'https://www.anthropic.com/pricing',
    matrixX: 'writing',
    matrixY: 'high',
  },
  {
    service: 'Gemini',
    plan: 'Advanced',
    provider: 'Google',
    monthlyUsd: 19.99,
    category: 'Google連携',
    includes: ['Gemini 1.5 Pro', 'Googleアプリ連携', 'Google One 2TB枠'],
    bestFor: 'Gmail, Google Workspace, Android環境でシームレスにAIを使いたい人',
    cautions: '長文コンテキストに強いですが、推論ロジックは他サービスと好みが分かれます。',
    sourceUrl: 'https://one.google.com/about/ai-premium/',
    matrixX: 'general',
    matrixY: 'mid',
  },
  {
    service: 'Perplexity',
    plan: 'Pro',
    provider: 'Perplexity',
    monthlyUsd: 20,
    category: '検索・調査',
    includes: ['AIネット検索', '複数モデル選択', '画像生成・ファイル分析'],
    bestFor: '出典が明示されたリサーチ、ニュースや最新情報のまとめを重視する人',
    cautions: '文章制作や対話の深さは、特化型の他チャットAIに分があります。',
    sourceUrl: 'https://www.perplexity.ai/pro',
    matrixX: 'writing',
    matrixY: 'mid',
  },
  {
    service: 'GitHub Copilot',
    plan: 'Pro',
    provider: 'GitHub',
    monthlyUsd: 10,
    category: 'コーディング',
    includes: ['エディタ補完', 'チャット機能', 'コードレビュー補助'],
    bestFor: 'VS CodeやJetBrainsなどのエディタ内で爆速にコードを書きたい開発者',
    cautions: '日常の一般的な会話や情報整理の用途には向きません。',
    sourceUrl: 'https://github.com/features/copilot/plans',
    matrixX: 'coding',
    matrixY: 'low',
  },
  {
    service: 'Cursor',
    plan: 'Pro',
    provider: 'Anysphere',
    monthlyUsd: 20,
    category: '開発エディタ',
    includes: ['高速リクエスト500回', '無制限スローリクエスト', 'Cursor Tab補完'],
    bestFor: 'AI支援エディタCursorを使いこなし、高度なプロジェクト開発をしたい人',
    cautions: 'GitHub Copilotとの競合や、エディタへの依存度が高まります。',
    sourceUrl: 'https://www.cursor.com/pricing',
    matrixX: 'coding',
    matrixY: 'mid',
  },
  {
    service: 'v0',
    plan: 'Premium',
    provider: 'Vercel',
    monthlyUsd: 20,
    category: 'UIプロトタイプ',
    includes: ['高品質なUIコード生成', 'Vercelデプロイ連携', '優先生成クレジット'],
    bestFor: 'フロントエンド開発者、デザイナー、Webアプリ構築を圧倒的時短したい人',
    cautions: 'UI生成に特化しているため、一般的な長いドキュメント作成には適しません。',
    sourceUrl: 'https://v0.dev/pricing',
    matrixX: 'coding',
    matrixY: 'mid',
  },
  {
    service: 'Midjourney',
    plan: 'Basic',
    provider: 'Midjourney',
    monthlyUsd: 10,
    category: '画像生成',
    includes: ['画像生成 約200回/月', '商用利用ライセンス', 'Discord/Web生成'],
    bestFor: '圧倒的クオリティのアート・ビジュアル生成を安価に試したい人',
    cautions: 'プロンプトでの正確な文字指定や細かな修正はやや苦手です。',
    sourceUrl: 'https://www.midjourney.com/account/',
    matrixX: 'media',
    matrixY: 'low',
  },
  {
    service: 'Runway',
    plan: 'Standard',
    provider: 'Runway',
    monthlyUsd: 15,
    category: '動画生成',
    includes: ['動画生成クレジット', '高度な編集ツール', '商用利用可能'],
    bestFor: '動画制作、SNSクリエイティブ動画、プロモーション映像を作りたい人',
    cautions: '動画の秒数ごとに大きくクレジットを消費するため、不足しやすいです。',
    sourceUrl: 'https://runwayml.com/pricing',
    matrixX: 'media',
    matrixY: 'low',
  },
  {
    service: 'ChatGPT',
    plan: 'Free',
    provider: 'OpenAI',
    monthlyUsd: 0,
    category: '無料総合',
    includes: ['GPT-4o利用制限枠', 'GPT-4o-mini無制限', '基本チャット機能'],
    bestFor: 'まずは無料で高性能なAI対話を体験し、ライトな日常会話を行いたい人',
    cautions: 'ピークタイムには一時的にレスポンスが制限される場合があります。',
    sourceUrl: 'https://openai.com/chatgpt/pricing/',
    matrixX: 'general',
    matrixY: 'free',
  },
  {
    service: 'Claude',
    plan: 'Free',
    provider: 'Anthropic',
    monthlyUsd: 0,
    category: '無料文章',
    includes: ['Claude 3.5 Sonnet制限枠', 'Artifactsお試し', '文章支援'],
    bestFor: 'たまにだけ、最高水準の美しい文章執筆や的確な助言を求めたい人',
    cautions: 'メッセージ送信の回数上限が厳しく、すぐに制限に達しやすいです。',
    sourceUrl: 'https://www.anthropic.com/pricing',
    matrixX: 'writing',
    matrixY: 'free',
  },
]

const modeOptions: Array<{ id: PricingMode; label: string; description: string }> = [
  {
    id: 'plans',
    label: '料金プラン',
    description: '主要サービスの公開サブスク月額料金を比較します。',
  },
  {
    id: 'llm',
    label: 'API単価',
    description: '月間トークン量から、テキストAIの従量課金を比較します。',
  },
  {
    id: 'image',
    label: '画像生成',
    description: '月間生成枚数から、画像AIの生成コストを比較します。',
  },
  {
    id: 'video',
    label: '動画生成',
    description: '月間生成分数から、動画AIの生成コストを比較します。',
  },
]

const modeTone: Record<PricingMode, string> = {
  plans: 'from-indigo-600 via-sky-500 to-cyan-400',
  llm: 'from-emerald-500 via-teal-500 to-sky-500',
  image: 'from-fuchsia-600 via-rose-500 to-orange-400',
  video: 'from-violet-600 via-indigo-500 to-sky-400',
}

const matrixXLabels = {
  general: { label: '総合・対話', desc: 'ChatGPT / Geminiなど万能型' },
  writing: { label: '執筆・リサーチ', desc: 'Claude / Perplexityなど長文や調査特化' },
  coding: { label: '開発・コード', desc: 'GitHub Copilot / Cursorなどプログラミング支援' },
  media: { label: '画像・動画生成', desc: 'Midjourney / Runwayなどクリエイティブ系' },
}

const matrixYLabels = {
  free: { label: '無料 (Free)', price: '$0 / 月', desc: 'コストゼロでお試し' },
  low: { label: 'ライト (Low)', price: '~$15 / 月', desc: '低価格で便利に活用' },
  mid: { label: 'プロ (Mid)', price: '$20前後 / 月', desc: '標準的な個人向け上位版' },
  high: { label: 'ハイエンド (High)', price: '$30~$100 / 月', desc: 'ヘビーユーザー・高負荷向け' },
  premium: { label: 'プレミアム (Premium)', price: '$100超 / 月', desc: '究極の処理能力・プロ向け仕様' },
}

function parseUsdPrice(label?: string): number | null {
  if (!label) return null
  const match = label.match(/\$([0-9]+(?:\.[0-9]+)?)/)
  return match ? Number(match[1]) : null
}

function genrePerformance(model: AiModel, mode: PricingMode): number {
  if (mode === 'image') return model.performance.image || 0
  if (mode === 'video') return Math.max(model.performance.textVideo || 0, model.performance.imageVideo || 0)
  return Math.max(
    model.performance.research || 0,
    model.performance.writing || 0,
    model.performance.coding || 0,
    model.performance.analysis || 0,
    model.performance.agent || 0
  )
}

function unitLabel(mode: PricingMode) {
  if (mode === 'llm') return '100万tokens'
  if (mode === 'image') return '1生成'
  return '1分'
}

function eligibleForMode(model: AiModel, mode: PricingMode) {
  if (mode === 'llm') return model.modality === 'LLM'
  if (mode === 'image') return model.visibleIn.includes('image')
  return model.visibleIn.includes('textVideo') || model.visibleIn.includes('imageVideo')
}

function estimateCost(mode: PricingMode, unitPrice: number, tokenMillions: number, imageCount: number, videoMinutes: number) {
  if (mode === 'llm') return unitPrice * tokenMillions
  if (mode === 'image') return unitPrice * imageCount
  return unitPrice * videoMinutes
}

export default function AiPricingTool() {
  const [payload, setPayload] = useState<AiModelComparePayload>(FALLBACK_AI_PAYLOAD)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<PricingMode>('plans')
  const [viewMode, setViewMode] = useState<ViewMode>('matrix')
  const [usdToJpyRate, setUsdToJpyRate] = useState(155) // 為替レート

  // API 従量課金シミュレータパラメータ
  const [tokenMillions, setTokenMillions] = useState(10)
  const [imageCount, setImageCount] = useState(200)
  const [videoMinutes, setVideoMinutes] = useState(30)
  const [query, setQuery] = useState('')

  // 損益分岐点シミュレータ用の状態
  const [dailyPrompts, setDailyPrompts] = useState(15) // 1日あたりの質問回数
  const [avgPromptLength, setAvgPromptLength] = useState(600) // 1回の入力文字数
  const [avgResponseLength, setAvgResponseLength] = useState(800) // 1回の出力文字数

  // お気に入りキープ用の状態 (LocalStorageに保存)
  const [keepList, setKeepList] = useState<{ serviceName: string; planName: string; monthlyCostUsd: number }[]>([])

  // AIコンシェルジュ診断用の状態
  const [diagnosisUse, setDiagnosisUse] = useState<'general' | 'writing' | 'coding' | 'media'>('general')
  const [diagnosisFreq, setDiagnosisFreq] = useState<'light' | 'medium' | 'heavy'>('medium')
  const [diagnosisPriority, setDiagnosisPriority] = useState<'cost' | 'quality' | 'speed'>('quality')
  const [showDiagnosisResult, setShowDiagnosisResult] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPricing() {
      try {
        const response = await fetch('/api/ai-model-compare')
        if (!response.ok) throw new Error('failed to load pricing data')
        const data = (await response.json()) as AiModelComparePayload
        if (active && data.models?.length) setPayload(data)
      } catch {
        if (active) setPayload(FALLBACK_AI_PAYLOAD)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadPricing()

    // ローカルストレージからキープリストをロード
    const saved = localStorage.getItem('aincarn_keep_list')
    if (saved) {
      try {
        setKeepList(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }

    return () => {
      active = false
    }
  }, [])

  // お気に入り（キープ）の保存処理
  const toggleKeep = (serviceName: string, planName: string, monthlyCostUsd: number) => {
    let nextList = [...keepList]
    const exists = nextList.some((item) => item.serviceName === serviceName && item.planName === planName)
    if (exists) {
      nextList = nextList.filter((item) => !(item.serviceName === serviceName && item.planName === planName))
    } else {
      nextList.push({ serviceName, planName, monthlyCostUsd })
    }
    setKeepList(nextList)
    localStorage.setItem('aincarn_keep_list', JSON.stringify(nextList))
  }

  // 金額フォーマットヘルパー（USD + JPY併記）
  const formatCost = (usdValue: number) => {
    const jpyValue = usdValue * usdToJpyRate
    const usdStr = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: usdValue >= 100 ? 0 : 2,
    }).format(usdValue)

    const jpyStr = new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
      maximumFractionDigits: 0,
    }).format(jpyValue)

    return {
      usd: usdStr,
      jpy: jpyStr,
      combined: `${usdStr} (約 ${jpyStr})`,
    }
  }

  const formatDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  // API用の行データ作成
  const rows = useMemo<PricingRow[]>(() => {
    if (mode === 'plans') return []
    const normalizedQuery = query.trim().toLowerCase()

    return payload.models
      .filter((model) => eligibleForMode(model, mode))
      .filter((model) => {
        if (!normalizedQuery) return true
        return `${model.name} ${model.creator} ${model.family}`.toLowerCase().includes(normalizedQuery)
      })
      .map((model) => {
        const unitPrice = parseUsdPrice(model.priceLabel)
        if (unitPrice == null) return null

        return {
          model,
          unitPrice,
          unitLabel: unitLabel(mode),
          estimatedCost: estimateCost(mode, unitPrice, tokenMillions, imageCount, videoMinutes),
          performance: genrePerformance(model, mode),
        }
      })
      .filter((row): row is PricingRow => Boolean(row))
      .sort((a, b) => a.estimatedCost - b.estimatedCost)
  }, [imageCount, mode, payload.models, query, tokenMillions, videoMinutes])

  // コスパ・最安・性能上位の算出
  const cheapest = rows[0]
  const strongest = [...rows].sort((a, b) => b.performance - a.performance)[0]
  const bestBalance = [...rows].sort((a, b) => {
    const aScore = a.performance / Math.max(1, a.estimatedCost)
    const bScore = b.performance / Math.max(1, b.estimatedCost)
    return bScore - aScore
  })[0]

  // 「サブスク vs API」損益分岐点シミュレータ計算ロジック
  const breakevenSim = useMemo(() => {
    // 日本語1文字あたり 1.2 トークンとして概算
    const jpnCharToToken = 1.2
    const totalPromptsPerMonth = dailyPrompts * 30
    const monthlyInputTokens = totalPromptsPerMonth * avgPromptLength * jpnCharToToken
    const monthlyOutputTokens = totalPromptsPerMonth * avgResponseLength * jpnCharToToken

    // 1. ハイエンドモデル API推定コスト (GPT-4o 級)
    // インプット $2.5 / 1M tokens, アウトプット $10 / 1M tokens
    const highEndInputCost = (monthlyInputTokens * 2.5) / 1000000
    const highEndOutputCost = (monthlyOutputTokens * 10) / 1000000
    const highEndTotalUsd = highEndInputCost + highEndOutputCost

    // 2. スピード・軽量モデル API推定コスト (GPT-4o-mini 級)
    // インプット $0.15 / 1M tokens, アウトプット $0.60 / 1M tokens
    const liteInputCost = (monthlyInputTokens * 0.15) / 1000000
    const liteOutputCost = (monthlyOutputTokens * 0.60) / 1000000
    const liteTotalUsd = liteInputCost + liteOutputCost

    // 3. 推論特化モデル API推定コスト (o1 級)
    // インプット $15.00 / 1M tokens, アウトプット $60.00 / 1M tokens
    const reasoningInputCost = (monthlyInputTokens * 15.00) / 1000000
    const reasoningOutputCost = (monthlyOutputTokens * 60.00) / 1000000
    const reasoningTotalUsd = reasoningInputCost + reasoningOutputCost

    // 定額サブスクとの比較対象
    const subscriptionUsd = 20.00 // $20/月

    return {
      monthlyInputTokens,
      monthlyOutputTokens,
      highEndUsd: highEndTotalUsd,
      liteUsd: liteTotalUsd,
      reasoningUsd: reasoningTotalUsd,
      subUsd: subscriptionUsd,
    }
  }, [dailyPrompts, avgPromptLength, avgResponseLength])

  // AIコンシェルジュ診断ロジック
  const diagnosisResult = useMemo(() => {
    // デフォルト構成（何かしら返す）
    let title = 'プレミアム・オールマイティ構成'
    let subtitle = '最先端AIの二大巨頭を網羅する究極の構成'
    let monthlyUsd = 40
    let recommendationReason = '日常のあらゆる作業からビジネス文書、プログラミングまで圧倒的クオリティで行いたい方に最適です。'
    let description = 'ChatGPT PlusとClaude Proを両方契約する王道かつ最強の構成。モデルの回数制限を気にせず、適材適所で最高知能を使えます。'
    let plans: PlanRow[] = [
      AI_PLANS.find(p => p.service === 'ChatGPT' && p.plan === 'Plus')!,
      AI_PLANS.find(p => p.service === 'Claude' && p.plan === 'Pro')!,
    ].filter(Boolean)
    let pros = ['文筆と高度な分析・コーディングの両面で業界最高峰の恩恵を受けられる', 'ChatGPTの画像生成(DALL-E 3)とClaudeのArtifacts機能をフル活用可能']
    let cons = ['月額約6,000円以上となり、ライトユーザーには過剰投資になる可能性がある']

    if (diagnosisPriority === 'cost') {
      if (diagnosisFreq === 'light') {
        title = '完全無料スマート併用構成'
        subtitle = 'コスト0円で主要AIの恩恵を最大化'
        monthlyUsd = 0
        recommendationReason = 'コストを絶対にかけたくないが、AIの利便性は享受したい方に最適です。'
        description = 'ChatGPT Free と Claude Free を併用。それぞれの無料枠を使い分けることで、出費ゼロで最高の回答クオリティを引き出します。'
        plans = [
          AI_PLANS.find(p => p.service === 'ChatGPT' && p.plan === 'Free')!,
          AI_PLANS.find(p => p.service === 'Claude' && p.plan === 'Free')!,
        ].filter(Boolean)
        pros = ['維持費が一切かからない', '異なるエンジンの意見を無料ステップで比較可能']
        cons = ['ピーク時のアクセス制限があり、長文の大量処理や複雑なプログラミングには不足する']
      } else {
        // cost重視だがmedium/heavy
        if (diagnosisUse === 'coding') {
          title = '開発者ハイコストパフォーマンス構成'
          subtitle = '最小投資でエディタ支援を最大限に'
          monthlyUsd = 10
          recommendationReason = 'エンジニアとしてコード生産性を極限まで高めつつ、月額料金を抑えたい方に最適です。'
          description = 'GitHub Copilot Pro を契約。月額10ドルの低コストでありながら、お使いの各種IDE（VS Codeなど）で直接、高精度の自動補完とレビュー支援を受けられます。'
          plans = [
            AI_PLANS.find(p => p.service === 'GitHub Copilot' && p.plan === 'Pro')!,
          ].filter(Boolean)
          pros = ['エディタ内補完が極めて高速', '定額サブスクの中で最も安価な部類']
          cons = ['エディタ外でのドキュメント作成や画像生成などは苦手']
        } else if (diagnosisUse === 'media') {
          title = 'ライトクリエイター構成'
          subtitle = '高コスパな画像・動画生成のエントリー構成'
          monthlyUsd = 10
          recommendationReason = '画像・イラスト制作を趣味やライトな副業レベルで始めたい方に最適です。'
          description = 'Midjourney Basic を契約。月額10ドルで世界最高峰の画像クオリティを誇るAIイラストを約200枚生成できます。'
          plans = [
            AI_PLANS.find(p => p.service === 'Midjourney' && p.plan === 'Basic')!,
          ].filter(Boolean)
          pros = ['プロ品質の画像を安価に手に入れられる', '商用利用ライセンス付き']
          cons = ['動画生成は含まれず、画像生成回数に上限がある']
        } else {
          // general / writing + cost + non-light
          title = 'シングル・スマートプロ構成'
          subtitle = '実質20ドルで最も万能な1台を選ぶ'
          monthlyUsd = 20
          recommendationReason = '出費を20ドル以内に収めつつ、何でも高精度にこなせる相棒が欲しい方に最適です。'
          description = 'ChatGPT Plus を単独契約。最新の推論モデルや、音声、DALL-E 3による画像生成まで何でもこなす万能な1本化構成です。'
          plans = [
            AI_PLANS.find(p => p.service === 'ChatGPT' && p.plan === 'Plus')!,
          ].filter(Boolean)
          pros = ['画像・音声・推論すべてをカバーする最もバランスの良い構成', 'GPTsなどで独自のツールも使い放題']
          cons = ['長文の執筆や非常に高いコード解析力はClaude Proに一歩譲る場合がある']
        }
      }
    } else if (diagnosisUse === 'coding') {
      title = '次世代開発者特化構成'
      subtitle = 'AIエディタと強力な補完のハイブリッド'
      monthlyUsd = 20
      recommendationReason = 'コーディング効率を圧倒的に向上させ、爆速でプロダクトを開発したい開発者に最適です。'
      description = 'Cursor Pro を中心に据えた構成。月額20ドルで最新のClaude 3.5 SonnetやGPT-4oを開発エディタ内で500回以上高速利用でき、コードベース全体を学習させられます。'
      plans = [
        AI_PLANS.find(p => p.service === 'Cursor' && p.plan === 'Pro')!,
      ].filter(Boolean)
      pros = ['Cursor独自のAI書き換え機能やコンテキスト理解が超強力', '最新モデルを切り替えてエディタ内で使用可能']
      cons = ['チャット単体の一般対話や資料検索としての使いやすさは専用チャットUIにやや劣る']
    } else if (diagnosisUse === 'writing') {
      title = 'プロフェッショナル・ライター構成'
      subtitle = '美しい文章表現と長文分析の最強ツール'
      monthlyUsd = 20
      recommendationReason = '翻訳、長文執筆、大量のドキュメントやコードのレビュー・分析を主な業務とする方に最適です。'
      description = 'Claude Pro を契約。最新のClaude 3.5 Sonnetをフル活用でき、作成中のプログラムや文章を整理・一覧化する「Artifacts」やプロジェクト機能でドキュメント業務が劇的に改善します。'
      plans = [
        AI_PLANS.find(p => p.service === 'Claude' && p.plan === 'Pro')!,
      ].filter(Boolean)
      pros = ['日本語の文章表現が極めて自然でハイクオリティ', 'プロジェクトごとに資料を事前学習させられる']
      cons = ['画像生成機能は備わっておらず、アクセス制限が厳しめ']
    } else if (diagnosisUse === 'media') {
      title = 'マルチメディア・クリエイター構成'
      subtitle = '超高解像度の画像と最先端AI動画のセットアップ'
      monthlyUsd = 25
      recommendationReason = 'SNS向けのクリエイティブ制作や、プロモーション映像、最先端グラフィックを手がけたい方に最適です。'
      description = 'Midjourney Basic と Runway Standard を組み合わせた最強のメディア生成構成。静止画の圧倒的ディテールと、その画像を動かす動画生成のワークフローがシームレスに機能します。'
      plans = [
        AI_PLANS.find(p => p.service === 'Midjourney' && p.plan === 'Basic')!,
        AI_PLANS.find(p => p.service === 'Runway' && p.plan === 'Standard')!,
      ].filter(Boolean)
      pros = ['プロ品質のグラフィックとショート動画の両方を独自制作できる', '商用利用ライセンスで商用案件にも活用可能']
      cons = ['テキストAIの機能は含まれず、別途無料の対話AIなどと組み合わせる必要がある']
    } else if (diagnosisFreq === 'heavy' && diagnosisPriority === 'quality') {
      title = '究極プロフェッショナル構成'
      subtitle = '無限の知能とリソースを手中におさめる'
      monthlyUsd = 220
      recommendationReason = 'ビジネスリーダー、AI研究者、最先端エンジニアなど、モデル上限や遅延を一切許容したくないトッププロ向けです。'
      description = 'ChatGPT Pro と Claude Pro の二枚看板構成。月額200ドルのProプランは、OpenAIの最高峰推論モデル「o1 pro mode」などを無制限レベルで最優先アクセスできます。'
      plans = [
        AI_PLANS.find(p => p.service === 'ChatGPT' && p.plan === 'Pro')!,
        AI_PLANS.find(p => p.service === 'Claude' && p.plan === 'Pro')!,
      ].filter(Boolean)
      pros = ['o1プロモードによる驚異的な推論性能と長考能力', 'モデル回数制限をほぼ完全に回避可能']
      cons = ['月額約35,000円と非常に高価で、一般用途にはオーバースペック']
    }

    return {
      title,
      subtitle,
      monthlyUsd,
      recommendationReason,
      description,
      plans,
      pros,
      cons,
    }
  }, [diagnosisUse, diagnosisFreq, diagnosisPriority])

  return (
    <div className="space-y-6">
      {/* プレミアムヘッダーコントロール */}
      <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/92 shadow-sm shadow-slate-950/5 backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
          <div className="p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Premium AI Estimator</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">AI料金比較＆為替シミュレーター</h1>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-gray-500">
              定額サブスクプランとAPI従量課金を一括比較。為替レート（JPY）を動的に反映し、最適なAIの構成をコンシェルジュが提案します。
            </p>
            
            {/* 動的ビュー切り替えトグル */}
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`rounded-full px-5 py-2.5 text-xs font-black transition-all ${
                  viewMode === 'list'
                    ? 'bg-slate-950 text-white shadow-md shadow-slate-950/15'
                    : 'bg-white hover:bg-slate-100 text-gray-600 border border-slate-200'
                }`}
              >
                📋 リスト比較
              </button>
              <button
                type="button"
                onClick={() => setViewMode('matrix')}
                className={`rounded-full px-5 py-2.5 text-xs font-black transition-all ${
                  viewMode === 'matrix'
                    ? 'bg-slate-950 text-white shadow-md shadow-slate-950/15'
                    : 'bg-white hover:bg-slate-100 text-gray-600 border border-slate-200'
                }`}
              >
                🗺️ 2次元ポジショニングマップ
              </button>
              <button
                type="button"
                onClick={() => setViewMode('breakeven')}
                className={`rounded-full px-5 py-2.5 text-xs font-black transition-all ${
                  viewMode === 'breakeven'
                    ? 'bg-slate-950 text-white shadow-md shadow-slate-950/15'
                    : 'bg-white hover:bg-slate-100 text-gray-600 border border-slate-200'
                }`}
              >
                ⚖️ 損益分岐シミュレータ
              </button>
              <button
                type="button"
                onClick={() => setViewMode('diagnosis')}
                className={`rounded-full px-5 py-2.5 text-xs font-black transition-all ${
                  viewMode === 'diagnosis'
                    ? 'bg-slate-950 text-white shadow-md shadow-slate-950/15'
                    : 'bg-white hover:bg-slate-100 text-gray-600 border border-slate-200'
                }`}
              >
                🧠 AIコンシェルジュ診断
              </button>
            </div>
          </div>

          {/* 右側：為替レート動的コントロールパネル */}
          <div className="flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950 p-5 text-white sm:p-6">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Dynamic Exchange Rate</p>
              <p className="mt-2 text-2xl font-black text-white">1ドル = <span className="text-emerald-400 text-3xl">{usdToJpyRate}</span> 円</p>
              
              <div className="mt-3">
                <input
                  type="range"
                  min="130"
                  max="165"
                  value={usdToJpyRate}
                  onChange={(e) => setUsdToJpyRate(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-white/20 accent-emerald-400"
                />
                <div className="mt-1 flex justify-between text-[10px] font-bold text-white/60">
                  <span>130円 (円高)</span>
                  <span>150円</span>
                  <span>165円 (円安)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-white/10 pt-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50">My Keep List</p>
              <div className="mt-2 flex flex-wrap gap-1.5 max-h-16 overflow-y-auto scrollbar-hide">
                {keepList.length === 0 ? (
                  <span className="text-[11px] font-bold text-white/40">★プランのキープはありません</span>
                ) : (
                  keepList.map((item) => (
                    <span key={`${item.serviceName}-${item.planName}`} className="inline-flex items-center rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      ★ {item.serviceName} {item.planName}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- ⚖️ VIEW: 損益分岐点シミュレータ ---------------- */}
      {viewMode === 'breakeven' && (
        <div className="space-y-6">
          <section className="rounded-[24px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
            <h2 className="text-xl font-black text-slate-950">⚖️ 「サブスク vs API」月額損益分岐点シミュレータ</h2>
            <p className="mt-1 text-xs font-bold leading-relaxed text-gray-500">
              月々の想定文字数とAIへの質問頻度から、API従量課金にした方が安いのか、月額定額サブスク（ChatGPT Plusなど）を契約した方が安いのかのしきい値を計算します。
            </p>

            <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
              {/* パラメータ調整フォーム */}
              <div className="space-y-4 rounded-2xl border border-gray-100 bg-white/60 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">想定利用量を設定</p>
                
                <label className="block">
                  <span className="flex justify-between text-xs font-bold text-gray-600">
                    <span>1日の質問・対話回数</span>
                    <span className="text-slate-950 font-black">{dailyPrompts} 回</span>
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={dailyPrompts}
                    onChange={(e) => setDailyPrompts(Number(e.target.value))}
                    className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-slate-800"
                  />
                  <span className="text-[10px] font-bold text-gray-400 block mt-0.5">月間: {dailyPrompts * 30} 回のやり取り</span>
                </label>

                <label className="block">
                  <span className="flex justify-between text-xs font-bold text-gray-600">
                    <span>1回あたりの平均入力（文字）</span>
                    <span className="text-slate-950 font-black">{avgPromptLength} 文字</span>
                  </span>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={avgPromptLength}
                    onChange={(e) => setAvgPromptLength(Number(e.target.value))}
                    className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-slate-800"
                  />
                </label>

                <label className="block">
                  <span className="flex justify-between text-xs font-bold text-gray-600">
                    <span>1回あたりの平均出力（文字）</span>
                    <span className="text-slate-950 font-black">{avgResponseLength} 文字</span>
                  </span>
                  <input
                    type="range"
                    min="100"
                    max="5000"
                    step="100"
                    value={avgResponseLength}
                    onChange={(e) => setAvgResponseLength(Number(e.target.value))}
                    className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-slate-800"
                  />
                </label>

                <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400">想定月間トークン量</p>
                  <p className="mt-1 text-xs font-bold text-slate-700">
                    入力: {(breakevenSim.monthlyInputTokens / 1000000).toFixed(2)}M tokens
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    出力: {(breakevenSim.monthlyOutputTokens / 1000000).toFixed(2)}M tokens
                  </p>
                </div>
              </div>

              {/* シミュレーション結果表示 */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-gray-100 bg-white/60 p-4">
                  <h3 className="text-sm font-black text-slate-950">💰 月額コストシミュレーション結果 (為替連動)</h3>
                  <p className="mt-1 text-[11px] font-bold text-gray-400">
                    定額サブスク（月額 $20）と各API単価に基づく従量課金を比較した結果です。
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    {/* 定額サブスク */}
                    <div className="rounded-2xl border-2 border-indigo-500 bg-indigo-50/20 p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                        基準プラン
                      </div>
                      <h4 className="text-xs font-black text-slate-900">定額サブスク (個人プロ向け)</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">ChatGPT Plus / Claude Pro等</p>
                      <p className="mt-3 text-2xl font-black text-slate-900">{formatCost(breakevenSim.subUsd).jpy}</p>
                      <p className="text-xs font-bold text-gray-400 mt-1">{formatCost(breakevenSim.subUsd).usd} / 月 (固定)</p>
                    </div>

                    {/* スピード・軽量API */}
                    <div className={`rounded-2xl border p-4 transition-all ${
                      breakevenSim.liteUsd < breakevenSim.subUsd 
                        ? 'border-emerald-500 bg-emerald-50/20' 
                        : 'border-slate-200 bg-white'
                    }`}>
                      <h4 className="text-xs font-black text-slate-900">スピード・軽量モデル API</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">GPT-4o-mini / Claude Haiku等</p>
                      <p className="mt-3 text-2xl font-black text-slate-900">{formatCost(breakevenSim.liteUsd).jpy}</p>
                      <p className="text-xs font-bold text-gray-400 mt-1">{formatCost(breakevenSim.liteUsd).usd} / 月</p>
                      <span className={`inline-block mt-2 rounded px-1.5 py-0.5 text-[9px] font-black ${
                        breakevenSim.liteUsd < breakevenSim.subUsd
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {breakevenSim.liteUsd < breakevenSim.subUsd ? '✓ サブスクよりお得！' : 'サブスク推奨'}
                      </span>
                    </div>

                    {/* ハイエンドモデル API */}
                    <div className={`rounded-2xl border p-4 transition-all ${
                      breakevenSim.highEndUsd < breakevenSim.subUsd 
                        ? 'border-emerald-500 bg-emerald-50/20' 
                        : 'border-slate-200 bg-white'
                    }`}>
                      <h4 className="text-xs font-black text-slate-900">ハイエンドモデル API</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">GPT-4o / Claude Sonnet等</p>
                      <p className="mt-3 text-2xl font-black text-slate-900">{formatCost(breakevenSim.highEndUsd).jpy}</p>
                      <p className="text-xs font-bold text-gray-400 mt-1">{formatCost(breakevenSim.highEndUsd).usd} / 月</p>
                      <span className={`inline-block mt-2 rounded px-1.5 py-0.5 text-[9px] font-black ${
                        breakevenSim.highEndUsd < breakevenSim.subUsd
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {breakevenSim.highEndUsd < breakevenSim.subUsd ? '✓ サブスクよりお得！' : 'サブスク推奨'}
                      </span>
                    </div>

                    {/* 推論特化モデル API */}
                    <div className={`rounded-2xl border p-4 transition-all ${
                      breakevenSim.reasoningUsd < breakevenSim.subUsd 
                        ? 'border-emerald-500 bg-emerald-50/20' 
                        : 'border-slate-200 bg-white'
                    }`}>
                      <h4 className="text-xs font-black text-slate-900">推論特化モデル API</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">o1 / o3-high等</p>
                      <p className="mt-3 text-2xl font-black text-slate-900">{formatCost(breakevenSim.reasoningUsd).jpy}</p>
                      <p className="text-xs font-bold text-gray-400 mt-1">{formatCost(breakevenSim.reasoningUsd).usd} / 月</p>
                      <span className={`inline-block mt-2 rounded px-1.5 py-0.5 text-[9px] font-black ${
                        breakevenSim.reasoningUsd < breakevenSim.subUsd
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {breakevenSim.reasoningUsd < breakevenSim.subUsd ? '✓ サブスクよりお得！' : 'サブスク推奨'}
                      </span>
                    </div>
                  </div>

                  {/* 診断コメント */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                    <p className="text-xs font-black text-slate-800">💡 損益分岐コンシェルジュの総評</p>
                    <div className="mt-1.5 text-xs font-bold leading-relaxed text-gray-600">
                      {breakevenSim.highEndUsd > breakevenSim.subUsd ? (
                        <p>
                          現在の利用頻度と文字数では、GPT-4o級のハイエンドモデルをAPIで使うと <strong className="text-rose-600">{formatCost(breakevenSim.highEndUsd).jpy}</strong> に達し、定額サブスク（{formatCost(breakevenSim.subUsd).jpy}）の上限を超えてしまいます。
                          したがって、<strong>月額定額サブスク（ChatGPT PlusやClaude Proなど）を契約したほうが圧倒的にお得</strong>です！
                        </p>
                      ) : (
                        <p>
                          現在の利用頻度であれば、GPT-4o級のハイエンドモデルをAPI経由で使っても <strong className="text-emerald-600">{formatCost(breakevenSim.highEndUsd).jpy}</strong> 程度に収まります。
                          定額サブスク（{formatCost(breakevenSim.subUsd).jpy}）より安いため、<strong>API経由（Cursorや各種クライアントアプリ等）での従量課金利用がおすすめ</strong>です！
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ---------------- 🧠 VIEW: AIコンシェルジュ診断 ---------------- */}
      {viewMode === 'diagnosis' && (
        <div className="space-y-6">
          <section className="rounded-[24px] border border-white/80 bg-white/88 p-6 shadow-sm shadow-slate-950/5 backdrop-blur">
            <h2 className="text-xl font-black text-slate-950">🧠 あなたに最適なAI構成を提案！「AIコンシェルジュ診断」</h2>
            <p className="mt-1 text-xs font-bold leading-relaxed text-gray-500">
              あなたの用途、頻度、重視したい要素を選択するだけで、無数にあるAIプランの中から「最も無駄がなく、効果の高い」組み合わせを自動で設計・提案します。
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {/* 質問1 */}
              <div className="rounded-2xl border border-gray-100 bg-white/60 p-4">
                <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-500 text-xs font-black text-white">1</span>
                <h3 className="mt-3 text-sm font-black text-slate-950">主な用途は何ですか？</h3>
                <div className="mt-3 grid gap-2">
                  {[
                    { id: 'general', label: '総合・対話', desc: '文章、画像、検索など幅広く' },
                    { id: 'writing', label: '執筆・リサーチ', desc: '精密な文筆や長文の資料分析' },
                    { id: 'coding', label: 'プログラミング', desc: 'コード作成・システム開発' },
                    { id: 'media', label: '画像・動画生成', desc: 'クリエイティブなメディア生成' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDiagnosisUse(item.id as any)
                        setShowDiagnosisResult(false)
                      }}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        diagnosisUse === item.id
                          ? 'border-indigo-500 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-black text-slate-950">{item.label}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-gray-400">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 質問2 */}
              <div className="rounded-2xl border border-gray-100 bg-white/60 p-4">
                <span className="flex size-7 items-center justify-center rounded-lg bg-teal-500 text-xs font-black text-white">2</span>
                <h3 className="mt-3 text-sm font-black text-slate-950">利用頻度はどのくらいですか？</h3>
                <div className="mt-3 grid gap-2">
                  {[
                    { id: 'light', label: 'ライト (週に数回程度)', desc: 'たまに必要な時に頼りたい' },
                    { id: 'medium', label: 'ミディアム (毎日少し)', desc: '日常的に調べ物や補助で使う' },
                    { id: 'heavy', label: 'ヘビー (仕事でフル活用)', desc: '毎日何十回もヘビーにやり取り' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDiagnosisFreq(item.id as any)
                        setShowDiagnosisResult(false)
                      }}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        diagnosisFreq === item.id
                          ? 'border-teal-500 bg-teal-50/50 shadow-sm ring-1 ring-teal-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-black text-slate-950">{item.label}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-gray-400">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* 質問3 */}
              <div className="rounded-2xl border border-gray-100 bg-white/60 p-4">
                <span className="flex size-7 items-center justify-center rounded-lg bg-amber-500 text-xs font-black text-white">3</span>
                <h3 className="mt-3 text-sm font-black text-slate-950">最も重視することは何ですか？</h3>
                <div className="mt-3 grid gap-2">
                  {[
                    { id: 'cost', label: '極限の安さ (コスパ重視)', desc: '無料〜最小限の出費に抑えたい' },
                    { id: 'quality', label: '最高峰の知性 (品質第一)', desc: '一番賢く、精度が高いもの' },
                    { id: 'speed', label: '処理速度・軽快さ', desc: 'サクサク動いて待たされない' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDiagnosisPriority(item.id as any)
                        setShowDiagnosisResult(false)
                      }}
                      className={`rounded-xl border p-3 text-left transition-all ${
                        diagnosisPriority === item.id
                          ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-black text-slate-950">{item.label}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-gray-400">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 診断アクションボタン */}
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={() => setShowDiagnosisResult(true)}
                className="rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 px-8 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                🔮 最適なAI構成を診断する
              </button>
            </div>

            {/* 診断結果表示 */}
            {showDiagnosisResult && (
              <div className="mt-8 border-t border-gray-200/80 pt-8 animate-fadeIn">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-500">Concierge Recommendation</p>
                <div className="mt-3 rounded-[24px] bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 p-6 text-white shadow-xl shadow-slate-950/20">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <span className="rounded-full bg-indigo-500/20 border border-indigo-500/30 px-3 py-1 text-xs font-black text-indigo-300">
                        🏆 おすすめ構成パッケージ
                      </span>
                      <h3 className="mt-3 text-2xl font-black text-white">{diagnosisResult.title}</h3>
                      <p className="mt-1 text-xs font-bold text-slate-400">{diagnosisResult.subtitle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-white/50">合計想定額</p>
                      <p className="mt-1.5 text-2xl font-black text-emerald-400">{formatCost(diagnosisResult.monthlyUsd).combined}</p>
                    </div>
                  </div>

                  <p className="mt-4 text-xs font-bold leading-relaxed text-slate-300 border-l-2 border-indigo-500 pl-3">
                    {diagnosisResult.recommendationReason}
                  </p>

                  <p className="mt-4 text-sm font-bold leading-relaxed text-slate-200 bg-white/5 rounded-2xl p-4 border border-white/5">
                    {diagnosisResult.description}
                  </p>

                  {/* 構成プランカードの並列表示 */}
                  <div className="mt-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/40 mb-3">構成プラン詳細</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {diagnosisResult.plans.map((plan) => {
                        const isKeep = keepList.some(
                          (k) => k.serviceName === plan.service && k.planName === plan.plan
                        )
                        return (
                          <div key={`${plan.service}-${plan.plan}`} className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black text-white">{plan.service} {plan.plan}</h4>
                                <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-black text-slate-300">{plan.category}</span>
                              </div>
                              <p className="mt-2 text-xs font-bold leading-relaxed text-slate-300">{plan.bestFor}</p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                              <span className="text-xs font-black text-emerald-400">{formatCost(plan.monthlyUsd).jpy}</span>
                              <button
                                type="button"
                                onClick={() => toggleKeep(plan.service, plan.plan, plan.monthlyUsd)}
                                className={`rounded px-3 py-1 text-[9px] font-black transition-all ${
                                  isKeep ? 'bg-amber-400 text-slate-950' : 'bg-white/10 hover:bg-white/20'
                                }`}
                              >
                                {isKeep ? '★キープ済' : '★キープ'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* メリット・注意点 */}
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl bg-emerald-950/20 border border-emerald-500/20 p-4">
                      <p className="text-xs font-black text-emerald-400 flex items-center gap-1">
                        <span>✓</span> この構成のメリット・強み
                      </p>
                      <ul className="mt-3 space-y-1.5 text-xs font-bold text-slate-200 leading-relaxed list-disc list-inside">
                        {diagnosisResult.pros.map((pro) => (
                          <li key={pro}>{pro}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl bg-amber-950/20 border border-amber-500/20 p-4">
                      <p className="text-xs font-black text-amber-400 flex items-center gap-1">
                        <span>⚠</span> デメリット・検討の余地
                      </p>
                      <ul className="mt-3 space-y-1.5 text-xs font-bold text-slate-200 leading-relaxed list-disc list-inside">
                        {diagnosisResult.cons.map((con) => (
                          <li key={con}>{con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ---------------- 🗺️ VIEW: 2次元ポジショニングマトリックス ---------------- */}
      {viewMode === 'matrix' && (
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[24px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-950">🗺️ AI料金・機能 2次元マトリックスマップ</h2>
                <p className="mt-1 text-xs font-bold leading-relaxed text-gray-500">
                  縦軸に「コストレンジ」、横軸に「主要用途・強み」を設定し、各AIサービスがどこに位置づくかをプロットした2次元マップです。直感的なAI選びをサポートします。
                </p>
              </div>
              <div className="w-full sm:w-64">
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="マップ内を検索 (例: ChatGPT)..."
                  className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>

            {/* マトリックス表 */}
            <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white/70 p-1 shadow-inner scrollbar-thin">
              <table className="w-full min-w-[950px] border-collapse table-fixed">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50">
                    {/* 左上隅のブランク */}
                    <th className="w-[190px] p-4 text-left text-xs font-black uppercase text-slate-400 bg-slate-100/50 rounded-tl-2xl">
                      料金 \ 用途・強み
                    </th>
                    {Object.entries(matrixXLabels).map(([key, item]) => {
                      const iconMap: Record<string, string> = {
                        general: '🌐',
                        writing: '✍️',
                        coding: '💻',
                        media: '🎨',
                      }
                      return (
                        <th key={key} className="p-4 text-center border-l border-slate-200/80 bg-slate-50/40">
                          <span className="block text-sm font-black text-slate-900">
                            {iconMap[key]} {item.label}
                          </span>
                          <span className="mt-0.5 block text-[10px] font-bold text-gray-400 leading-normal">{item.desc}</span>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(matrixYLabels).map(([yKey, yItem]) => {
                    const dotColors: Record<string, string> = {
                      free: 'bg-emerald-500',
                      low: 'bg-blue-500',
                      mid: 'bg-violet-500',
                      high: 'bg-amber-500',
                      premium: 'bg-rose-500',
                    }
                    return (
                      <tr key={yKey} className="border-t border-slate-200/80">
                        {/* 縦軸ラベルセル */}
                        <td className="p-4 align-top bg-slate-50/20">
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-block size-2 shrink-0 rounded-full ${dotColors[yKey] || 'bg-slate-400'}`} />
                            <span className="text-sm font-black text-slate-900">{yItem.label}</span>
                          </div>
                          <span className="mt-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500 border border-slate-200">
                            {yItem.price}
                          </span>
                          <span className="mt-2 block text-[10px] font-bold leading-normal text-gray-400">{yItem.desc}</span>
                        </td>

                        {/* 各マトリックスセル */}
                        {Object.keys(matrixXLabels).map((xKey) => {
                          const matchedPlans = AI_PLANS.filter(
                            (plan) => plan.matrixX === xKey && plan.matrixY === yKey
                          ).map((plan) => {
                            const isMatch = !query.trim() || 
                              `${plan.service} ${plan.plan} ${plan.category}`.toLowerCase().includes(query.trim().toLowerCase())
                            return { ...plan, isMatch }
                          })

                          return (
                            <td key={`${xKey}-${yKey}`} className="p-3 align-top border-l border-slate-200/80 hover:bg-slate-50/40 transition-colors duration-200">
                              <div className="flex flex-col gap-2.5 min-h-[110px]">
                                {matchedPlans.length === 0 ? (
                                  <span className="text-[10px] font-bold text-gray-300 italic text-center my-auto">-</span>
                                ) : (
                                  matchedPlans.map((plan) => {
                                    const isKeep = keepList.some(
                                      (k) => k.serviceName === plan.service && k.planName === plan.plan
                                    )
                                    return (
                                      <div
                                        key={`${plan.service}-${plan.plan}`}
                                        className={`relative group rounded-xl border p-2.5 shadow-sm transition-all duration-300 ${
                                          plan.isMatch 
                                            ? 'border-slate-200 bg-white hover:shadow-md hover:-translate-y-0.5 z-10' 
                                            : 'border-slate-100 bg-white/40 opacity-20 pointer-events-none grayscale filter blur-[0.2px]'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between gap-1">
                                          <div className="min-w-0">
                                            <h4 className="text-xs font-black text-slate-900 truncate">{plan.service}</h4>
                                            <span className="inline-block rounded bg-slate-100 px-1 py-0.5 text-[9px] font-black text-gray-500 leading-none">
                                              {plan.plan}
                                            </span>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => toggleKeep(plan.service, plan.plan, plan.monthlyUsd)}
                                            className={`text-[13px] font-bold focus:outline-none transition-colors shrink-0 ${
                                              isKeep ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-amber-500'
                                            }`}
                                            title={isKeep ? 'キープ解除' : 'キープに登録'}
                                          >
                                            ★
                                          </button>
                                        </div>
                                        <p className="mt-1.5 text-[11px] font-black text-slate-950">
                                          {formatCost(plan.monthlyUsd).jpy}
                                        </p>
                                        
                                        {/* ホバー詳細ツールチップ (上側に吹き出し矢印付きで表示、z-50) */}
                                        <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-3 w-64 -translate-x-1/2 scale-95 rounded-2xl border border-slate-800 bg-slate-950/95 p-3.5 text-white opacity-0 shadow-2xl backdrop-blur transition-all duration-300 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">
                                          {/* 吹き出しの矢印 */}
                                          <div className="absolute top-full left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1 rotate-45 border-r border-b border-slate-800 bg-slate-950" />
                                          
                                          <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">{plan.category}</p>
                                          <h5 className="text-xs font-black text-white">{plan.service} {plan.plan}</h5>
                                          <p className="mt-2 text-[11px] font-bold leading-normal text-slate-200">{plan.bestFor}</p>
                                          <p className="mt-2 text-[10px] font-bold text-amber-300 leading-normal border-t border-white/10 pt-2">
                                            ⚠ {plan.cautions}
                                          </p>
                                          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">
                                            <span className="text-[11px] font-black text-emerald-300">{formatCost(plan.monthlyUsd).usd} ({formatCost(plan.monthlyUsd).jpy})</span>
                                            <a
                                              href={plan.sourceUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="rounded bg-white/20 px-2 py-1 text-[9px] font-black text-white hover:bg-white/30 transition-colors"
                                            >
                                              公式 ↗
                                            </a>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })
                                )}
                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {/* ---------------- 📋 VIEW: リスト形式（従来の比較とAPI単価） ---------------- */}
      {viewMode === 'list' && (
        <>
          {/* モード選択タブ（plans, llm, image, video） */}
          <section className="grid gap-3 md:grid-cols-4">
            {modeOptions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  mode === item.id
                    ? `border-white bg-gradient-to-br ${modeTone[item.id]} text-white shadow-lg shadow-slate-950/10`
                    : 'border-white/80 bg-white/86 text-gray-500 hover:-translate-y-0.5 hover:bg-white'
                }`}
              >
                <span className="block text-sm font-black">{item.label}</span>
                <span className={`mt-2 block text-xs font-bold leading-relaxed ${mode === item.id ? 'text-white/70' : 'text-gray-500'}`}>
                  {item.description}
                </span>
              </button>
            ))}
          </section>

          {/* 従量課金シミュレータパラメータ */}
          <section className="rounded-[24px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              {mode === 'llm' && (
                <label className="block">
                  <span className="text-xs font-black text-gray-500">月間トークン量（100万単位）</span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={tokenMillions}
                    onChange={(event) => setTokenMillions(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
              )}
              {mode === 'image' && (
                <label className="block">
                  <span className="text-xs font-black text-gray-500">月間生成枚数</span>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={imageCount}
                    onChange={(event) => setImageCount(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
              )}
              {mode === 'video' && (
                <label className="block">
                  <span className="text-xs font-black text-gray-500">月間生成分数</span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={videoMinutes}
                    onChange={(event) => setVideoMinutes(Number(event.target.value))}
                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                  />
                </label>
              )}
              <label className="block">
                <span className="text-xs font-black text-gray-500">サービス・モデル名で絞り込み</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="ChatGPT, Claude, Gemini, OpenAI..."
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-slate-950 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </label>
            </div>
          </section>

          {mode === 'plans' ? (
            /* サブスク月額プラン比較 */
            <div className="space-y-6">
              <section className="grid gap-3 md:grid-cols-3">
                {[
                  ['最安プラン', 'ChatGPT Free', '無料'],
                  ['おすすめプロプラン', 'ChatGPT Plus / Claude Pro', '$20 / 月'],
                  ['掲載プラン数', `${AI_PLANS.length} 件`, '主要サブスク'],
                ].map(([label, name, value]) => (
                  <article key={label} className="rounded-2xl border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                    <p className="mt-2 truncate text-lg font-black text-slate-950">{name}</p>
                    <p className="mt-1 text-sm font-bold text-gray-500">{value}</p>
                  </article>
                ))}
              </section>

              <section className="overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
                <div className="mb-4">
                  <h2 className="text-xl font-black text-slate-950">月額プラン比較</h2>
                  <p className="mt-1 text-xs font-bold leading-relaxed text-gray-500">
                    主要なAIサービスの個人向けサブスク料金の一覧です。為替レートに基づきリアルタイムに日本円へ換算されています。
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {AI_PLANS.filter((plan) => {
                    const nQuery = query.toLowerCase().trim()
                    if (!nQuery) return true
                    return `${plan.service} ${plan.plan} ${plan.category}`.toLowerCase().includes(nQuery)
                  }).map((plan) => {
                    const isKeep = keepList.some(
                      (k) => k.serviceName === plan.service && k.planName === plan.plan
                    )
                    return (
                      <article key={`${plan.service}-${plan.plan}`} className="rounded-2xl border border-gray-100 bg-white/78 p-4 shadow-sm shadow-slate-900/5">
                        <div className="grid gap-4 lg:grid-cols-[1fr_200px] lg:items-start">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-black text-slate-950">{plan.service}</h3>
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-gray-500">{plan.plan}</span>
                              <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-400">{plan.category}</span>
                            </div>
                            <p className="mt-2 text-sm font-bold leading-relaxed text-gray-600">{plan.bestFor}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {plan.includes.map((item) => (
                                <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-gray-500">
                                  {item}
                                </span>
                              ))}
                            </div>
                            <p className="mt-3 text-xs font-bold leading-relaxed text-amber-700">⚠ {plan.cautions}</p>
                          </div>
                          <div className="rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-400 to-cyan-400 p-4 text-white shadow-lg shadow-teal-500/15">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-white/70">Monthly</p>
                            <p className="mt-2 text-xl font-black">{formatCost(plan.monthlyUsd).usd}</p>
                            <p className="mt-1 text-xs font-bold text-white/90">
                              日本円換算: <span className="font-black">{formatCost(plan.monthlyUsd).jpy}</span>
                            </p>
                            <div className="mt-4 flex gap-2">
                              <a href={plan.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center rounded-full bg-white/20 hover:bg-white/30 px-2 py-1.5 text-[10px] font-black text-white">
                                公式料金
                              </a>
                              <button
                                type="button"
                                onClick={() => toggleKeep(plan.service, plan.plan, plan.monthlyUsd)}
                                className={`flex-1 text-center rounded-full px-2 py-1.5 text-[10px] font-black transition-all ${
                                  isKeep ? 'bg-amber-400 text-slate-950' : 'bg-white text-slate-950 hover:bg-slate-100'
                                }`}
                              >
                                {isKeep ? '★キープ済' : '★キープ'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            </div>
          ) : (
            /* API単価 / 従量課金シミュレータ */
            <>
              <section className="grid gap-3 md:grid-cols-3">
                {[
                  ['最安候補', cheapest?.model.name, cheapest ? formatCost(cheapest.estimatedCost).combined : '-'],
                  ['性能上位', strongest?.model.name, strongest ? `${strongest.performance} pt` : '-'],
                  ['費用対効果', bestBalance?.model.name, bestBalance ? formatCost(bestBalance.estimatedCost).combined : '-'],
                ].map(([label, name, value]) => (
                  <article key={label} className="rounded-2xl border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                    <p className="mt-2 truncate text-lg font-black text-slate-950">{name || '-'}</p>
                    <p className="mt-1 text-sm font-bold text-gray-500">{value}</p>
                  </article>
                ))}
              </section>

              <section className="overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
                <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black text-slate-950">推定コスト順</h2>
                    <p className="mt-1 text-xs font-bold leading-relaxed text-gray-500">
                      公開されている単価データに基づいたAPI月間コストの推定です。
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-gray-500">{rows.length} models</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs font-black uppercase tracking-[0.08em] text-gray-400">
                        <th className="py-2 pr-3">モデル</th>
                        <th className="px-3 py-2 text-right">推定月額（USD）</th>
                        <th className="px-3 py-2 text-right">推定月額（JPY換算）</th>
                        <th className="px-3 py-2 text-right">単価</th>
                        <th className="px-3 py-2 text-right">性能目安</th>
                        <th className="px-3 py-2 text-right">速度</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.model.id} className="border-b border-gray-100 transition hover:bg-white/70">
                          <td className="py-3 pr-3">
                            <p className="font-black text-slate-950">{row.model.name}</p>
                            <p className="text-xs font-bold text-gray-400">{row.model.creator} / {row.model.family}</p>
                          </td>
                          <td className="px-3 py-3 text-right text-base font-black text-slate-950">{formatCost(row.estimatedCost).usd}</td>
                          <td className="px-3 py-3 text-right text-base font-black text-emerald-600">{formatCost(row.estimatedCost).jpy}</td>
                          <td className="px-3 py-3 text-right text-xs font-bold text-gray-500">
                            {formatCost(row.unitPrice).usd} / {row.unitLabel}
                          </td>
                          <td className="px-3 py-3 text-right font-bold text-slate-950">{row.performance}</td>
                          <td className="px-3 py-3 text-right font-bold text-slate-950">{row.model.speed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </>
      )}
    </div>
  )
}



