'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SavedAiosMessage, SavedAiosProfile, SavedAiosProject, SavedAiosTask } from '@/lib/aios-store'

type LatestPlan = { rationale: string; model: string; createdAt: string } | null
type UsageState = {
  tier: string
  tierLabel: string
  used: number
  limit: number | null
  resetsAt: string
} | null
type ClientTask = SavedAiosTask & { toolUrl?: string }
type WorkspaceState = {
  projects: SavedAiosProject[]
  project: SavedAiosProject
  profile: SavedAiosProfile | null
  tasks: ClientTask[]
  messages: SavedAiosMessage[]
  latestPlan: LatestPlan
  aiEnabled: boolean
  usage: UsageState
}

const accentStyles: Record<string, string> = {
  indigo: 'from-indigo-500 to-sky-400',
  emerald: 'from-emerald-400 to-cyan-400',
  orange: 'from-orange-400 to-rose-400',
  rose: 'from-rose-400 to-fuchsia-400',
  sky: 'from-sky-400 to-indigo-400',
}

const suggestions = [
  'このプロジェクトで実現したいことを整理したい',
  '候補がいくつかあり、どれを優先すべきか迷っている',
  '今の状況から次の一歩を具体化したい',
]

function formatTime(iso: string) {
  return new Intl.DateTimeFormat('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(
    new Date(iso),
  )
}

function taskOrder(tasks: ClientTask[]) {
  return [...tasks].sort((a, b) => {
    const score = (task: ClientTask) => (task.status === 'doing' ? 0 : task.status === 'todo' ? 1 : task.status === 'done' ? 2 : 3)
    return score(a) - score(b) || b.impact - a.impact
  })
}

function UsageOverview({ usage }: { usage: UsageState }) {
  if (!usage) return null
  const reset = new Intl.DateTimeFormat('ja-JP', { month: '2-digit', day: '2-digit' }).format(new Date(usage.resetsAt))
  const pct = usage.limit ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0
  return (
    <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50/90 p-3">
      <div className="flex flex-wrap items-center gap-2 text-[10px] font-black">
        <span className="uppercase tracking-[0.16em] text-slate-400">AI Runs / 利用期間</span>
        <span className="rounded-full bg-slate-950 px-2 py-1 text-white">{usage.tierLabel}</span>
        <span className="rounded-full bg-white px-2 py-1 text-slate-600">{usage.limit === null ? '無制限' : `${usage.used} / ${usage.limit}`}</span>
        <span className="ml-auto text-slate-400">{reset} にリセット</span>
      </div>
      {usage.limit !== null && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400" style={{ width: `${Math.max(4, pct)}%` }} />
        </div>
      )}
    </div>
  )
}

