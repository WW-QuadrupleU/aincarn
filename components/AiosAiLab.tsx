'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { useMemo, useState } from 'react'
import type { AiosModelUsage, GeneratedFuturePath } from '@/lib/aios-ai'
import type { AiosSignalKind } from '@/lib/aios-store'

type LabSignal = { kind: AiosSignalKind; content: string }
type LabResult = {
  path: GeneratedFuturePath
  modelRequested: string
  persisted: false
  signalCount: number
}

const signalInputs: Array<{ kind: AiosSignalKind; label: string; placeholder: string; color: string }> = [
  { kind: 'interest', label: '興味', placeholder: 'AIサービス開発\n個人の意思決定支援', color: 'text-sky-700 bg-sky-50' },
  { kind: 'action', label: '過去の行動', placeholder: '比較サイトを公開した\nサブスク機能を実装した', color: 'text-amber-700 bg-amber-50' },
  { kind: 'achievement', label: '実績', placeholder: '独自ドメインを取得した', color: 'text-emerald-700 bg-emerald-50' },
  { kind: 'insight', label: '気づき・制約', placeholder: '複数企画を同時進行すると迷いやすい', color: 'text-rose-700 bg-rose-50' },
]

function usd(value: number | null) {
  if (value === null) return '算出対象外'
  if (value < 0.001) return `$${value.toFixed(6)}`
  return `$${value.toFixed(4)}`
}

function UsagePanel({ usage, model }: { usage?: AiosModelUsage; model: string }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Model</p>
        <p className="mt-2 truncate text-xs font-black text-slate-800">{model}</p>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Tokens</p>
        <p className="mt-2 text-xs font-black text-slate-800">
          {usage ? `${usage.inputTokens.toLocaleString()} in / ${usage.outputTokens.toLocaleString()} out` : '-'}
        </p>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Estimated Cost</p>
        <p className="mt-2 text-xs font-black text-slate-800">{usage ? usd(usage.estimatedUsd) : '-'}</p>
      </div>
    </div>
  )
}

export default function AiosAiLab() {
  const { isLoaded, isSignedIn } = useUser()
  const [future, setFuture] = useState('Aincarn OSを、日々の意思決定を支えるサービスとして成立させる')
  const [drafts, setDrafts] = useState<Record<AiosSignalKind, string>>({
    interest: 'AI\n個人の目標達成支援',
    goal: '',
    action: 'AI比較ツールとDigital DNA UIを作った',
    achievement: '',
    insight: '価値の中心は目標ではなく、次の一手を選ぶ支援にある',
  })
  const [result, setResult] = useState<LabResult | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const signals = useMemo(
    () =>
      signalInputs.flatMap((input) =>
        drafts[input.kind]
          .split('\n')
          .map((content) => content.trim())
          .filter(Boolean)
          .map((content) => ({ kind: input.kind, content })),
      ),
    [drafts],
  )

  async function testPath() {
    if (!future.trim()) return
    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/test/aios/path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ future: future.trim(), signals }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '生成に失敗しました')
      setResult(data)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '生成に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  if (!isLoaded) return <div className="rounded-[28px] bg-white p-8 text-sm font-bold text-slate-500">AI Labを準備しています...</div>

  if (!isSignedIn) {
    return (
      <section className="mx-auto max-w-3xl rounded-[36px] border border-white/80 bg-white/86 p-8 text-center shadow-xl shadow-slate-950/5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Private Development Lab</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950">Aincarn AI Path Lab</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm font-bold leading-relaxed text-slate-500">
          Digital DNAから次の3手を生成するAI部分を、保存データとは分離して検証します。
        </p>
        <SignInButton mode="modal">
          <button type="button" className="mt-7 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white">
            ログインしてテストする
          </button>
        </SignInButton>
      </section>
    )
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center gap-3 rounded-[28px] border border-white/80 bg-white/88 px-5 py-4 shadow-sm backdrop-blur-xl">
        <span className="rounded-full bg-gradient-to-r from-indigo-600 to-cyan-400 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-white">
          Private Test
        </span>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aincarn AI Path Lab</p>
          <h1 className="text-lg font-black text-slate-950">次の3手の品質と原価を試す</h1>
        </div>
        <div className="ml-auto"><UserButton /></div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <section className="rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-500">Chosen Future</p>
          <label className="mt-3 block text-xs font-black text-slate-600">ユーザーが選んだ未来</label>
          <textarea
            value={future}
            onChange={(event) => setFuture(event.target.value)}
            rows={3}
            className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold leading-relaxed text-slate-900 outline-none focus:border-indigo-300"
          />
          <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Digital DNA Inputs</p>
          <div className="mt-3 space-y-3">
            {signalInputs.map((input) => (
              <label key={input.kind} className="block">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black ${input.color}`}>{input.label}</span>
                <textarea
                  value={drafts[input.kind]}
                  onChange={(event) => setDrafts((current) => ({ ...current, [input.kind]: event.target.value }))}
                  placeholder={input.placeholder}
                  rows={2}
                  className="mt-2 w-full resize-none rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold leading-relaxed text-slate-700 outline-none focus:border-sky-300"
                />
              </label>
            ))}
          </div>
          <button
            type="button"
            onClick={testPath}
            disabled={busy || !future.trim()}
            className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800 disabled:opacity-40"
          >
            {busy ? '設計しています...' : '次の3手をテスト生成'}
          </button>
          <p className="mt-3 text-[11px] font-bold leading-relaxed text-slate-400">
            この画面の入力と出力はDigital DNAへ保存されません。モデル品質を確認するための開発用実行です。
          </p>
        </section>

        <section className="min-h-[640px] rounded-[30px] border border-white/80 bg-white/90 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Generated Path</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">未来は固定し、次の手を検証する</h2>
            </div>
            {result && <span className="rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700">NOT SAVED</span>}
          </div>

          {error && <p className="mt-5 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}
          {!result && !error && (
            <div className="mt-8 rounded-[28px] border border-dashed border-slate-200 p-8 text-center">
              <p className="text-sm font-bold leading-relaxed text-slate-400">
                左側に未来とDNAの断片を入力して、<br />提案の質と実行コストを確認してください。
              </p>
            </div>
          )}
          {result && (
            <>
              <div className="mt-5">
                <UsagePanel usage={result.path.usage} model={result.path.model} />
              </div>
              <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Why This Route</p>
                <p className="mt-2 text-sm font-bold leading-relaxed text-white/85">{result.path.rationale}</p>
              </div>
              <div className="mt-5 grid gap-3">
                {result.path.moves.map((move, index) => (
                  <article key={`${move.title}-${index}`} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <div className="flex gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">{index + 1}</span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-black text-slate-950">{move.title}</h3>
                          <span className="rounded-full bg-white px-2 py-1 text-[9px] font-black uppercase text-slate-400">{move.certainty}</span>
                        </div>
                        <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">{move.reason}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <p className="mt-5 text-[11px] font-bold text-slate-400">
                参照したDNA: {result.signalCount}件 / 要求モデル: {result.modelRequested}
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
