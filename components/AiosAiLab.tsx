'use client'

import { UserButton } from '@clerk/nextjs'
import { useMemo, useState, type CSSProperties } from 'react'
import type { GeneratedFuturePath } from '@/lib/aios-ai'
import type { AiosSignalKind } from '@/lib/aios-store'

type LabSignal = {
  id: string
  kind: AiosSignalKind
  content: string
  createdAt: string
}

type LabResult = {
  path: GeneratedFuturePath
  modelRequested: string
  persisted: false
  signalCount: number
}

const signalOptions: Array<{
  kind: AiosSignalKind
  label: string
  prompt: string
  node: string
  tone: string
  selectedTone: string
  idleTone: string
  meaning: string
}> = [
  { kind: 'goal', label: '目標', prompt: '選択肢として考えている未来', node: 'dna-node-goal', tone: 'text-indigo-700 bg-indigo-50', selectedTone: 'border-indigo-300/70 bg-indigo-400/30 text-indigo-50 shadow-sm shadow-indigo-400/20', idleTone: 'border-indigo-300/20 bg-indigo-400/10 text-indigo-100/80', meaning: '向かう未来の候補。選択されると行動設計の基準になります。' },
  { kind: 'action', label: '行動', prompt: '今日取り組んだこと', node: 'dna-node-action', tone: 'text-amber-700 bg-amber-50', selectedTone: 'border-amber-300/70 bg-amber-400/30 text-amber-50 shadow-sm shadow-amber-400/20', idleTone: 'border-amber-300/20 bg-amber-400/10 text-amber-100/80', meaning: '実際に動いた証跡。次に現実的な一手を組み直す材料です。' },
  { kind: 'achievement', label: '実績', prompt: '形になった成果', node: 'dna-node-achievement', tone: 'text-emerald-700 bg-emerald-50', selectedTone: 'border-emerald-300/70 bg-emerald-400/30 text-emerald-50 shadow-sm shadow-emerald-400/20', idleTone: 'border-emerald-300/20 bg-emerald-400/10 text-emerald-100/80', meaning: '現実化した結果。継続すべき選択と強みを示します。' },
  { kind: 'interest', label: '興味', prompt: 'いま惹かれているテーマ', node: 'dna-node-interest', tone: 'text-sky-700 bg-sky-50', selectedTone: 'border-sky-300/70 bg-sky-400/30 text-sky-50 shadow-sm shadow-sky-400/20', idleTone: 'border-sky-300/20 bg-sky-400/10 text-sky-100/80', meaning: '心が向いた方向。長く続けられるテーマの兆しになります。' },
  { kind: 'insight', label: '気づき', prompt: '迷い、判断材料、制約', node: 'dna-node-insight', tone: 'text-rose-700 bg-rose-50', selectedTone: 'border-rose-300/70 bg-rose-400/30 text-rose-50 shadow-sm shadow-rose-400/20', idleTone: 'border-rose-300/20 bg-rose-400/10 text-rose-100/80', meaning: '選択の背景にある認識。将来の判断を補正します。' },
]

function dnaHash(input: string) {
  let hash = 0
  for (let index = 0; index < input.length; index += 1) hash = (hash * 31 + input.charCodeAt(index)) % 10007
  return hash
}

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))
}

function DnaParticle({ signal, index, onSelect }: { signal: LabSignal; index: number; onSelect: (signal: LabSignal) => void }) {
  const option = signalOptions.find((item) => item.kind === signal.kind) || signalOptions[0]
  const seed = dnaHash(signal.id + signal.content)
  const style = {
    '--dna-left': `${8 + ((seed + index * 17) % 53)}%`,
    '--dna-top': `${39 + ((seed * 3 + index * 19) % 48)}%`,
    '--dna-duration': `${6 + (seed % 6)}s`,
    '--dna-delay': `${-(seed % 9)}s`,
  } as CSSProperties

  return (
    <button type="button" style={style} onClick={() => onSelect(signal)} className={`dna-node ${option.node}`} title={`${option.label}: ${signal.content}`} aria-label={`${option.label}の記録を開く: ${signal.content}`}>
      <span className="dna-node-kind">{option.label}</span>
      <span className="dna-node-value">{signal.content}</span>
    </button>
  )
}

function usd(value: number | null) {
  if (value === null) return '-'
  if (value < 0.001) return `$${value.toFixed(6)}`
  return `$${value.toFixed(4)}`
}

