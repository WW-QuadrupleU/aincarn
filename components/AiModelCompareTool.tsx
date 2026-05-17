'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AI_GENRES,
  FALLBACK_AI_PAYLOAD,
  type AiGenreId,
  type AiModel,
  type AiModelComparePayload,
} from '@/lib/ai-model-compare-data'

function scoreTone(score: number): string {
  if (score >= 90) return 'bg-gradient-to-r from-fuchsia-500 to-rose-500'
  if (score >= 80) return 'bg-gradient-to-r from-sky-400 to-cyan-300'
  if (score >= 70) return 'bg-gradient-to-r from-yellow-300 to-orange-400'
  return 'bg-gray-400'
}

function costLabel(level: number): string {
  return ['低め', 'やや低め', '標準', '高め', 'かなり高め'][level - 1] || '標準'
}

function percent(score: number): number {
  return Math.max(6, Math.min(100, score))
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0
  return Math.round(Math.max(0, Math.min(100, value)))
}

function priceEfficiencyScore(model: AiModel, genreId: AiGenreId): number {
  const performance = model.performance[genreId] || 0
  const valueScore = model.costPerformance[genreId] || 0
  const inferredPriceScore = (valueScore - performance * 0.72) / 0.28

  if (Number.isFinite(inferredPriceScore) && inferredPriceScore > 0) {
    return clampScore(inferredPriceScore)
  }

  return clampScore(110 - model.costLevel * 14)
}

function aincarnScore(model: AiModel, genreId: AiGenreId): number {
  const intelligence = model.performance[genreId] || 0
  const speed = model.speed || 0
  const price = priceEfficiencyScore(model, genreId)

  return clampScore(intelligence * 0.55 + speed * 0.25 + price * 0.2)
}

function formatDate(value: string): string {
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

function eligibleForGenre(models: AiModel[], genreId: AiGenreId): AiModel[] {
  return models.filter((model) => model.visibleIn.includes(genreId))
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-gray-500">{label}</span>
        <span className="text-xs font-black text-brand-text">{score}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${scoreTone(score)}`} style={{ width: `${percent(score)}%` }} />
      </div>
    </div>
  )
}

function ProductivityBar({ model, genreId, rank }: { model: AiModel; genreId: AiGenreId; rank: number }) {
  const score = aincarnScore(model, genreId)
  const intelligence = model.performance[genreId] || 0
  const price = priceEfficiencyScore(model, genreId)

  return (
    <div className="rounded-xl border border-white/75 bg-white/90 p-4 shadow-sm shadow-rose-900/5 backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black text-[#f0187a]">#{rank} {model.family}</p>
          <h3 className="truncate text-base font-extrabold text-brand-text sm:text-lg">{model.name}</h3>
          <p className="text-xs text-gray-400">{model.creator} / {model.releaseLabel}</p>
        </div>
        <div className="shrink-0 rounded-xl bg-gradient-to-br from-[#f0187a] via-[#ff6b28] to-[#ffe431] px-3 py-2 text-center text-white shadow-lg shadow-rose-500/20">
          <p className="text-[10px] font-bold text-white/75">Aincarn</p>
          <p className="text-2xl font-black">{score}</p>
        </div>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${scoreTone(score)}`} style={{ width: `${percent(score)}%` }} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <MiniStat label="賢さ" value={intelligence} />
        <MiniStat label="速度" value={model.speed} />
        <MiniStat label="単価効率" value={price} />
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md bg-gray-50 px-2 py-2 text-center">
      <p className="text-[10px] font-bold text-gray-400">{label}</p>
      <p className="mt-0.5 font-black text-brand-text">{value}</p>
    </div>
  )
}