export default function AiosWorkspace({ fallback }: { fallback: ReactNode }) {
  const { isLoaded, isSignedIn } = useUser()
  const [state, setState] = useState<WorkspaceState | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState('')
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function loadState(projectId?: string) {
    setLoading(true)
    setError('')
    try {
      const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : ''
      const response = await fetch(`/api/aios${query}`, { cache: 'no-store' })
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

  async function submit(action: string, payload: Record<string, unknown> = {}) {
    if (!state) return null
    const response = await fetch('/api/aios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, projectId: state.project.id, ...payload }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || '操作に失敗しました')
    return data
  }

  async function sendMessage(content = draft) {
    const text = content.trim()
    if (!text || !state) return
    setBusy(true)
    setError('')
    setDraft('')
    try {
      const data = await submit('chat', { content: text })
      if (data) setState((current) => (current ? { ...current, messages: data.messages, project: data.project, projects: data.projects } : current))
    } catch (caught) {
      setDraft(text)
      setError(caught instanceof Error ? caught.message : '送信に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  async function createProject() {
    const name = newName.trim()
    if (!name) return
    setBusy(true)
    try {
      const data = await submit('project', { name })
      if (data) setState(data)
      setNewName('')
      setCreating(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '作成に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  async function generateActions() {
    setBusy(true)
    setError('')
    try {
      const data = await submit('conversation-plan')
      if (data) setState((current) => (current ? { ...current, ...data } : current))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '行動案の生成に失敗しました')
    } finally {
      setBusy(false)
    }
  }

  async function changeStatus(id: string, status: SavedAiosTask['status']) {
    const response = await fetch(`/api/aios/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || '更新に失敗しました')
    setState((current) =>
      current ? { ...current, tasks: current.tasks.map((task) => (task.id === id ? data.task : task)) } : current,
    )
  }

  if (!isLoaded || (isSignedIn && loading && !state)) {
    return <div className="rounded-[28px] border border-white/80 bg-white/80 p-6 text-sm font-bold text-slate-500">ワークスペースを準備しています...</div>
  }
  if (!isSignedIn) return fallback
  if (!state) return <p className="rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error || '読み込みに失敗しました'}</p>

  const tasks = taskOrder(state.tasks)
  const activeTasks = tasks.filter((task) => task.status === 'todo' || task.status === 'doing')
  const doneCount = tasks.filter((task) => task.status === 'done').length
  const progress = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0
  const accent = accentStyles[state.project.accent] || accentStyles.indigo

  return (
    <div className="space-y-5">
      <section className="rounded-[30px] border border-white/80 bg-white/84 p-4 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className={`h-9 w-1.5 rounded-full bg-gradient-to-b ${accent}`} />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aincarn OS / Workspace</p>
            <h1 className="text-lg font-black tracking-tight text-slate-950">{state.project.name}</h1>
          </div>
          {!state.aiEnabled && <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black text-amber-700">ガイドモード</span>}
          <div className="ml-auto flex items-center gap-3">
            <Link href="/tools/aios/pricing" className="text-xs font-black text-slate-500 hover:text-slate-950">プラン</Link>
            <UserButton />
          </div>
        </div>
        <UsageOverview usage={state.usage} />
      </section>

      <section className="grid gap-4 lg:grid-cols-[250px_minmax(390px,1fr)_360px]">
        <aside className="rounded-[28px] border border-white/80 bg-white/84 p-4 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Projects</p>
            <button type="button" onClick={() => setCreating((value) => !value)} className="size-8 rounded-full bg-slate-950 text-xl font-light text-white">+</button>
          </div>
          {creating && (
            <div className="mt-4 rounded-2xl bg-slate-50 p-3">
              <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="プロジェクト名" className="w-full bg-transparent text-sm font-bold outline-none" />
              <button type="button" onClick={createProject} disabled={!newName.trim() || busy} className="mt-3 w-full rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white disabled:opacity-40">作成</button>
            </div>
          )}
          <nav className="mt-4 space-y-2">
            {state.projects.map((project) => (
              <button
                type="button"
                key={project.id}
                onClick={() => project.id !== state.project.id && loadState(project.id)}
                className={`w-full rounded-2xl border p-3 text-left transition ${project.id === state.project.id ? 'border-slate-950 bg-slate-950 text-white' : 'border-slate-100 bg-white text-slate-700 hover:border-slate-300'}`}
              >
                <span className={`mb-2 block h-1 w-10 rounded-full bg-gradient-to-r ${accentStyles[project.accent] || accentStyles.indigo}`} />
                <span className="block truncate text-sm font-black">{project.name}</span>
                <span className={`mt-1 block text-[10px] font-bold ${project.id === state.project.id ? 'text-white/55' : 'text-slate-400'}`}>
                  {project.id === state.project.id ? '開いています' : '切り替える'}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex min-h-[650px] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white/88 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
          <header className="border-b border-slate-100 p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Dialogue</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">考えを整理し、次の行動へ</h2>
            <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">迷っていることをそのまま話してください。Aincarnが問いを返し、十分に整理されたら行動案に変換します。</p>
          </header>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {!state.messages.length && (
              <div className="space-y-3">
                <div className="max-w-[90%] rounded-3xl rounded-tl-md bg-slate-950 p-4 text-sm font-bold leading-relaxed text-white">
                  まず、このプロジェクトで整理したいことを教えてください。結論が決まっていなくても大丈夫です。
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button key={suggestion} type="button" onClick={() => sendMessage(suggestion)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:border-slate-400">{suggestion}</button>
                  ))}
                </div>
              </div>
            )}
            {state.messages.map((chat) => (
              <div key={chat.id} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] rounded-3xl px-4 py-3 text-sm font-medium leading-relaxed ${chat.role === 'user' ? `bg-gradient-to-br ${accent} text-white` : 'rounded-tl-md bg-slate-100 text-slate-700'}`}>
                  {chat.role === 'assistant' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{chat.content}</ReactMarkdown>
                  ) : (
                    <p>{chat.content}</p>
                  )}
                  <p className={`mt-2 text-[10px] font-bold ${chat.role === 'user' ? 'text-white/65' : 'text-slate-400'}`}>{formatTime(chat.createdAt)}</p>
                </div>
              </div>
            ))}
            {busy && <p className="text-xs font-bold text-slate-400">Aincarnが整理しています...</p>}
          </div>
          <footer className="border-t border-slate-100 p-4">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} placeholder="考えていること、迷っている選択肢、制約を書いてください" className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-sky-300 focus:bg-white" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button type="button" onClick={generateActions} disabled={busy || state.messages.length === 0} className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-700 disabled:opacity-40">行動案を作る</button>
              <button type="button" onClick={() => sendMessage()} disabled={busy || !draft.trim()} className={`rounded-full bg-gradient-to-r ${accent} px-5 py-2.5 text-sm font-black text-white shadow-lg disabled:opacity-40`}>送信</button>
            </div>
          </footer>
        </main>

        <aside className="space-y-4">
          <section className="grid grid-cols-3 gap-2">
            {[['進捗', `${progress}%`], ['進行中', `${activeTasks.length}`], ['完了', `${doneCount}`]].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/80 bg-white/88 p-3 text-center shadow-sm">
                <p className="text-[10px] font-black text-slate-400">{label}</p>
                <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
              </div>
            ))}
          </section>
          {state.profile && (
            <section className="rounded-[26px] border border-white/80 bg-white/84 p-4 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Memory</p>
              <p className="mt-2 text-sm font-black text-slate-950">{state.profile.goal}</p>
              <p className="mt-2 line-clamp-3 text-xs font-bold leading-relaxed text-slate-500">{state.profile.currentState || '対話を続けると、判断に必要な背景がここへ集約されます。'}</p>
            </section>
          )}
          <section className="rounded-[26px] border border-white/80 bg-white/88 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Next Actions</p>
              {state.latestPlan && <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">{state.latestPlan.model}</span>}
            </div>
            {!tasks.length ? (
              <p className="mt-4 rounded-2xl border border-dashed border-slate-200 p-4 text-xs font-bold leading-relaxed text-slate-500">会話のあとに「行動案を作る」を押すと、ここへ具体的な手順が並びます。</p>
            ) : (
              <div className="mt-4 space-y-3">
                {tasks.slice(0, 4).map((task, index) => (
                  <article key={task.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-start gap-2">
                      <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-black text-white">{index + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900">{task.title}</p>
                        <p className="mt-1 text-xs font-bold leading-relaxed text-slate-500">{task.reason}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {task.status !== 'done' && <button type="button" onClick={() => changeStatus(task.id, 'done')} className="rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-black text-white">完了</button>}
                      {task.status === 'done' && <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-[11px] font-black text-emerald-700">完了済み</span>}
                      {task.recommendedTool && <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-slate-500">{task.recommendedTool}</span>}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
          {error && <p className="rounded-2xl border border-rose-100 bg-rose-50 p-3 text-xs font-bold text-rose-700">{error}</p>}
        </aside>
      </section>
    </div>
  )
}
