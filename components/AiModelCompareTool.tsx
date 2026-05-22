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
  if (score >= 90) return 'bg-gradient-to-r from-indigo-500 via-sky-400 to-cyan-300'
  if (score >= 80) return 'bg-gradient-to-r from-emerald-400 to-teal-300'
  if (score >= 70) return 'bg-gradient-to-r from-amber-300 to-orange-300'
  return 'bg-gradient-to-r from-slate-300 to-slate-400'
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

const AI_GENRE_GROUPS: Array<{
  id: string
  label: string
  description: string
  genreIds: AiGenreId[]
}> = [
  {
    id: 'text',
    label: 'テキストAI',
    description: '調査、文章、コード、分析、エージェント用途',
    genreIds: ['research', 'writing', 'coding', 'analysis', 'agent'],
  },
  {
    id: 'image',
    label: '画像AI',
    description: '画像生成、編集、素材制作',
    genreIds: ['textImage', 'imageImage'],
  },
  {
    id: 'video',
    label: '動画AI',
    description: 'Text to Video / Image to Video',
    genreIds: ['textVideo', 'imageVideo'],
  },
]

function ScoreBar({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3">
        <span className="text-xs font-bold text-gray-500">{label}</span>
        <span className="text-xs font-black text-slate-950">{score}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${scoreTone(score)}`} style={{ width: `${percent(score)}%` }} />
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white/72 px-2 py-2 text-center shadow-sm shadow-slate-900/5">
      <p className="text-[10px] font-bold text-gray-400">{label}</p>
      <p className="mt-0.5 font-black text-slate-950">{value}</p>
    </div>
  )
}

function MetricLeaderboard({
  title,
  caption,
  models,
  genreId,
  mode,
}: {
  title: string
  caption: string
  models: AiModel[]
  genreId: AiGenreId
  mode: 'intelligence' | 'speed' | 'price'
}) {
  const maxScore = Math.max(
    1,
    ...models.map((model) =>
      mode === 'intelligence'
        ? model.performance[genreId]
        : mode === 'speed'
          ? model.speed
          : priceEfficiencyScore(model, genreId)
    )
  )

  return (
    <section className="overflow-hidden rounded-[22px] border border-white/75 bg-white/90 p-4 shadow-sm shadow-slate-950/5 backdrop-blur">
      <div className="mb-4">
        <div className="border-b border-slate-100 pb-4">
          <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
          <p className="mt-1 text-xs font-bold leading-relaxed text-gray-500">{caption}</p>
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        {models.slice(0, 7).map((model, index) => {
          const score =
            mode === 'intelligence'
              ? model.performance[genreId]
              : mode === 'speed'
                ? model.speed
                : priceEfficiencyScore(model, genreId)
          const width = Math.max(8, (score / maxScore) * 100)

          return (
            <div key={model.id} className="py-3">
              <div className="mb-2 flex min-w-0 items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-black ${
                    index < 3 ? 'bg-slate-950 text-white' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-slate-950">{model.name}</p>
                    <p className="truncate text-[11px] font-bold text-gray-400">{model.creator}</p>
                  </div>
                </div>
                <p className="shrink-0 text-lg font-black text-slate-950">{score}</p>
              </div>
              <div className="h-3.5 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200/70">
                <div className={`h-full rounded-full ${scoreTone(score)}`} style={{ width: `${width}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
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
        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-950 outline-none transition-colors focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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
    <div className={`rounded-xl border p-3 ${tone === 'green' ? 'border-sky-200 bg-sky-50/80' : 'border-amber-200 bg-amber-50/80'}`}>
      <p className="mb-2 text-xs font-black text-slate-950">{title}</p>
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
    <div className="rounded-[22px] border border-white/75 bg-white/90 p-4 shadow-sm shadow-slate-950/5 backdrop-blur">
      <div className="mb-4">
        <p className="text-xs font-black text-slate-500">{model.creator} / {model.family}</p>
        <h3 className="text-lg font-extrabold text-slate-950">{model.name}</h3>
        <p className="mt-1 text-xs text-gray-400">
          賢さ: {model.performance[genreId]} / 速度: {model.speed} / 価格効率: {priceEfficiencyScore(model, genreId)} / コスト感: {costLabel(model.costLevel)}
        </p>
        {model.metric && <p className="mt-2 text-xs leading-relaxed text-gray-500">{model.metric}</p>}
      </div>
      <div className="grid gap-3">
        <ScoreBar label="賢さ" score={model.performance[genreId]} />
        <ScoreBar label="速度" score={model.speed} />
        <ScoreBar label="価格効率" score={priceEfficiencyScore(model, genreId)} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <TextPanel title="強み" items={model.strengths} tone="green" />
        <TextPanel title="注意点" items={model.cautions} tone="amber" />
      </div>
      <div className="mt-4 rounded-xl border border-slate-100 bg-white/72 p-3 text-xs leading-relaxed text-gray-500">
        <span className="font-bold text-slate-950">向いている人：</span>{model.bestFor}
        <br />
        <span className="font-bold text-slate-950">向きにくい人：</span>{model.avoidFor}
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
  const activeGroup = AI_GENRE_GROUPS.find((group) => group.genreIds.includes(genreId)) ?? AI_GENRE_GROUPS[0]
  const groupGenres = AI_GENRES.filter((item) => activeGroup.genreIds.includes(item.id))
  const genreModels = useMemo(() => eligibleForGenre(payload.models, genreId), [payload.models, genreId])

  const performanceRanking = useMemo(
    () => [...genreModels].sort((a, b) => b.performance[genreId] - a.performance[genreId]),
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
      <section className="rounded-[24px] border border-white/75 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
        <div className="mb-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Model Metrics</p>
            <span className="rounded-full bg-gradient-to-r from-slate-100 to-white px-2 py-1 text-[10px] font-bold text-slate-500">
              {payload.isLive ? '自動更新' : '編集データ'}
            </span>
            {loading && <span className="text-[10px] font-bold text-gray-400">更新確認中...</span>}
          </div>
          <h2 className="mt-1 text-xl font-extrabold text-slate-950">ジャンルごとにAIモデルを比較</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{genre.description}</p>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            賢さ、速度、価格効率を分けて表示します。用途によって重視すべき指標が変わるため、単一の総合点ではなく項目別に比較します。
          </p>
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {AI_GENRE_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setGenreId(group.genreIds[0])}
              className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                activeGroup.id === group.id
                  ? 'border-slate-300 bg-gradient-to-r from-[#111827] to-[#64748b] text-white shadow-sm shadow-slate-950/10'
                  : 'border-gray-200 bg-white/82 text-gray-500 hover:border-slate-300 hover:bg-white hover:text-slate-950'
              }`}
            >
              <span className="block text-sm font-black">{group.label}</span>
              <span className={`mt-1 block text-[11px] font-bold leading-relaxed ${
                activeGroup.id === group.id ? 'text-white/72' : 'text-gray-400'
              }`}>
                {group.description}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {groupGenres.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setGenreId(item.id)}
              className={`rounded-full border px-3 py-2 text-xs font-black transition-all ${
                genreId === item.id
                  ? 'border-brand-text bg-slate-950 text-white shadow-sm shadow-slate-900/10'
                  : 'border-gray-200 bg-white/72 text-gray-500 hover:border-slate-300 hover:bg-white hover:text-slate-950'
              }`}
            >
              {item.shortLabel}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {genre.primaryMetrics.map((metric) => (
            <span key={metric} className="rounded-full border border-slate-200/70 bg-white/72 px-3 py-1 text-xs font-bold text-gray-500">
              {metric}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-gray-500">{genre.sourceMetric}</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <MetricLeaderboard
          title="賢さランキング"
          caption="用途別の能力指標。リサーチ、文章、コード、分析などの主戦場を見ます。"
          models={performanceRanking}
          genreId={genreId}
          mode="intelligence"
        />
        <MetricLeaderboard
          title="速度ランキング"
          caption="応答速度の目安。大量処理や反復作業では体感差が大きくなります。"
          models={speedRanking}
          genreId={genreId}
          mode="speed"
        />
        <MetricLeaderboard
          title="価格効率ランキング"
          caption="価格の軽さをスコア化。高性能でも単価が重いモデルはここでは伸びにくくなります。"
          models={priceRanking}
          genreId={genreId}
          mode="price"
        />
      </section>

      <section className="rounded-[24px] border border-white/75 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <ModelSelect label="比較するモデル 1" value={first.id} models={genreModels} onChange={setFirstId} />
          </div>
          <div className="flex-1">
            <ModelSelect label="比較するモデル 2" value={second.id} models={genreModels} onChange={setSecondId} />
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-[#111827] via-[#334155] to-[#94a3b8] px-4 py-3 text-white shadow-lg shadow-slate-950/10 sm:w-44">
            <p className="text-[10px] font-bold text-white/75">賢さ比較の優位</p>
            <p className="text-sm font-black">{winner}</p>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ModelSummary model={first} genreId={genreId} />
          <ModelSummary model={second} genreId={genreId} />
        </div>
      </section>

      <section className="rounded-[24px] border border-white/75 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
        <h2 className="text-lg font-extrabold text-slate-950">{genre.shortLabel}モデル一覧</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-black uppercase tracking-[0.08em] text-gray-400">
                <th className="py-2 pr-3">モデル</th>
                <th className="px-3 py-2 text-right">指標</th>
                <th className="px-3 py-2 text-right">賢さ</th>
                <th className="px-3 py-2 text-right">速度</th>
                <th className="px-3 py-2 text-right">価格効率</th>
                <th className="px-3 py-2 text-right">価格目安</th>
              </tr>
            </thead>
            <tbody>
              {performanceRanking.map((model) => (
                <tr key={model.id} className="border-b border-gray-100 transition hover:bg-white/70">
                  <td className="py-3 pr-3">
                    <p className="font-black text-slate-950">{model.name}</p>
                    <p className="text-xs text-gray-400">{model.creator} / {model.releaseLabel}</p>
                  </td>
                  <td className="px-3 py-3 text-right text-xs font-bold text-gray-500">{model.metric ?? '-'}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-950">{model.performance[genreId]}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-950">{model.speed}</td>
                  <td className="px-3 py-3 text-right font-bold text-slate-950">{priceEfficiencyScore(model, genreId)}</td>
                  <td className="px-3 py-3 text-right text-xs font-bold text-gray-500">{model.priceLabel ?? costLabel(model.costLevel)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="rounded-2xl border border-white/70 bg-white/70 p-4 text-xs leading-relaxed text-gray-500 backdrop-blur">
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