function RankingCard({
  model,
  genreId,
  rank,
  mode,
}: {
  model: AiModel
  genreId: AiGenreId
  rank: number
  mode: 'intelligence' | 'speed' | 'price'
}) {
  const score =
    mode === 'intelligence'
      ? model.performance[genreId]
      : mode === 'speed'
        ? model.speed
        : priceEfficiencyScore(model, genreId)
  const label = mode === 'intelligence' ? 'INTEL' : mode === 'speed' ? 'SPEED' : 'PRICE'
  const barLabel = mode === 'intelligence' ? '賢さ' : mode === 'speed' ? '速度' : '単価効率'

  return (
    <div className="rounded-xl border border-white/75 bg-white/90 p-4 shadow-sm shadow-rose-900/5 backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-[#f0187a]">#{rank} {model.family}</p>
          <h3 className="text-lg font-extrabold text-brand-text">{model.name}</h3>
          <p className="text-xs text-gray-400">{model.creator} / {model.releaseLabel}</p>
        </div>
        <div className="rounded-lg bg-gradient-to-br from-[#f0187a] via-[#ff6b28] to-[#ffe431] px-3 py-2 text-center text-white shadow-lg shadow-rose-500/20">
          <p className="text-[10px] font-bold text-white/75">{label}</p>
          <p className="text-xl font-black">{score}</p>
        </div>
      </div>
      <ScoreBar label={barLabel} score={score} />
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <MiniStat label="総合" value={aincarnScore(model, genreId)} />
        <MiniStat label="速度" value={model.speed} />
        <MiniStat label="単価効率" value={priceEfficiencyScore(model, genreId)} />
      </div>
      {model.metric && <p className="mt-3 text-xs font-bold text-gray-500">{model.metric}</p>}
      {model.priceLabel && <p className="mt-1 text-xs font-bold text-gray-400">{model.priceLabel}</p>}
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{model.bestFor}</p>
    </div>
  )
}

