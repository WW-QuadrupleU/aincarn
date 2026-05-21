'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { useEffect, useMemo, useState } from 'react'
import type { SavedAiosProfile, SavedAiosTask } from '@/lib/aios-store'

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

const defaultProfile = {
  goal: '',
  horizon: '90日',
  currentState: '',
  values: '',
  constraints: '',
}

const statusLabels: Record<SavedAiosTask['status'], string> = {
  todo: '未着手',
  doing: '実行中',
  done: '完了',
  skipped: '保留',
}

const routerModels = [
  ['Deep thinking', 'GPT / Claude 系の高知能モデル', '目標分解・意思決定'],
  ['Research', '検索・リサーチ特化AI', '根拠確認・比較調査'],
  ['Execution', 'コーディング/制作向けAI', '成果物作成・実装'],
]

function sortTasks(tasks: SavedAiosTask[]) {
  return [...tasks].sort((a, b) => {
    const statusScore = (task: SavedAiosTask) => (task.status === 'doing' ? 0 : task.status === 'todo' ? 1 : task.status === 'done' ? 2 : 3)
    return statusScore(a) - statusScore(b) || b.impact - a.impact || a.effort - b.effort
  })
}

function nextAction(tasks: SavedAiosTask[]) {
  return sortTasks(tasks).find((task) => task.status === 'doing' || task.status === 'todo')
}

export default function AiosMvp() {
  if (!clerkEnabled) return <AiosUnavailable />
  return <AuthenticatedAiosMvp />
}

function AiosUnavailable() {
  return (
    <section className="rounded-[32px] border border-white/80 bg-white/86 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Aincarn OS Test</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Aincarn OS</h1>
      <p className="mt-3 text-sm font-bold leading-relaxed text-slate-600">
        ログインとデータベース設定後に、目標・行動・実績の保存テストを利用できます。
      </p>
    </section>
  )
}

function AiosSignInPrompt() {
  return (
    <section className="overflow-hidden rounded-[36px] border border-white/80 bg-white/86 shadow-xl shadow-slate-950/8 backdrop-blur-xl">
      <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Aincarn OS Test</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            もう、どのAIを使うかで迷わない。
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-bold leading-relaxed text-slate-600">
            Aincarnが最適なAIを選び、あなたの代わりに考え、整理し、前に進めます。
            まずはテスト環境で、目標から今日の行動までを可視化します。
          </p>
          <SignInButton mode="modal">
            <button
              type="button"
              className="mt-7 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              ログインして試す
            </button>
          </SignInButton>
        </div>
        <DecisionPanel />
      </div>
    </section>
  )
}

