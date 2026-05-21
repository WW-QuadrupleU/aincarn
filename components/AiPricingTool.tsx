'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  FALLBACK_AI_PAYLOAD,
  type AiModel,
  type AiModelComparePayload,
} from '@/lib/ai-model-compare-data'

type PricingMode = 'plans' | 'llm' | 'image' | 'video'

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
}

const AI_PLANS: PlanRow[] = [
  {
    service: 'ChatGPT',
    plan: 'Plus',
    provider: 'OpenAI',
    monthlyUsd: 20,
    category: '総合AI',
    includes: ['GPT系モデル', '画像生成', '音声・ファイル機能'],
    bestFor: 'まず1つだけ契約して、文章・調査・画像生成まで広く使いたい人',
    cautions: '利用上限や使えるモデルは時期により変わります。',
    sourceUrl: 'https://openai.com/chatgpt/pricing/',
  },
  {
    service: 'ChatGPT',
    plan: 'Pro',
    provider: 'OpenAI',
    monthlyUsd: 200,
    category: '高負荷AI',
    includes: ['高性能モデル', 'より大きい利用枠', '高度な推論用途'],
    bestFor: '仕事で長時間・高負荷に使い、待ち時間や上限を減らしたい人',
    cautions: '個人の軽い用途では月額が重くなりやすいです。',
    sourceUrl: 'https://openai.com/chatgpt/pricing/',
  },
  {
    service: 'Claude',
    plan: 'Pro',
    provider: 'Anthropic',
    monthlyUsd: 20,
    category: '文章・分析',
    includes: ['Claude上位モデル', '長文処理', 'プロジェクト機能'],
    bestFor: '長文読解、記事編集、資料整理を重視する人',
    cautions: '画像・動画生成を主目的にするなら別サービスも比較したいです。',
    sourceUrl: 'https://www.anthropic.com/pricing',
  },
  {
    service: 'Claude',
    plan: 'Max',
    provider: 'Anthropic',
    monthlyUsd: 100,
    category: '文章・分析',
    includes: ['Proより大きい利用枠', '上位モデル', '長時間作業向け'],
    bestFor: 'Claudeを日常的に大量利用するライター、編集者、開発者',
    cautions: '用途が散らばる場合は総合型プランとの併用費も見たいです。',
    sourceUrl: 'https://www.anthropic.com/pricing',
  },
  {
    service: 'Gemini',
    plan: 'Advanced',
    provider: 'Google',
    monthlyUsd: 19.99,
    category: 'Google連携',
    includes: ['Gemini上位機能', 'Googleアプリ連携', '大容量ストレージ枠'],
    bestFor: 'Google WorkspaceやAndroidとの連携を重視する人',
    cautions: 'AI単体だけで見ると、他サービスの得意分野も比較したいです。',
    sourceUrl: 'https://one.google.com/about/ai-premium/',
  },
  {
    service: 'Perplexity',
    plan: 'Pro',
    provider: 'Perplexity',
    monthlyUsd: 20,
    category: '検索・調査',
    includes: ['AI検索', '複数モデル選択', 'ファイル分析'],
    bestFor: '検索、出典確認、ニュース調査をよく行う人',
    cautions: '文章制作やコード用途ではメインAIと役割が重なることがあります。',
    sourceUrl: 'https://www.perplexity.ai/pro',
  },
  {
    service: 'GitHub Copilot',
    plan: 'Pro',
    provider: 'GitHub',
    monthlyUsd: 10,
    category: 'コーディング',
    includes: ['エディタ補完', 'チャット', 'コードレビュー補助'],
    bestFor: 'VS CodeやJetBrainsで日常的に開発する人',
    cautions: '汎用チャットAIの代替ではなく、開発補助として考える方が自然です。',
    sourceUrl: 'https://github.com/features/copilot/plans',
  },
  {
    service: 'Midjourney',
    plan: 'Basic',
    provider: 'Midjourney',
    monthlyUsd: 10,
    category: '画像生成',
    includes: ['画像生成枠', '商用利用条件あり', 'Discord/Web利用'],
    bestFor: '画像生成を低コストで試したい人',
    cautions: '生成量が増えると上位プランの方が扱いやすくなります。',
    sourceUrl: 'https://www.midjourney.com/account/',
  },
  {
    service: 'Runway',
    plan: 'Standard',
    provider: 'Runway',
    monthlyUsd: 15,
    yearlyUsd: 144,
    category: '動画生成',
    includes: ['動画生成クレジット', '編集ツール', '商用制作向け機能'],
    bestFor: '動画生成を制作ワークフローに組み込みたい人',
    cautions: '動画は消費クレジットが大きく、月間生成量の見積もりが重要です。',
    sourceUrl: 'https://runwayml.com/pricing',
  },
]

const modeOptions: Array<{ id: PricingMode; label: string; description: string }> = [
  {
    id: 'plans',
    label: '料金プラン',
    description: 'ChatGPT、Claude、Geminiなどの月額プランを単純比較します。',
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
  plans: 'from-indigo-500 via-sky-400 to-cyan-300',
  llm: 'from-emerald-400 via-teal-400 to-sky-400',
  image: 'from-fuchsia-500 via-rose-400 to-orange-300',
  video: 'from-violet-500 via-indigo-400 to-sky-300',
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

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value)
}