function ModelSelect({
  label,
  value,
  models,
  onChange,
}: {
  label: string
  value: string
  models: AiModel[]
  onChange: (value: string) => void
}) {
  const groups = models.reduce<Record<string, AiModel[]>>((acc, model) => {
    acc[model.family] = [...(acc[model.family] || []), model]
    return acc
  }, {})

  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-bold text-brand-text outline-none transition-colors focus:border-brand-green"
      >
        {Object.entries(groups).map(([family, familyModels]) => (
          <optgroup key={family} label={family}>
            {familyModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  )
}

function TextPanel({ title, items, tone }: { title: string; items: string[]; tone: 'green' | 'amber' }) {
  return (
    <div className={`rounded-lg border p-3 ${tone === 'green' ? 'border-sky-200 bg-sky-50/80' : 'border-amber-200 bg-amber-50/80'}`}>
      <p className="mb-2 text-xs font-black text-brand-text">{title}</p>
      <ul className="space-y-1 text-xs leading-relaxed text-gray-600">
        {items.map((item) => (
          <li key={item}>・{item}</li>
        ))}
      </ul>
    </div>
  )
}

function ModelSummary({ model, genreId }: { model: AiModel; genreId: AiGenreId }) {
  return (
    <div className="rounded-xl border border-white/75 bg-white/90 p-4 shadow-sm shadow-rose-900/5">
      <div className="mb-4">
        <p className="text-xs font-black text-[#f0187a]">{model.creator} / {model.family}</p>
        <h3 className="text-lg font-extrabold text-brand-text">{model.name}</h3>
        <p className="mt-1 text-xs text-gray-400">
          総合: {aincarnScore(model, genreId)} / 賢さ: {model.performance[genreId]} / 速度: {model.speed} / 単価効率: {priceEfficiencyScore(model, genreId)}
        </p>
        {model.metric && <p className="mt-2 text-xs leading-relaxed text-gray-500">{model.metric}</p>}
      </div>
      <div className="grid gap-3">
        <ScoreBar label="Aincarn総合スコア" score={aincarnScore(model, genreId)} />
        <ScoreBar label="賢さ" score={model.performance[genreId]} />
        <ScoreBar label="速度" score={model.speed} />
        <ScoreBar label="単価効率" score={priceEfficiencyScore(model, genreId)} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TextPanel title="強み" items={model.strengths} tone="green" />
        <TextPanel title="注意点" items={model.cautions} tone="amber" />
      </div>
      <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs leading-relaxed text-gray-500">
        <span className="font-bold text-brand-text">向いている人：</span>{model.bestFor}
        <br />
        <span className="font-bold text-brand-text">向きにくい人：</span>{model.avoidFor}
      </div>
    </div>
  )
}

export default function AiModelCompareTool() {
  const [payload, setPayload] = useState<AiModelComparePayload>(FALLBACK_AI_PAYLOAD)
  const [loading, setLoading] = useState(true)
  const [genreId, setGenreId] = useState<AiGenreId>('research')
  const [firstId, setFirstId] = useState('')
  const [secondId, setSecondId] = useState('')

  useEffect(() => {
    let active = true

    async function loadModels() {
      try {
        const response = await fetch('/api/ai-model-compare')
        if (!response.ok) throw new Error('failed to load AI model data')
        const data = (await response.json()) as AiModelComparePayload
        if (!active || !data.models?.length) return
        setPayload(data)
      } catch {
        if (active) setPayload(FALLBACK_AI_PAYLOAD)
      } finally {
        if (active) setLoading(false)
      }
    }

    loadModels()
    return () => {
      active = false
    }
  }, [])

  const genre = AI_GENRES.find((item) => item.id === genreId) ?? AI_GENRES[0]
  const genreModels = useMemo(() => eligibleForGenre(payload.models, genreId), [payload.models, genreId])

  const performanceRanking = useMemo(
    () => [...genreModels].sort((a, b) => b.performance[genreId] - a.performance[genreId]),
    [genreModels, genreId]
  )
  const productivityRanking = useMemo(
    () => [...genreModels].sort((a, b) => aincarnScore(b, genreId) - aincarnScore(a, genreId)),
    [genreModels, genreId]
  )
  const speedRanking = useMemo(
    () => [...genreModels].sort((a, b) => b.speed - a.speed),
    [genreModels]
  )
  const priceRanking = useMemo(
    () => [...genreModels].sort((a, b) => priceEfficiencyScore(b, genreId) - priceEfficiencyScore(a, genreId)),
    [genreModels, genreId]
  )

  const first = genreModels.find((model) => model.id === firstId) ?? productivityRanking[0]
  const second = genreModels.find((model) => model.id === secondId) ?? productivityRanking[1] ?? productivityRanking[0]
  const winner =
    aincarnScore(first, genreId) === aincarnScore(second, genreId)
      ? 'ほぼ同等'
      : aincarnScore(first, genreId) > aincarnScore(second, genreId)
        ? first.name
        : second.name

  useEffect(() => {
    if (!genreModels.length) return
    if (!genreModels.some((model) => model.id === firstId)) {
      setFirstId(genreModels[0].id)
    }
    if (!genreModels.some((model) => model.id === secondId)) {
      setSecondId(genreModels[1]?.id ?? genreModels[0].id)
    }
  }, [genreModels, firstId, secondId])

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-white/75 bg-white/88 p-4 shadow-sm shadow-rose-900/5 backdrop-blur">
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black text-[#f0187a]">Aincarn Score</p>
            <span className="rounded-full bg-gradient-to-r from-yellow-100 to-rose-100 px-2 py-1 text-[10px] font-bold text-rose-600">
              {payload.isLive ? '自動更新' : '編集データ'}
            </span>
            {loading && <span className="text-[10px] font-bold text-gray-400">更新確認中...</span>}
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-brand-text">ジャンルごとにAIモデルを比較</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{genre.description}</p>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Aincarn総合スコアは、賢さ55%、速度25%、単価効率20%を目安に、同じ作業をどれだけ速く安く終えやすいかで評価します。
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          {AI_GENRES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setGenreId(item.id)}
              className={`rounded-lg border px-3 py-2 text-left text-xs font-black transition-all ${
                genreId === item.id
                  ? 'border-rose-400 bg-gradient-to-r from-[#f0187a] to-[#ff6b28] text-white shadow-sm shadow-rose-500/20'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-rose-300 hover:text-brand-text'
              }`}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {genre.primaryMetrics.map((metric) => (
            <span key={metric} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-500">
              {metric}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-500">{genre.sourceMetric}</p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-extrabold text-brand-text">Aincarn総合スコア</h2>
        <div className="grid gap-4">
          {productivityRanking.slice(0, 6).map((model, index) => (
            <ProductivityBar key={model.id} model={model} genreId={genreId} rank={index + 1} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div>
          <h2 className="mb-3 text-lg font-extrabold text-brand-text">賢さランキング</h2>
          <div className="grid gap-4">
            {performanceRanking.slice(0, 5).map((model, index) => (
              <RankingCard key={model.id} model={model} genreId={genreId} rank={index + 1} mode="intelligence" />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-extrabold text-brand-text">速度ランキング</h2>
          <div className="grid gap-4">
            {speedRanking.slice(0, 5).map((model, index) => (
              <RankingCard key={model.id} model={model} genreId={genreId} rank={index + 1} mode="speed" />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-extrabold text-brand-text">単価効率ランキング</h2>
          <div className="grid gap-4">
            {priceRanking.slice(0, 5).map((model, index) => (
              <RankingCard key={model.id} model={model} genreId={genreId} rank={index + 1} mode="price" />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-white/75 bg-white/88 p-4 shadow-sm shadow-rose-900/5 backdrop-blur">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <ModelSelect label="比較するモデル 1" value={first.id} models={genreModels} onChange={setFirstId} />
          </div>
          <div className="flex-1">
            <ModelSelect label="比較するモデル 2" value={second.id} models={genreModels} onChange={setSecondId} />
          </div>
          <div className="rounded-lg bg-gradient-to-br from-[#f0187a] via-[#ff6b28] to-[#ffe431] px-4 py-3 text-white shadow-lg shadow-rose-500/20 sm:w-44">
            <p className="text-[10px] font-bold text-white/75">総合比較の優位</p>
            <p className="text-sm font-black">{winner}</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ModelSummary model={first} genreId={genreId} />
          <ModelSummary model={second} genreId={genreId} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/75 bg-white/88 p-4 shadow-sm shadow-rose-900/5 backdrop-blur">
        <h2 className="text-lg font-extrabold text-brand-text">{genre.shortLabel}モデル一覧</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-400">
                <th className="py-2 pr-3">モデル</th>
                <th className="px-3 py-2 text-right">指標</th>
                <th className="px-3 py-2 text-right">総合</th>
                <th className="px-3 py-2 text-right">賢さ</th>
                <th className="px-3 py-2 text-right">速度</th>
                <th className="px-3 py-2 text-right">単価効率</th>
                <th className="px-3 py-2 text-right">価格目安</th>
              </tr>
            </thead>
            <tbody>
              {productivityRanking.map((model) => (
                <tr key={model.id} className="border-b border-gray-100">
                  <td className="py-3 pr-3">
                    <p className="font-black text-brand-text">{model.name}</p>
                    <p className="text-xs text-gray-400">{model.creator} / {model.releaseLabel}</p>
                  </td>
                  <td className="px-3 py-3 text-right text-xs font-bold text-gray-500">{model.metric ?? '-'}</td>
                  <td className="px-3 py-3 text-right font-bold text-brand-text">{aincarnScore(model, genreId)}</td>
                  <td className="px-3 py-3 text-right font-bold text-brand-text">{model.performance[genreId]}</td>
                  <td className="px-3 py-3 text-right font-bold text-brand-text">{model.speed}</td>
                  <td className="px-3 py-3 text-right font-bold text-brand-text">{priceEfficiencyScore(model, genreId)}</td>
                  <td className="px-3 py-3 text-right text-xs font-bold text-gray-500">{model.priceLabel ?? costLabel(model.costLevel)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="rounded-xl border border-white/70 bg-white/70 p-4 text-xs leading-relaxed text-gray-500 backdrop-blur">
        {payload.message} 最終更新: {formatDate(payload.updatedAt)}。データについて：
        <a
          href={payload.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-brand-green underline underline-offset-2"
        >
          {payload.sourceLabel}
        </a>
      </p>
    </div>
  )
}
