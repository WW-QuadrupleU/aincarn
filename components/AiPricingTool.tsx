'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  FALLBACK_AI_PAYLOAD,
  type AiModel,
  type AiModelComparePayload,
} from '@/lib/ai-model-compare-data'

type PricingMode = 'llm' | 'image' | 'video'

type PricingRow = {
  model: AiModel
  unitPrice: number
  unitLabel: string
  estimatedCost: number
  performance: number
}

const modeOptions: Array<{ id: PricingMode; label: string; description: string }> = [
  {
    id: 'llm',
    label: 'LLM / API',
    description: '月間トークン量から、テキストAIのAPI料金を比較します。',
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
  if (mode === 'llm') return '1M tokens'
  if (mode === 'image') return '1 generation'
  return '1 minute'
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

export default function AiPricingTool() {
  const [payload, setPayload] = useState<AiModelComparePayload>(FALLBACK_AI_PAYLOAD)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<PricingMode>('llm')
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
      <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-sm shadow-rose-900/5 backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="p-5 sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">AI Pricing</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">AI料金比較ツール</h1>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-gray-500">
              モデル単価に月間利用量を掛けて、API・画像生成・動画生成の概算コストを横並びで比較します。
              実際の請求額はプロバイダーのプラン、キャッシュ、割引、地域税などで変わるため、購入前の目安として使ってください。
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#f0187a] via-[#ff6b28] to-[#ffe431] p-5 text-white sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Scenario</p>
            <p className="mt-3 text-2xl font-black">
              {mode === 'llm'
                ? `${tokenMillions}M tokens / 月`
                : mode === 'image'
                  ? `${imageCount} generations / 月`
                  : `${videoMinutes} min / 月`}
            </p>
            <p className="mt-3 text-xs font-bold leading-relaxed text-white/78">
              {loading ? '料金データを確認中です。' : `最終更新: ${formatDate(payload.updatedAt)}`}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {modeOptions.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`rounded-2xl border p-4 text-left transition-all ${
              mode === item.id
                ? 'border-rose-400 bg-brand-text text-white shadow-lg shadow-rose-900/10'
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

      <section className="rounded-[24px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-rose-900/5 backdrop-blur">
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
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
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
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
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
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
              />
            </label>
          )}
          <label className="block">
            <span className="text-xs font-black text-gray-500">モデル・会社名で絞り込み</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="OpenAI, Claude, Gemini..."
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-black text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ['最安候補', cheapest?.model.name, cheapest ? formatUsd(cheapest.estimatedCost) : '-'],
          ['性能上位', strongest?.model.name, strongest ? `${strongest.performance} pt` : '-'],
          ['費用対効果', bestBalance?.model.name, bestBalance ? formatUsd(bestBalance.estimatedCost) : '-'],
        ].map(([label, name, value]) => (
          <article key={label} className="rounded-2xl border border-white/80 bg-white/88 p-5 shadow-sm shadow-rose-900/5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-500">{label}</p>
            <p className="mt-2 truncate text-lg font-black text-brand-text">{name || '-'}</p>
            <p className="mt-1 text-sm font-bold text-gray-500">{value}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-rose-900/5 backdrop-blur">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-brand-text">推定コスト順</h2>
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
                    <p className="font-black text-brand-text">{row.model.name}</p>
                    <p className="text-xs font-bold text-gray-400">{row.model.creator} / {row.model.family}</p>
                  </td>
                  <td className="px-3 py-3 text-right text-base font-black text-brand-text">{formatUsd(row.estimatedCost)}</td>
                  <td className="px-3 py-3 text-right text-xs font-bold text-gray-500">
                    {formatUsd(row.unitPrice)} / {row.unitLabel}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-brand-text">{row.performance}</td>
                  <td className="px-3 py-3 text-right font-bold text-brand-text">{row.model.speed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