export default function AiosAiLab() {
  const [signals, setSignals] = useState<LabSignal[]>([])
  const [signalKind, setSignalKind] = useState<AiosSignalKind>('goal')
  const [signalDraft, setSignalDraft] = useState('')
  const [future, setFuture] = useState('')
  const [result, setResult] = useState<LabResult | null>(null)
  const [selectedMove, setSelectedMove] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('入力した断片と生成結果は保存されません。')
  const [overlay, setOverlay] = useState<'archive' | 'evaluation' | 'step' | null>(null)
  const [selectedSignal, setSelectedSignal] = useState<LabSignal | null>(null)

  const selectedOption = signalOptions.find((item) => item.kind === signalKind) || signalOptions[0]
  const totals = useMemo(
    () => signalOptions.map((option) => ({ ...option, count: signals.filter((signal) => signal.kind === option.kind).length })),
    [signals],
  )
  const goals = signals.filter((signal) => signal.kind === 'goal')
  const move = result?.path.moves[selectedMove]

  function addSignal() {
    const content = signalDraft.trim()
    if (!content) return
    setSignals((current) => [
      { id: `lab-${signalKind}-${Date.now()}`, kind: signalKind, content: content.slice(0, 48), createdAt: new Date().toISOString() },
      ...current,
    ].slice(0, 20))
    setSignalDraft('')
    setNotice(
      signalKind === 'goal'
        ? '目標候補を浮かべました。Chosen Futureとして選ぶまで、未来は確定しません。'
        : 'このセッションのDigital DNAに断片を浮かべました。保存はされません。',
    )
  }

  function chooseFuture(signal: LabSignal) {
    setFuture(signal.content)
    setResult(null)
    setSelectedMove(0)
    setError('')
    setNotice('この目標をChosen Futureとして選びました。AIは未来を変えず、次の3手だけを設計します。')
  }

  async function generatePath() {
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
      setSelectedMove(0)
      setOverlay('step')
      setNotice('Chosen Futureは変えずに、Digital DNAをもとに次の3手を描きました。')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '生成に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  function inspectSignal(signal: LabSignal) {
    setSelectedSignal(signal)
    setOverlay('archive')
  }

  return (
    <div className="aios-workspace flex h-full min-h-0 flex-col gap-3">
      <header className="flex shrink-0 items-center gap-3 rounded-[26px] border border-white/80 bg-white/84 px-4 py-3 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
        <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-black text-white">AI</div>
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">Private AI Development / Not Saved</p>
          <h1 className="text-base font-black tracking-tight text-slate-950">あなたのDigital DNA</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => setOverlay('archive')} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-600 transition hover:border-slate-400">
            記録
          </button>
          <button type="button" onClick={() => setOverlay('evaluation')} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black text-slate-600 transition hover:border-slate-400">
            AI評価
          </button>
          <span className="rounded-full bg-slate-950 px-3 py-2 text-[10px] font-black text-white">INTERNAL LAB</span>
        </div>
        <UserButton />
      </header>

      <div className="min-h-0 flex-1">
        <main className="dna-stage relative h-full min-h-[760px] overflow-hidden rounded-[32px] border border-white/10 shadow-xl shadow-slate-950/10 lg:min-h-0">
          <div className="dna-orbit dna-orbit-a" />
          <div className="dna-orbit dna-orbit-b" />
          <div className="dna-strand dna-strand-a" />
          <div className="dna-strand dna-strand-b" />
          {signals.map((signal, index) => <DnaParticle key={signal.id} signal={signal} index={index} onSelect={inspectSignal} />)}

          <section className="dna-capture absolute left-4 top-4 z-20 w-[min(380px,calc(100%-2rem))] rounded-[24px] border border-white/14 bg-slate-950/55 p-4 text-white backdrop-blur-xl">
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/45">Digital DNA / Session Only</p>
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
                onKeyDown={(event) => event.key === 'Enter' && addSignal()}
                placeholder={selectedOption.prompt}
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-2.5 text-xs font-bold text-white outline-none placeholder:text-white/32 focus:border-cyan-300/60"
              />
              <button type="button" onClick={addSignal} disabled={!signalDraft.trim()} className="rounded-xl bg-white px-3 text-xs font-black text-slate-950 disabled:opacity-35">
                浮かべる
              </button>
            </div>
            {goals.length > 0 && (
              <div className="mt-3 border-t border-white/10 pt-3">
                <p className="mb-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/42">Chosen Futureに選ぶ</p>
                <div className="flex flex-wrap gap-1.5">
                  {goals.map((goal) => {
                    const chosen = future === goal.content
                    return (
                      <button
                        key={goal.id}
                        type="button"
                        onClick={() => chooseFuture(goal)}
                        disabled={chosen}
                        className={`max-w-full truncate rounded-full px-3 py-1.5 text-[10px] font-black ring-1 ring-inset ${
                          chosen ? 'bg-indigo-400/38 text-white ring-indigo-200/55' : 'bg-white/[0.07] text-white/72 ring-white/12'
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

          {future ? (
            <section className="future-beacon absolute right-[5%] top-[8%] z-20 w-[min(330px,43%)] rounded-[26px] border border-indigo-200/28 bg-white/[0.1] p-4 text-white backdrop-blur-xl">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-cyan-200">Chosen Future</p>
              <p className="mt-2 text-sm font-black leading-relaxed text-white">{future}</p>
              <p className="mt-2 text-[10px] font-bold leading-relaxed text-white/50">未来を選ぶのはユーザーです。AIは次の手だけを設計します。</p>
              <button
                type="button"
                onClick={generatePath}
                disabled={busy}
                className="mt-3 rounded-full bg-white px-3 py-2 text-[10px] font-black text-slate-950 disabled:opacity-40"
              >
                {busy ? '描いています...' : result ? '次の3手を再設計' : '最初の3手を描く'}
              </button>
            </section>
          ) : (
            <section className="absolute right-[5%] top-[8%] z-20 w-[min(330px,43%)] rounded-[26px] border border-dashed border-white/18 bg-white/[0.04] p-4 text-white/62 backdrop-blur-xl">
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white/35">Chosen Future</p>
              <p className="mt-3 text-sm font-bold leading-relaxed">目標のDNAを浮かべ、その中から向かう未来を選んでください。</p>
            </section>
          )}

          {result && (
            <div className="path-constellation">
              <div className="path-beam" />
              {result.path.moves.map((pathMove, index) => (
                <button
                  key={`${pathMove.title}-${index}`}
                  type="button"
                  onClick={() => {
                    setSelectedMove(index)
                    setOverlay('step')
                  }}
                  className={`path-orb path-orb-${index + 1} ${selectedMove === index ? 'path-orb-active' : ''}`}
                >
                  <span>{index + 1}</span>
                  <strong>{pathMove.title}</strong>
                </button>
              ))}
            </div>
          )}

          <div className="absolute bottom-4 left-4 z-20 flex flex-wrap gap-1.5">
            {totals.map((signal) => (
              <span key={signal.kind} className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-[10px] font-black text-white/60">
                {signal.label} <strong className="ml-1 text-white">{signal.count}</strong>
              </span>
            ))}
          </div>
          {notice && <p className="absolute bottom-4 right-4 z-20 max-w-[360px] rounded-full border border-white/10 bg-slate-950/42 px-4 py-2 text-[10px] font-bold text-emerald-200 backdrop-blur-xl">{notice}</p>}
          {error && <p className="absolute bottom-16 right-4 z-20 max-w-[360px] rounded-2xl bg-rose-100 px-4 py-3 text-[11px] font-bold text-rose-700">{error}</p>}

          {overlay && (
            <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/46 p-5 backdrop-blur-sm" role="presentation" onClick={() => setOverlay(null)}>
              <section
                role="dialog"
                aria-modal="true"
                className="max-h-[min(680px,calc(100%-2rem))] w-full max-w-[560px] overflow-y-auto rounded-[30px] border border-white/90 bg-white/96 p-5 text-slate-950 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-400">
                      {overlay === 'archive' ? 'DNA Archive' : overlay === 'evaluation' ? 'AI Evaluation' : 'Next Step'}
                    </p>
                    <h2 className="mt-2 text-xl font-black tracking-tight">
                      {overlay === 'archive' ? 'これまで残した断片' : overlay === 'evaluation' ? '生成の観測結果' : '道しるべの詳細'}
                    </h2>
                  </div>
                  <button type="button" onClick={() => setOverlay(null)} className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-500" aria-label="閉じる">
                    x
                  </button>
                </div>

                {overlay === 'archive' && (
                  <ArchivePanel signals={signals} selectedSignal={selectedSignal} onSelect={setSelectedSignal} />
                )}
                {overlay === 'evaluation' && (
                  <EvaluationPanel result={result} signalCount={signals.length} />
                )}
                {overlay === 'step' && (
                  <StepPanel move={move} moveIndex={selectedMove} result={result} />
                )}
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function LabMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3">
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-[11px] font-black text-slate-700">{value}</p>
    </div>
  )
}

function ArchivePanel({
  signals,
  selectedSignal,
  onSelect,
}: {
  signals: LabSignal[]
  selectedSignal: LabSignal | null
  onSelect: (signal: LabSignal) => void
}) {
  const focus = selectedSignal || signals[0] || null
  const option = focus ? signalOptions.find((item) => item.kind === focus.kind) || signalOptions[0] : null

  if (!focus || !option) {
    return <p className="mt-5 rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-bold text-slate-400">まだ記録されたDNAはありません。</p>
  }

  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-[190px_1fr]">
      <div className="max-h-[370px] space-y-2 overflow-y-auto pr-1">
        {signals.map((signal) => {
          const signalOption = signalOptions.find((item) => item.kind === signal.kind) || signalOptions[0]
          return (
            <button key={signal.id} type="button" onClick={() => onSelect(signal)} className={`w-full rounded-2xl border p-3 text-left transition ${signal.id === focus.id ? 'border-slate-300 bg-slate-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
              <span className={`rounded-full px-2 py-1 text-[9px] font-black ${signalOption.tone}`}>{signalOption.label}</span>
              <p className="mt-2 truncate text-xs font-black text-slate-700">{signal.content}</p>
              <time className="mt-1 block text-[9px] font-bold text-slate-400">{formatTime(signal.createdAt)}</time>
            </button>
          )
        })}
      </div>
      <div className="rounded-2xl bg-slate-950 p-4 text-white">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${option.tone}`}>{option.label}</span>
        <h3 className="mt-4 text-lg font-black leading-relaxed">{focus.content}</h3>
        <time className="mt-2 block text-[10px] font-bold text-white/40">{formatTime(focus.createdAt)}</time>
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/38">Meaning</p>
          <p className="mt-2 text-xs font-bold leading-relaxed text-white/72">{option.meaning}</p>
        </div>
        {focus.kind === 'goal' && <p className="mt-4 rounded-xl bg-indigo-400/16 p-3 text-[11px] font-bold leading-relaxed text-indigo-100">この断片は、Chosen Futureの候補として選択できます。</p>}
      </div>
    </div>
  )
}

function EvaluationPanel({ result, signalCount }: { result: LabResult | null; signalCount: number }) {
  if (!result) {
    return <p className="mt-5 rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-bold text-slate-400">道しるべを生成すると、モデル・利用量・経路設計の理由がここに現れます。</p>
  }

  return (
    <div className="mt-5 space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <LabMetric label="Model" value={result.path.model} />
        <LabMetric label="Tokens" value={result.path.usage ? `${result.path.usage.inputTokens} / ${result.path.usage.outputTokens}` : '-'} />
        <LabMetric label="Cost" value={result.path.usage ? usd(result.path.usage.estimatedUsd) : '-'} />
      </div>
      <div className="rounded-2xl bg-slate-950 p-4 text-white">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/45">Why This Route</p>
        <p className="mt-2 text-sm font-bold leading-relaxed text-white/78">{result.path.rationale}</p>
      </div>
      <p className="text-[10px] font-bold text-slate-400">参照したDNA: {signalCount}件 / 検証結果は保存されません。</p>
    </div>
  )
}

function StepPanel({
  move,
  moveIndex,
  result,
}: {
  move: GeneratedFuturePath['moves'][number] | undefined
  moveIndex: number
  result: LabResult | null
}) {
  if (!move || !result) {
    return <p className="mt-5 rounded-2xl border border-dashed border-slate-200 p-5 text-sm font-bold text-slate-400">Chosen Futureから道しるべを生成すると、行動の詳細を確認できます。</p>
  }

  return (
    <div className="mt-5">
      <div className="flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">{moveIndex + 1}</span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black text-slate-500">
          {moveIndex === 0 ? 'NOW' : moveIndex === 1 ? 'NEXT' : 'EMERGING'}
        </span>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-700">NOT SAVED</span>
      </div>
      <h3 className="mt-4 text-2xl font-black leading-relaxed">{move.title}</h3>
      <p className="mt-3 text-sm font-bold leading-relaxed text-slate-600">{move.reason}</p>
      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <p className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Path Rationale</p>
        <p className="mt-2 text-xs font-bold leading-relaxed text-slate-600">{result.path.rationale}</p>
      </div>
    </div>
  )
}
