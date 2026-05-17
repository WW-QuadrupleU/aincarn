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
  if (score >= 90) return 'bg-brand-green'
  if (score >= 80) return 'bg-sky-500'
  if (score >= 70) return 'bg-amber-500'
  return 'bg-gray-400'
}

function costLabel(level: number): string {
  return ['低め', 'やや低め', '標準', '高め', 'かなり高め'][level - 1] || '標準'
}

function percent(score: number): number {
  return Math.max(6, Math.min(100, score))
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
  mode: 'performance' | 'cost'
}) {
  const score = mode === 'performance' ? model.performance[genreId] : model.costPerformance[genreId]

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black text-brand-green">#{rank} {model.family}</p>
          <h3 className="text-lg font-extrabold text-brand-text">{model.name}</h3>
          <p className="text-xs text-gray-400">{model.creator} / {model.releaseLabel}</p>
        </div>
        <div className="rounded-lg bg-brand-dark px-3 py-2 text-center text-white">
          <p className="text-[10px] font-bold text-gray-300">{mode === 'performance' ? 'PERF' : 'VALUE'}</p>
          <p className="text-xl font-black">{score}</p>
        </div>
      </div>
      <ScoreBar label={mode === 'performance' ? '性能スコア' : 'コスパスコア'} score={score} />
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <MiniStat label="速度" value={model.speed} />
        <MiniStat label="日本語" value={model.japanese} />
        <MiniStat label="文脈" value={model.context} />
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
    <div className={`rounded-lg border p-3 ${tone === 'green' ? 'border-brand-green/30 bg-brand-green/5' : 'border-amber-200 bg-amber-50'}`}>
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
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-4">
        <p className="text-xs font-black text-brand-green">{model.creator} / {model.family}</p>
        <h3 className="text-lg font-extrabold text-brand-text">{model.name}</h3>
        <p className="mt-1 text-xs text-gray-400">
          性能: {model.performance[genreId]} / コスパ: {model.costPerformance[genreId]} / コスト感: {costLabel(model.costLevel)}
        </p>
        {model.metric && <p className="mt-2 text-xs leading-relaxed text-gray-500">{model.metric}</p>}
      </div>
      <div className="grid gap-3">
        <ScoreBar label="性能スコア" score={model.performance[genreId]} />
        <ScoreBar label="コスパスコア" score={model.costPerformance[genreId]} />
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
  const costRanking = useMemo(
    () => [...genreModels].sort((a, b) => b.costPerformance[genreId] - a.costPerformance[genreId]),
    [genreModels, genreId]
  )

  const first = genreModels.find((model) => model.id === firstId) ?? performanceRanking[0]
  const second = genreModels.find((model) => model.id === secondId) ?? performanceRanking[1] ?? performanceRanking[0]
  const winner =
    first.performance[genreId] === second.performance[genreId]
      ? 'ほぼ同等'
      : first.performance[genreId] > second.performance[genreId]
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
      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black text-brand-green">Model Ranking</p>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500">
              {payload.isLive ? '自動更新' : 'フォールバック'}
            </span>
            {loading && <span className="text-[10px] font-bold text-gray-400">更新確認中...</span>}
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-brand-text">ジャンルごとにAIモデルを比較</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{genre.description}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          {AI_GENRES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setGenreId(item.id)}
              className={`rounded-lg border px-3 py-2 text-left text-xs font-black transition-all ${
                genreId === item.id
                  ? 'border-brand-green bg-brand-green text-white shadow-sm'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-brand-green hover:text-brand-text'
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

      <section className="grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-extrabold text-brand-text">性能ランキング</h2>
          <div className="grid gap-4">
            {performanceRanking.slice(0, 5).map((model, index) => (
              <RankingCard key={model.id} model={model} genreId={genreId} rank={index + 1} mode="performance" />
            ))}
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-lg font-extrabold text-brand-text">コスパランキング</h2>
          <div className="grid gap-4">
            {costRanking.slice(0, 5).map((model, index) => (
              <RankingCard key={model.id} model={model} genreId={genreId} rank={index + 1} mode="cost" />
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <ModelSelect label="比較するモデル 1" value={first.id} models={genreModels} onChange={setFirstId} />
          </div>
          <div className="flex-1">
            <ModelSelect label="比較するモデル 2" value={second.id} models={genreModels} onChange={setSecondId} />
          </div>
          <div className="rounded-lg bg-brand-dark px-4 py-3 text-white sm:w-44">
            <p className="text-[10px] font-bold text-gray-300">性能比較の優位</p>
            <p className="text-sm font-black">{winner}</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ModelSummary model={first} genreId={genreId} />
          <ModelSummary model={second} genreId={genreId} />
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-extrabold text-brand-text">{genre.shortLabel}モデル一覧</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-400">
                <th className="py-2 pr-3">モデル</th>
                <th className="px-3 py-2 text-right">指標</th>
                <th className="px-3 py-2 text-right">性能</th>
                <th className="px-3 py-2 text-right">コスパ</th>
                <th className="px-3 py-2 text-right">価格目安</th>
              </tr>
            </thead>
            <tbody>
              {performanceRanking.map((model) => (
                <tr key={model.id} className="border-b border-gray-100">
                  <td className="py-3 pr-3">
                    <p className="font-black text-brand-text">{model.name}</p>
                    <p className="text-xs text-gray-400">{model.creator} / {model.releaseLabel}</p>
                  </td>
                  <td className="px-3 py-3 text-right text-xs font-bold text-gray-500">{model.metric ?? '-'}</td>
                  <td className="px-3 py-3 text-right font-bold text-brand-text">{model.performance[genreId]}</td>
                  <td className="px-3 py-3 text-right font-bold text-brand-text">{model.costPerformance[genreId]}</td>
                  <td className="px-3 py-3 text-right text-xs font-bold text-gray-500">{model.priceLabel ?? costLabel(model.costLevel)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="rounded-lg bg-gray-100 p-4 text-xs leading-relaxed text-gray-500">
        {payload.message} 最終更新: {formatDate(payload.updatedAt)}。参考データ元：
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