function formatDate(value: string) {
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

function PlanComparison({ query }: { query: string }) {
  const normalizedQuery = query.trim().toLowerCase()
  const plans = AI_PLANS
    .filter((plan) => {
      if (!normalizedQuery) return true
      return `${plan.service} ${plan.plan} ${plan.provider} ${plan.category}`.toLowerCase().includes(normalizedQuery)
    })
    .sort((a, b) => a.monthlyUsd - b.monthlyUsd)

  const cheapest = plans[0]
  const yearlyCheapest = [...plans].sort((a, b) => (a.yearlyUsd ?? a.monthlyUsd * 12) - (b.yearlyUsd ?? b.monthlyUsd * 12))[0]

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        {[
          ['最安プラン', cheapest ? `${cheapest.service} ${cheapest.plan}` : '-', cheapest ? `${formatUsd(cheapest.monthlyUsd)} / 月` : '-'],
          ['年払い目安', yearlyCheapest ? `${yearlyCheapest.service} ${yearlyCheapest.plan}` : '-', yearlyCheapest ? `${formatUsd(yearlyCheapest.yearlyUsd ?? yearlyCheapest.monthlyUsd * 12)} / 年` : '-'],
          ['掲載プラン', `${plans.length}件`, '主要AIサブスク'],
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
            まずはサブスク料金を単純に並べています。無料枠、利用上限、チーム料金、為替、税金は契約前に公式ページで確認してください。
          </p>
        </div>
        <div className="grid gap-3">
          {plans.map((plan) => (
            <article key={`${plan.service}-${plan.plan}`} className="rounded-2xl border border-gray-100 bg-white/78 p-4 shadow-sm shadow-slate-900/5">
              <div className="grid gap-4 lg:grid-cols-[1fr_180px] lg:items-start">
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
                  <p className="mt-3 text-xs font-bold leading-relaxed text-amber-700">{plan.cautions}</p>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-sky-400 p-4 text-white shadow-lg shadow-teal-500/15">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/70">Monthly</p>
                  <p className="mt-2 text-2xl font-black">{formatUsd(plan.monthlyUsd)}</p>
                  <p className="mt-1 text-xs font-bold text-white/78">
                    年額目安 {formatUsd(plan.yearlyUsd ?? plan.monthlyUsd * 12)}
                  </p>
                  <a href={plan.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex rounded-full bg-white px-3 py-2 text-xs font-black text-slate-950">
                    公式料金を見る
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

export default function AiPricingTool() {
  const [payload, setPayload] = useState<AiModelComparePayload>(FALLBACK_AI_PAYLOAD)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<PricingMode>('plans')
  const [tokenMillions, setTokenMillions] = useState(10)
  const [imageCount, setImageCount] = useState(200)
  const [videoMinutes, setVideoMinutes] = useState(30)
  const [query, setQuery] = useState('')

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
    return () => {
      active = false
    }
  }, [])

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

  const cheapest = rows[0]
  const strongest = [...rows].sort((a, b) => b.performance - a.performance)[0]
  const bestBalance = [...rows].sort((a, b) => {
    const aScore = a.performance / Math.max(1, a.estimatedCost)
    const bScore = b.performance / Math.max(1, b.estimatedCost)
    return bScore - aScore
  })[0]

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-sm shadow-slate-950/5 backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">AI Pricing</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">AI料金比較ツール</h1>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-gray-500">
              まず月額プランを単純比較し、必要に応じてAPI・画像生成・動画生成の従量課金も見積もれます。
              サブスク契約とAPI利用を分けて見られるようにしました。
            </p>
          </div>
          <div className={`bg-gradient-to-br ${modeTone[mode]} p-5 text-white sm:p-6`}>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Current view</p>
            <p className="mt-3 text-2xl font-black">
              {mode === 'plans'
                ? 'Monthly plans'
                : mode === 'llm'
                  ? `${tokenMillions}M tokens / 月`
                  : mode === 'image'
                    ? `${imageCount} generations / 月`
                    : `${videoMinutes} min / 月`}
            </p>
            <p className="mt-3 text-xs font-bold leading-relaxed text-white/78">
              {mode === 'plans'
                ? '主要サービスの公開料金を編集データとして掲載'
                : loading
                  ? '料金データを確認中です。'
                  : `最終更新: ${formatDate(payload.updatedAt)}`}
            </p>
          </div>
        </div>
      </section>

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
        <PlanComparison query={query} />
      ) : (
        <>
          <section className="grid gap-3 md:grid-cols-3">
            {[
              ['最安候補', cheapest?.model.name, cheapest ? formatUsd(cheapest.estimatedCost) : '-'],
              ['性能上位', strongest?.model.name, strongest ? `${strongest.performance} pt` : '-'],
              ['費用対効果', bestBalance?.model.name, bestBalance ? formatUsd(bestBalance.estimatedCost) : '-'],
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
                  公開されている単価データをもとにした概算です。無料枠、サブスク枠、従量課金の細かな条件は各サービス側で確認してください。
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-gray-500">{rows.length} models</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-xs font-black uppercase tracking-[0.08em] text-gray-400">
                    <th className="py-2 pr-3">モデル</th>
                    <th className="px-3 py-2 text-right">推定月額</th>
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
                      <td className="px-3 py-3 text-right text-base font-black text-slate-950">{formatUsd(row.estimatedCost)}</td>
                      <td className="px-3 py-3 text-right text-xs font-bold text-gray-500">
                        {formatUsd(row.unitPrice)} / {row.unitLabel}
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
    </div>
  )
}


