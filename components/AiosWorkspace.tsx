'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import type { AiosSignalKind, SavedAiosFuture, SavedAiosPath, SavedAiosProject, SavedAiosSignal } from '@/lib/aios-store'

type UsageState = {
  tierLabel: string
  used: number
  limit: number | null
  resetsAt: string
} | null

type WorkspaceState = {
  projects: SavedAiosProject[]
  project: SavedAiosProject
  signals: SavedAiosSignal[]
  future: SavedAiosFuture | null
  path: SavedAiosPath | null
  usage: UsageState
}

const signalOptions: Array<{
  kind: AiosSignalKind
  label: string
  prompt: string
  tone: string
  node: string
  selectedTone: string
  idleTone: string
}> = [
  { kind: 'goal', label: '目標', prompt: '実現したい未来', tone: 'bg-indigo-50 text-indigo-700 border-indigo-100', node: 'dna-node-goal', selectedTone: 'border-indigo-300/70 bg-indigo-400/30 text-indigo-50 shadow-sm shadow-indigo-400/20', idleTone: 'border-indigo-300/20 bg-indigo-400/10 text-indigo-100/80' },
  { kind: 'action', label: '行動', prompt: '今日取り組んだこと', tone: 'bg-amber-50 text-amber-700 border-amber-100', node: 'dna-node-action', selectedTone: 'border-amber-300/70 bg-amber-400/30 text-amber-50 shadow-sm shadow-amber-400/20', idleTone: 'border-amber-300/20 bg-amber-400/10 text-amber-100/80' },
  { kind: 'achievement', label: '実績', prompt: '達成できた成果', tone: 'bg-emerald-50 text-emerald-700 border-emerald-100', node: 'dna-node-achievement', selectedTone: 'border-emerald-300/70 bg-emerald-400/30 text-emerald-50 shadow-sm shadow-emerald-400/20', idleTone: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100/80' },
  { kind: 'interest', label: '興味', prompt: 'いま惹かれているテーマ', tone: 'bg-sky-50 text-sky-700 border-sky-100', node: 'dna-node-interest', selectedTone: 'border-sky-300/70 bg-sky-400/30 text-sky-50 shadow-sm shadow-sky-400/20', idleTone: 'border-sky-300/20 bg-sky-400/10 text-sky-100/80' },
  { kind: 'insight', label: '気づき', prompt: '気づいたこと、迷い', tone: 'bg-rose-50 text-rose-700 border-rose-100', node: 'dna-node-insight', selectedTone: 'border-rose-300/70 bg-rose-400/30 text-rose-50 shadow-sm shadow-rose-400/20', idleTone: 'border-rose-300/20 bg-rose-400/10 text-rose-100/80' },
]

function dnaHash(input: string) {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) hash = (hash * 31 + input.charCodeAt(index)) % 10007
  return hash
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function UsageChip({ usage }: { usage: UsageState }) {
  if (!usage) return null
  const reset = new Intl.DateTimeFormat('ja-JP', { month: '2-digit', day: '2-digit' }).format(new Date(usage.resetsAt))
  return (
    <div className="hidden items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-black text-slate-500 md:flex">
      <span className="rounded-full bg-slate-950 px-2 py-1 text-white">{usage.tierLabel}</span>
      <span>{usage.limit === null ? 'AI実行 無制限' : `${usage.used} / ${usage.limit}`}</span>
      <span className="text-slate-300">|</span>
      <span>{reset} 更新</span>
    </div>
  )
}

function DnaParticle({ signal, index }: { signal: SavedAiosSignal; index: number }) {
  const option = signalOptions.find((item) => item.kind === signal.kind) || signalOptions[0]
  const seed = dnaHash(signal.id + signal.content)
  const style = {
    '--dna-left': `${9 + ((seed + index * 19) % 38)}%`,
    '--dna-top': `${46 + ((seed * 3 + index * 17) % 42)}%`,
    '--dna-duration': `${6 + (seed % 5)}s`,
    '--dna-delay': `${-(seed % 9)}s`,
  } as CSSProperties
  return (
    <div style={style} className={`dna-node ${option.node}`} title={`${option.label}: ${signal.content}`}>
      <span className="dna-node-kind">{option.label}</span>
      <span className="dna-node-value">{signal.content}</span>
    </div>
  )
}

export default function AiosWorkspace({ fallback }: { fallback: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser()
  const [state, setState] = useState<WorkspaceState | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [signalKind, setSignalKind] = useState<AiosSignalKind>('goal')
  const [signalDraft, setSignalDraft] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [selectedMove, setSelectedMove] = useState(0)
  const [completionComment, setCompletionComment] = useState('')
  const [choosingFuture, setChoosingFuture] = useState(false)

  async function loadState() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/aios', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '読み込みに失敗しました')
      setState(data)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) loadState()
  }, [isLoaded, isSignedIn])

  async function api(action: string, payload: Record<string, unknown> = {}) {
    const response = await fetch('/api/aios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || '操作に失敗しました')
    return data
  }

  async function captureSignal() {
    const content = signalDraft.trim()
    if (!content || !state) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const data = await api('signal', { projectId: state.project.id, kind: signalKind, content })
      setState((current) => (current ? { ...current, signals: data.signals } : current))
      setSignalDraft('')
      if (signalKind === 'goal') {
        setChoosingFuture(true)
        setNotice('目標候補をDNAに残しました。Chosen Futureは、あなたが選ぶまで変わりません。')
      } else {
        setNotice('Digital DNAに組み込みました。')
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '記録に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  async function chooseFuture(signalId: string) {
    setBusy(true)
    setError('')
    try {
      const data = await api('select-future', { signalId })
      setState((current) => (current ? { ...current, future: data.future, path: null } : current))
      setChoosingFuture(false)
      setSelectedMove(0)
      setNotice('Chosen Futureを選択しました。この未来に向けた最初の3手を描けます。')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '未来の設定に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  async function drawPath() {
    setBusy(true)
    setError('')
    try {
      const data = await api('generate-path')
      setState((current) => (current ? { ...current, future: data.future, path: data.path } : current))
      setSelectedMove(0)
      setNotice('Chosen Futureは変えずに、Digital DNAをもとに次の3手を再設計しました。')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '道しるべの生成に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  async function completeCurrentMove() {
    if (!state?.path) return
    setBusy(true)
    setError('')
    try {
      const data = await api('complete-move', {
        projectId: state.project.id,
        pathId: state.path.id,
        moveIndex: 0,
        comment: completionComment,
      })
      setState((current) => (current ? { ...current, signals: data.signals, path: data.path, future: data.future } : current))
      setCompletionComment('')
      setSelectedMove(0)
      setNotice('完了した一手を行動DNAに取り込み、同じ未来への次の3手を描き直しました。')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '完了の保存に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  const signalTotals = useMemo(
    () =>
      signalOptions.map((option) => ({
        ...option,
        count: (state?.signals || []).filter((signal) => signal.kind === option.kind).length,
      })),
    [state?.signals],
  )

  if (!isLoaded || (isSignedIn && loading && !state)) {
    return <div className="rounded-[28px] border border-white/80 bg-white/80 p-6 text-sm font-bold text-slate-500">Digital DNAを読み込んでいます...</div>
  }
  if (!isSignedIn) return fallback
  if (!state) return <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error || '読み込みに失敗しました'}</p>

  const selectedSignal = signalOptions.find((option) => option.kind === signalKind) || signalOptions[0]
  const goals = state.signals.filter((signal) => signal.kind === 'goal')
  const move = state.path?.moves[selectedMove]
  const pendingDna = Boolean(state.path && state.signals.some((signal) => new Date(signal.createdAt) > new Date(state.path!.createdAt)))

  return (
    <div className="aios-workspace flex h-full min-h-0 flex-col gap-3">
      <header className="flex shrink-0 items-center gap-3 rounded-[26px] border border-white/80 bg-white/84 px-4 py-3 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">AI</div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Aincarn OS / Digital Self</p>
          <h1 className="text-base font-black tracking-tight text-slate-950">あなたのDigital DNA</h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <UsageChip usage={state.usage} />
          <Link href="/tools/aios/pricing" className="text-xs font-black text-slate-500 hover:text-slate-950">プラン</Link>
          <UserButton />
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(650px,1fr)_350px]">
        <main className="dna-stage relative min-h-[760px] overflow-hidden rounded-[32px] border border-white/10 shadow-xl shadow-slate-950/10 lg:min-h-0">
          <div className="dna-orbit dna-orbit-a" />
          <div className="dna-orbit dna-orbit-b" />
          <div className="dna-strand dna-strand-a" />
          <div className="dna-strand dna-strand-b" />
          {state.signals.slice(0, 20).map((signal, index) => (
            <DnaParticle key={signal.id} signal={signal} index={index} />
          ))}

          <section className="dna-capture absolute left-4 top-4 z-20 w-[min(370px,calc(100%-2rem))] rounded-[24px] border border-white/14 bg-slate-950/55 p-4 text-white backdrop-blur-xl">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/45">Digital DNA</p>
            <h2 className="mt-2 text-xl font-black tracking-tight">いまの自分を残す。</h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {signalOptions.map((option) => (
                <button
                  key={option.kind}
                  type="button"
                  onClick={() => setSignalKind(option.kind)}
                  className={`rounded-full border px-3 py-1.5 text-[10px] font-black transition ${
                    signalKind === option.kind ? option.selectedTone : option.idleTone
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                value={signalDraft}
                onChange={(event) => setSignalDraft(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && captureSignal()}
                placeholder={selectedSignal.prompt}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2.5 text-xs font-bold text-white outline-none placeholder:text-white/32 focus:border-cyan-300/60"
              />
              <button type="button" onClick={captureSignal} disabled={busy || !signalDraft.trim()} className="rounded-xl bg-white px-3 text-xs font-black text-slate-950 disabled:opacity-35">
                残す
              </button>
            </div>
            {goals.length > 0 && (!state.future || choosingFuture) && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-[9px] font-black text-white/42">未来として選ぶ</p>
                  {state.future && (
                    <button type="button" onClick={() => setChoosingFuture(false)} className="text-[9px] font-black text-white/42 hover:text-white">
                      閉じる
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {goals.slice(0, 4).map((goal) => {
                    const chosen = state.future?.statement === goal.content
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => !chosen && chooseFuture(goal.id)}
                        disabled={busy || chosen}
                        className={`max-w-full truncate rounded-full px-3 py-1.5 text-[10px] font-black ring-1 ring-inset ${
                          chosen ? 'bg-cyan-300 text-slate-950 ring-cyan-200' : 'bg-indigo-400/16 text-indigo-100 ring-indigo-300/24'
                        }`}
                      >
                        {chosen ? `選択中: ${goal.content}` : goal.content}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </section>

          {state.future ? (
            <>
              <div className="future-beacon absolute right-[6%] top-[8%] z-20 w-[min(285px,42%)] rounded-[26px] border border-indigo-200/28 bg-white/[0.1] p-4 text-white backdrop-blur-xl">
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-200">Chosen Future</p>
                <p className="mt-2 text-base font-black leading-relaxed">{state.future.statement}</p>
                <p className="mt-2 text-[10px] font-bold leading-relaxed text-white/50">この未来を変えるのは、あなたの選択だけです。</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!state.path && (
                    <button type="button" onClick={drawPath} disabled={busy} className="rounded-full bg-white px-3 py-2 text-[10px] font-black text-slate-950 disabled:opacity-40">
                      最初の3手を描く
                    </button>
                  )}
                  <button type="button" onClick={() => setChoosingFuture(true)} disabled={busy} className="rounded-full border border-white/18 bg-white/[0.06] px-3 py-2 text-[10px] font-black text-white disabled:opacity-40">
                    未来を選び直す
                  </button>
                </div>
              </div>
              {state.path && (
                <div className="path-constellation">
                  <div className="path-beam" />
                  {state.path.moves.map((pathMove, index) => (
                    <button
                      key={`${state.path!.id}-${index}`}
                      type="button"
                      onClick={() => setSelectedMove(index)}
                      className={`path-orb path-orb-${index + 1} ${selectedMove === index ? 'path-orb-active' : ''}`}
                    >
                      <span>{index + 1}</span>
                      <strong>{pathMove.title}</strong>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="absolute right-[7%] top-[16%] z-10 max-w-[280px] rounded-[25px] border border-dashed border-white/16 bg-white/[0.04] p-5 text-white/55">
              <p className="text-[9px] font-black uppercase tracking-[0.22em]">Chosen Future</p>
              <p className="mt-3 text-sm font-bold leading-relaxed">「目標」のDNAを残して、向かう未来を一つ選んでください。</p>
            </div>
          )}

          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-1.5">
            {signalTotals.map((signal) => (
              <span key={signal.kind} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black text-white/60">
                {signal.label} <strong className="ml-1 text-white">{signal.count}</strong>
              </span>
            ))}
          </div>
        </main>

        <aside className="flex min-h-0 flex-col gap-3">
          <section className="shrink-0 rounded-[28px] border border-white/80 bg-white/90 p-4 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Next Step</p>
              {state.path && (
                <button type="button" onClick={drawPath} disabled={busy} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black text-slate-600 hover:border-slate-400 disabled:opacity-40">
                  次の3手を再設計
                </button>
              )}
            </div>
            {move ? (
              <>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <h2 className="text-base font-black leading-relaxed text-slate-950">{move.title}</h2>
                  <span className="shrink-0 rounded-full bg-slate-950 px-2 py-1 text-[9px] font-black text-white">
                    {selectedMove === 0 ? 'NOW' : selectedMove === 1 ? 'NEXT' : 'EMERGING'}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">{move.reason}</p>
                {selectedMove === 0 ? (
                  <>
                    <textarea
                      value={completionComment}
                      onChange={(event) => setCompletionComment(event.target.value)}
                      rows={2}
                      placeholder="実行して分かったこと、結果を残す"
                      className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-900 outline-none focus:border-cyan-300"
                    />
                    <button type="button" onClick={completeCurrentMove} disabled={busy || !completionComment.trim()} className="mt-2 w-full rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-black text-white disabled:opacity-35">
                      完了して行動DNAに残す
                    </button>
                  </>
                ) : (
                  <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-400">この手は、現在の行動結果で変わる可能性があります。</p>
                )}
              </>
            ) : (
              <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs font-bold leading-relaxed text-slate-500">
                {state.future ? '道しるべを描くと、ここで最初の一手を実行できます。' : '未来を選ぶと、次の一手がここに現れます。'}
              </p>
            )}
            {pendingDna && <p className="mt-3 text-[11px] font-bold text-cyan-700">新しいDNAがあります。未来はそのまま、次の3手を再設計できます。</p>}
            {notice && <p className="mt-3 text-[11px] font-bold leading-relaxed text-emerald-700">{notice}</p>}
            {error && <p className="mt-3 text-[11px] font-bold leading-relaxed text-rose-600">{error}</p>}
          </section>

          <section className="flex min-h-0 flex-1 flex-col rounded-[28px] border border-white/80 bg-white/86 p-4 shadow-sm">
            <div className="flex shrink-0 items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">DNA Timeline</p>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{state.signals.length}</span>
            </div>
            <div className="scrollbar-hide mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {state.signals.map((signal) => {
                const option = signalOptions.find((item) => item.kind === signal.kind) || signalOptions[0]
                return (
                  <article key={signal.id} className="rounded-2xl border border-slate-100 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`rounded-full border px-2 py-1 text-[9px] font-black ${option.tone}`}>{option.label}</span>
                      <time className="text-[9px] font-bold text-slate-400">{formatDate(signal.createdAt)}</time>
                    </div>
                    <p className="mt-2 text-xs font-bold leading-relaxed text-slate-700">{signal.content}</p>
                  </article>
                )
              })}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