function DecisionPanel() {
  return (
    <div className="bg-slate-950 p-5 text-white sm:p-6">
      <div className="mb-5 h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-rose-300" />
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Aincarn Kernel</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight">記憶はAincarnに、知能は最適AIに。</h2>
      <div className="mt-6 grid gap-3">
        {routerModels.map(([label, model, role], index) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">{label}</p>
                <p className="mt-1 text-sm font-black text-white">{model}</p>
                <p className="mt-1 text-xs font-bold text-white/55">{role}</p>
              </div>
              <div className="h-2 w-20 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-cyan-300"
                  style={{ width: `${88 - index * 15}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AuthenticatedAiosMvp() {
  const { isLoaded, isSignedIn } = useUser()
  const [profile, setProfile] = useState(defaultProfile)
  const [savedProfile, setSavedProfile] = useState<SavedAiosProfile | null>(null)
  const [tasks, setTasks] = useState<SavedAiosTask[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const activeTasks = tasks.filter((task) => task.status === 'todo' || task.status === 'doing')
  const doneTasks = tasks.filter((task) => task.status === 'done')
  const todayTasks = sortTasks(activeTasks).slice(0, 3)
  const recommended = nextAction(tasks)

  const progress = useMemo(() => {
    if (!tasks.length) return 0
    return Math.round((doneTasks.length / tasks.length) * 100)
  }, [doneTasks.length, tasks.length])

  async function loadState() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/aios', { cache: 'no-store' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '読み込みに失敗しました')
      setSavedProfile(data.profile)
      if (data.profile) {
        setProfile({
          goal: data.profile.goal || '',
          horizon: data.profile.horizon || '90日',
          currentState: data.profile.currentState || '',
          values: data.profile.values || '',
          constraints: data.profile.constraints || '',
        })
      }
      setTasks(data.tasks || [])
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) loadState()
  }, [isLoaded, isSignedIn])

  async function saveProfile() {
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/aios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'profile', profile }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '保存に失敗しました')
      setSavedProfile(data.profile)
      setTasks(data.tasks || [])
      setMessage('Aincarn Memoryを更新しました')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function updateTask(id: string, status: SavedAiosTask['status']) {
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`/api/aios/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '更新に失敗しました')
      setTasks((current) => current.map((task) => (task.id === id ? data.task : task)))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '更新に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded) {
    return <div className="rounded-[28px] border border-white/80 bg-white/86 p-6 text-sm font-bold text-slate-500">アカウント情報を確認しています...</div>
  }

  if (!isSignedIn) return <AiosSignInPrompt />

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-white/80 bg-white/86 shadow-xl shadow-slate-950/8 backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <p className="rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Aincarn OS Test
              </p>
              <UserButton />
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
              もう、どのAIを使うかで迷わない。
            </h1>
            <p className="mt-5 max-w-3xl text-sm font-bold leading-relaxed text-slate-600">
              Aincarnが最適なAIを選び、あなたの代わりに考え、整理し、前に進めます。
              記憶はモデルから分離し、目標・判断・行動・実績をAincarn側に残します。
            </p>
          </div>
          <DecisionPanel />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[390px_1fr]">
        <div className="rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Aincarn Memory</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">目標を保存する</h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-black text-slate-500">目指すもの</span>
              <textarea
                value={profile.goal}
                onChange={(event) => setProfile((current) => ({ ...current, goal: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                placeholder="例: AIを使って個人事業の売上を3か月で伸ばしたい"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-500">期間</span>
              <input
                value={profile.horizon}
                onChange={(event) => setProfile((current) => ({ ...current, horizon: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-500">現状</span>
              <textarea
                value={profile.currentState}
                onChange={(event) => setProfile((current) => ({ ...current, currentState: event.target.value }))}
                rows={3}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                placeholder="今できていること、詰まっていること"
              />
            </label>
            <button
              type="button"
              disabled={saving}
              onClick={saveProfile}
              className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Aincarn Memoryを更新
            </button>
            {message && <p className="text-xs font-bold text-slate-500">{message}</p>}
          </div>
        </div>

        <div className="grid gap-4">
          <section className="grid gap-3 md:grid-cols-3">
            {[
              ['進捗', `${progress}%`, '完了タスク比率'],
              ['今日の候補', `${todayTasks.length}件`, '優先度順'],
              ['実績', `${doneTasks.length}件`, '積み上げ'],
            ].map(([label, value, caption]) => (
              <article key={label} className="rounded-2xl border border-white/80 bg-white/86 p-4 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{caption}</p>
              </article>
            ))}
          </section>

          <section className="rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Today</p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">今日やるべき3つ</h2>
              </div>
              {loading && <span className="text-xs font-bold text-slate-400">読み込み中...</span>}
            </div>
            <div className="mt-5 grid gap-3">
              {!todayTasks.length && (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm font-bold text-slate-500">
                  目標を保存すると、最初の行動候補が作られます。
                </p>
              )}
              {todayTasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} saving={saving} onUpdate={updateTask} />
              ))}
            </div>
          </section>

          <section className="rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Decision</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Aincarnの次の判断</h2>
            <div className="mt-4 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">Recommended next move</p>
              <p className="mt-2 text-xl font-black">{recommended?.title || 'まず目標を保存してください'}</p>
              <p className="mt-3 text-sm font-bold leading-relaxed text-white/70">
                {recommended?.reason || 'Aincarn Memoryに目標を入れると、目標から逆算した初期タスクを作成します。'}
              </p>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

function TaskCard({
  task,
  index,
  saving,
  onUpdate,
}: {
  task: SavedAiosTask
  index: number
  saving: boolean
  onUpdate: (id: string, status: SavedAiosTask['status']) => void
}) {
  return (
    <article className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-950/5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 text-xs font-black text-white">
              {index + 1}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{task.domain}</span>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-200">
              {statusLabels[task.status]}
            </span>
          </div>
          <h3 className="mt-3 text-lg font-black text-slate-950">{task.title}</h3>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">{task.reason}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={saving || task.status === 'doing'}
            onClick={() => onUpdate(task.id, 'doing')}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:border-sky-300 disabled:opacity-40"
          >
            着手
          </button>
          <button
            type="button"
            disabled={saving || task.status === 'done'}
            onClick={() => onUpdate(task.id, 'done')}
            className="rounded-full bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:bg-slate-800 disabled:opacity-40"
          >
            完了
          </button>
        </div>
      </div>
    </article>
  )
}
