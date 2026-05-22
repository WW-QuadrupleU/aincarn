'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { SavedAiosProfile, SavedAiosTask } from '@/lib/aios-store'

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

type LatestPlan = {
  rationale: string
  model: string
  createdAt: string
} | null

type UsageState = {
  tier: string
  tierLabel: string
  tierDescription?: string
  used: number
  limit: number | null
  resetsAt: string
} | null

type ClientTask = SavedAiosTask & { toolUrl?: string }

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

const TOOL_FALLBACK_URLS: Record<string, string> = {
  ChatGPT: 'https://chatgpt.com/',
  Claude: 'https://claude.ai/new',
  Gemini: 'https://gemini.google.com/app',
  Perplexity: 'https://www.perplexity.ai/',
  'GitHub Copilot': 'https://github.com/copilot',
  Cursor: 'https://cursor.com/',
  Midjourney: 'https://www.midjourney.com/explore',
  Runway: 'https://app.runwayml.com/',
  NotebookLM: 'https://notebooklm.google.com/',
}

const TOOL_PALETTE: Record<string, { bg: string; ink: string }> = {
  ChatGPT: { bg: 'linear-gradient(135deg,#15f5ba,#39a7ff)', ink: '#fff' },
  Claude: { bg: 'linear-gradient(135deg,#ff9a3c,#ff5f6d)', ink: '#fff' },
  Gemini: { bg: 'linear-gradient(135deg,#30d5ff,#7b61ff)', ink: '#fff' },
  Perplexity: { bg: 'linear-gradient(135deg,#00e5ff,#00c48c)', ink: '#0f172a' },
  'GitHub Copilot': { bg: 'linear-gradient(135deg,#1f2937,#6d28d9)', ink: '#fff' },
  Cursor: { bg: 'linear-gradient(135deg,#0ea5e9,#f97316)', ink: '#fff' },
  Midjourney: { bg: 'linear-gradient(135deg,#ff47a3,#ffcc00)', ink: '#0f172a' },
  Runway: { bg: 'linear-gradient(135deg,#b6ff00,#00d5ff)', ink: '#0f172a' },
  NotebookLM: { bg: 'linear-gradient(135deg,#fef08a,#22c55e)', ink: '#0f172a' },
}

function getToolBadge(tool?: string) {
  if (!tool) return { bg: 'linear-gradient(135deg,#64748b,#0f172a)', ink: '#fff' }
  return TOOL_PALETTE[tool] || { bg: 'linear-gradient(135deg,#64748b,#0f172a)', ink: '#fff' }
}

function sortTasks(tasks: ClientTask[]) {
  return [...tasks].sort((a, b) => {
    const statusScore = (task: ClientTask) =>
      task.status === 'doing' ? 0 : task.status === 'todo' ? 1 : task.status === 'done' ? 2 : 3
    return statusScore(a) - statusScore(b) || b.impact - a.impact || a.effort - b.effort
  })
}

function nextAction(tasks: ClientTask[]) {
  return sortTasks(tasks).find((task) => task.status === 'doing' || task.status === 'todo')
}

function formatDateTime(iso?: string) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
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
            目標を入れると、最適なAIが動き出す。
          </h1>
          <p className="mt-5 max-w-2xl text-sm font-bold leading-relaxed text-slate-600">
            Aincarn OSは、あなたの目標から逆算してタスクを作り、各タスクに最適なAI（Claude / ChatGPT / Gemini / Perplexity ほか）と
            そのまま貼り付けられるプロンプトを割り当てます。AIを使い分けるストレスを、Aincarn側に持ちます。
          </p>
          <ul className="mt-6 grid gap-2 text-sm font-bold text-slate-700">
            <li>・目標 → 5〜7個の具体タスクをAIが生成</li>
            <li>・各タスクに最適AIと使用プロンプトを同梱</li>
            <li>・ワンクリックでAIを開く＋プロンプトをコピー</li>
            <li>・進捗・実績はAincarn Memoryに残る</li>
          </ul>
          <SignInButton mode="modal">
            <button
              type="button"
              className="mt-7 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              ログインして試す
            </button>
          </SignInButton>
        </div>
        <RouterPanel />
      </div>
    </section>
  )
}

function UsageMeter({ usage }: { usage: UsageState }) {
  if (!usage) return null
  const limit = usage.limit
  const used = usage.used
  const isUnlimited = limit === null
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100))
  const reset = new Date(usage.resetsAt)
  const resetLabel = isNaN(reset.getTime())
    ? ''
    : new Intl.DateTimeFormat('ja-JP', { month: '2-digit', day: '2-digit' }).format(reset)
  const isOver = !isUnlimited && used >= (limit || 0)
  return (
    <div className="mt-5 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm shadow-slate-950/5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">AI Runs (今月)</p>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-black text-white">
          {usage.tierLabel}
        </span>
        {isUnlimited ? (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-700">
            無制限
          </span>
        ) : (
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
              isOver ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {used} / {limit}
          </span>
        )}
        {resetLabel && (
          <span className="ml-auto text-[10px] font-bold text-slate-400">{resetLabel} にリセット</span>
        )}
      </div>
      {!isUnlimited && (
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${isOver ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-sky-400'}`}
            style={{ width: `${Math.max(pct, 4)}%` }}
          />
        </div>
      )}
      {isOver && (
        <p className="mt-3 text-xs font-bold leading-relaxed text-rose-600">
          今月の枠を使い切りました。プランをアップグレードすると上限が増えます。
        </p>
      )}
      {!isOver && !isUnlimited && (
        <p className="mt-3 text-[11px] font-bold leading-relaxed text-slate-500">
          1回のAI実行 = タスクのプロンプトをAincarn内で代理実行する操作。プラン生成や状態の保存は枠を消費しません。
        </p>
      )}
    </div>
  )
}

function RouterPanel() {
  const previews: Array<[string, string, string]> = [
    ['Strategy', 'Claude', '目標分解 / 意思決定'],
    ['Research', 'Perplexity', '出典付き調査'],
    ['Build', 'Cursor', 'コード実装'],
    ['Create', 'Midjourney', 'デザイン素材'],
  ]
  return (
    <div className="bg-slate-950 p-5 text-white sm:p-6">
      <div className="mb-5 h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-rose-300" />
      <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Aincarn Router</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight">記憶はAincarnに、知能は最適AIに。</h2>
      <div className="mt-6 grid gap-3">
        {previews.map(([role, tool, desc]) => {
          const badge = getToolBadge(tool)
          return (
            <div key={role} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">{role}</p>
                  <p className="mt-1 truncate text-sm font-black text-white">{desc}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-[11px] font-black"
                  style={{ background: badge.bg, color: badge.ink }}
                >
                  {tool}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AuthenticatedAiosMvp() {
  const { isLoaded, isSignedIn } = useUser()
  const [profile, setProfile] = useState(defaultProfile)
  const [savedProfile, setSavedProfile] = useState<SavedAiosProfile | null>(null)
  const [tasks, setTasks] = useState<ClientTask[]>([])
  const [latestPlan, setLatestPlan] = useState<LatestPlan>(null)
  const [usage, setUsage] = useState<UsageState>(null)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
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
      setLatestPlan(data.latestPlan || null)
      setUsage(data.usage || null)
      setAiEnabled(Boolean(data.aiEnabled))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '読み込みに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) loadState()
  }, [isLoaded, isSignedIn])

  async function callProfileAction(action: 'profile' | 'regenerate') {
    if (action === 'regenerate') setGenerating(true)
    else setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/aios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, profile }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '保存に失敗しました')
      setSavedProfile(data.profile)
      setTasks(data.tasks || [])
      setLatestPlan(data.latestPlan || null)
      setUsage(data.usage || null)
      setAiEnabled(Boolean(data.aiEnabled))
      setMessage(
        action === 'regenerate'
          ? 'AIが新しいプランを生成しました'
          : data.tasks?.length
            ? 'Aincarn Memoryを更新し、AIプランを生成しました'
            : 'Aincarn Memoryを更新しました',
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存に失敗しました')
    } finally {
      setSaving(false)
      setGenerating(false)
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

  async function deleteTask(id: string) {
    if (!confirm('このタスクを削除しますか？')) return
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`/api/aios/tasks/${id}`, { method: 'DELETE' })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || '削除に失敗しました')
      }
      setTasks((current) => current.filter((task) => task.id !== id))
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '削除に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="rounded-[28px] border border-white/80 bg-white/86 p-6 text-sm font-bold text-slate-500">
        アカウント情報を確認しています...
      </div>
    )
  }

  if (!isSignedIn) return <AiosSignInPrompt />

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-white/80 bg-white/86 shadow-xl shadow-slate-950/8 backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[1fr_420px]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <p className="rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Aincarn OS · Test
              </p>
              <UserButton />
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
              目標を入れると、最適なAIが動き出す。
            </h1>
            <p className="mt-5 max-w-3xl text-sm font-bold leading-relaxed text-slate-600">
              Aincarn OSは、あなたの目標から逆算してタスクを作り、各タスクに最適なAI（Claude / ChatGPT / Gemini / Perplexity ほか）と
              そのまま貼り付けられるプロンプトを割り当てます。プロンプトはAincarn内で代理実行され、回答はそのままMemoryに残ります。
              {!aiEnabled && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-700">
                  AI生成は未設定のためテンプレート起動中
                </span>
              )}
            </p>
            <UsageMeter usage={usage} />
          </div>
          <RouterPanel />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[390px_1fr]">
        <div className="rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Aincarn Memory</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">目標を保存する</h2>
          <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
            この情報をもとにAIがタスクとプロンプトを設計します。詳しいほど、出てくるタスクは具体的になります。
          </p>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-black text-slate-500">目指すもの</span>
              <textarea
                value={profile.goal}
                onChange={(event) => setProfile((current) => ({ ...current, goal: event.target.value }))}
                rows={4}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                placeholder="例: AIを使って個人事業の月商を3か月で50万→100万に伸ばしたい"
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
            <label className="block">
              <span className="text-xs font-black text-slate-500">価値観・優先したいこと</span>
              <textarea
                value={profile.values}
                onChange={(event) => setProfile((current) => ({ ...current, values: event.target.value }))}
                rows={2}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                placeholder="例: 家族との時間、学び続けたい、無理なく続けたい"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-slate-500">制約・避けたいこと</span>
              <textarea
                value={profile.constraints}
                onChange={(event) => setProfile((current) => ({ ...current, constraints: event.target.value }))}
                rows={2}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-950 outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100"
                placeholder="例: 平日深夜は使えない、初期投資10万以内"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving || generating || !profile.goal.trim()}
                onClick={() => callProfileAction('profile')}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? '保存中...' : 'Aincarn Memoryを更新'}
              </button>
              {savedProfile && (
                <button
                  type="button"
                  disabled={saving || generating || !profile.goal.trim()}
                  onClick={() => callProfileAction('regenerate')}
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {generating ? 'AIが再設計中...' : 'AIでプランを再生成'}
                </button>
              )}
            </div>
            {message && <p className="text-xs font-bold text-slate-500">{message}</p>}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Free</p>
            <p className="mt-1 text-sm font-black text-slate-950">テスト中は無料で試せます</p>
            <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
              正式版ではProプラン (¥980/月) で:
              <br />・複数の目標を並行管理
              <br />・週次レビューとリプランをAIに依頼
              <br />・成果物をAincarn Memoryに自動保存
              <br />・API使用量上限なし
            </p>
            <Link
              href="/tools/subscriptions"
              className="mt-3 inline-flex rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 transition hover:border-slate-500"
            >
              他のAIサブスクとの組み合わせを見る
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          <section className="grid gap-3 md:grid-cols-3">
            {[
              ['進捗', `${progress}%`, '完了タスク比率'],
              ['アクティブ', `${activeTasks.length}件`, '未着手・実行中'],
              ['実績', `${doneTasks.length}件`, '完了タスク'],
            ].map(([label, value, caption]) => (
              <article
                key={label}
                className="rounded-2xl border border-white/80 bg-white/86 p-4 shadow-sm shadow-slate-950/5 backdrop-blur-xl"
              >
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-black text-slate-950">{value}</p>
                <p className="mt-1 text-xs font-bold text-slate-500">{caption}</p>
              </article>
            ))}
          </section>

          {latestPlan && (
            <section className="rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Plan rationale</p>
                <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-black text-white">
                  {latestPlan.model}
                </span>
                {latestPlan.createdAt && (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">
                    生成 {formatDateTime(latestPlan.createdAt)}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm font-bold leading-relaxed text-slate-700">{latestPlan.rationale}</p>
            </section>
          )}

          <section className="rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Decision</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Aincarnの次の判断</h2>
            <div className="mt-4 rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">Recommended next move</p>
              <p className="mt-2 text-xl font-black">{recommended?.title || 'まず目標を保存してください'}</p>
              <p className="mt-3 text-sm font-bold leading-relaxed text-white/70">
                {recommended?.reason || 'Aincarn Memoryに目標を入れると、目標から逆算した初期タスクを作成します。'}
              </p>
              {recommended?.recommendedTool && (
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-black">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-white/80">推奨AI</span>
                  <span
                    className="rounded-full px-3 py-1"
                    style={{
                      background: getToolBadge(recommended.recommendedTool).bg,
                      color: getToolBadge(recommended.recommendedTool).ink,
                    }}
                  >
                    {recommended.recommendedTool}
                  </span>
                </div>
              )}
            </div>
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
                  目標を保存すると、AIが最初の行動候補とプロンプトを生成します。
                </p>
              )}
              {todayTasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  index={index}
                  saving={saving}
                  onUpdate={updateTask}
                  onDelete={deleteTask}
                  onUsageUpdate={setUsage}
                />
              ))}
            </div>
          </section>

          {tasks.length > todayTasks.length && (
            <section className="rounded-[30px] border border-white/80 bg-white/88 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Backlog</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">残りのタスク</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {sortTasks(tasks)
                  .slice(todayTasks.length)
                  .map((task, index) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      index={todayTasks.length + index}
                      saving={saving}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                      onUsageUpdate={setUsage}
                      compact
                    />
                  ))}
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  )
}

type RunRecord = {
  id: string
  provider: string
  model: string
  output: string
  fallbackReason?: string
  createdAt: string
}

function TaskCard({
  task,
  index,
  saving,
  onUpdate,
  onDelete,
  onUsageUpdate,
  compact,
}: {
  task: ClientTask
  index: number
  saving: boolean
  onUpdate: (id: string, status: SavedAiosTask['status']) => void
  onDelete: (id: string) => void
  onUsageUpdate?: (usage: UsageState) => void
  compact?: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [runs, setRuns] = useState<RunRecord[]>([])
  const [runsLoaded, setRunsLoaded] = useState(false)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')
  const tool = task.recommendedTool || ''
  const badge = getToolBadge(tool)
  const toolUrl = task.toolUrl || (tool && TOOL_FALLBACK_URLS[tool]) || ''
  const hasPrompt = Boolean((task.prompt || '').trim())

  async function loadRuns() {
    if (runsLoaded) return
    try {
      const response = await fetch(`/api/aios/tasks/${task.id}/run`, { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setRuns(Array.isArray(data.runs) ? data.runs : [])
      }
    } finally {
      setRunsLoaded(true)
    }
  }

  useEffect(() => {
    if (hasPrompt) loadRuns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id])

  async function copyPrompt() {
    if (!hasPrompt) return
    try {
      await navigator.clipboard.writeText(task.prompt || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // ignore clipboard errors silently
    }
  }

  async function runInAincarn() {
    if (!hasPrompt) return
    setRunning(true)
    setRunError('')
    try {
      const response = await fetch(`/api/aios/tasks/${task.id}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await response.json()
      if (!response.ok) {
        if (data?.usage && onUsageUpdate) onUsageUpdate(data.usage)
        throw new Error(data.error || 'AI実行に失敗しました')
      }
      setRuns((current) => [data.run, ...current])
      if (data?.usage && onUsageUpdate) onUsageUpdate(data.usage)
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'AI実行に失敗しました')
    } finally {
      setRunning(false)
    }
  }

  const latestRun = runs[0]

  return (
    <article className={`rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm shadow-slate-950/5 ${compact ? 'opacity-95' : ''}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="grid size-7 place-items-center rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 text-xs font-black text-white">
              {index + 1}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">{task.domain}</span>
            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-200">
              {statusLabels[task.status]}
            </span>
            {tool && (
              <span
                className="rounded-full px-2.5 py-1 text-[10px] font-black"
                style={{ background: badge.bg, color: badge.ink }}
              >
                {tool}
              </span>
            )}
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
              impact {task.impact}
            </span>
            <span className="rounded-full bg-amber-50 px-2 py-1 text-[10px] font-black text-amber-700">
              effort {task.effort}
            </span>
            {runs.length > 0 && (
              <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-black text-indigo-700">
                実行 {runs.length}回
              </span>
            )}
          </div>
          <h3 className="mt-3 text-lg font-black text-slate-950">{task.title}</h3>
          <p className="mt-2 text-sm font-bold leading-relaxed text-slate-600">{task.reason}</p>

          {hasPrompt && (
            <details
              className="mt-3 rounded-xl border border-slate-200 bg-slate-50"
              open={expanded}
              onToggle={(event) => setExpanded((event.target as HTMLDetailsElement).open)}
            >
              <summary className="cursor-pointer list-none px-3 py-2 text-xs font-black text-slate-600">
                {expanded ? '▾ AIに渡すプロンプトを隠す' : '▸ AIに渡すプロンプトを見る'}
              </summary>
              <pre className="whitespace-pre-wrap break-words border-t border-slate-200 px-3 py-2 text-xs font-bold leading-relaxed text-slate-700">
                {task.prompt}
              </pre>
            </details>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {hasPrompt && (
          <button
            type="button"
            onClick={runInAincarn}
            disabled={running}
            className="rounded-full text-xs font-black shadow-sm transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: badge.bg, color: badge.ink, padding: '0.5rem 0.875rem' }}
          >
            {running ? `${tool || 'AI'}が実行中…` : `Aincarn内で${tool || 'AI'}を実行`}
          </button>
        )}
        {hasPrompt && (
          <button
            type="button"
            onClick={copyPrompt}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:border-slate-400"
          >
            {copied ? 'コピーしました' : 'プロンプトをコピー'}
          </button>
        )}
        {hasPrompt && toolUrl && (
          <a
            href={toolUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-500 transition hover:border-slate-400"
          >
            外部の{tool}を開く
          </a>
        )}
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
        <button
          type="button"
          disabled={saving}
          onClick={() => onDelete(task.id)}
          className="ml-auto rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-400 transition hover:border-rose-300 hover:text-rose-500 disabled:opacity-40"
        >
          削除
        </button>
      </div>

      {runError && (
        <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
          {runError}
        </p>
      )}

      {latestRun && (
        <RunResultPanel runs={runs} />
      )}
    </article>
  )
}

function RunResultPanel({ runs }: { runs: RunRecord[] }) {
  const [showHistory, setShowHistory] = useState(false)
  const latest = runs[0]
  if (!latest) return null

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 px-4 py-2">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Aincarn Run</p>
        <span className="rounded-full bg-slate-950 px-2 py-0.5 text-[10px] font-black text-white">
          {latest.provider}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600">
          {latest.model}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-500">
          {formatDateTime(latest.createdAt)}
        </span>
        {latest.fallbackReason && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-700">
            代理実行
          </span>
        )}
        {runs.length > 1 && (
          <button
            type="button"
            onClick={() => setShowHistory((value) => !value)}
            className="ml-auto rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-black text-slate-500 transition hover:border-slate-400"
          >
            {showHistory ? '履歴を閉じる' : `過去の実行 ${runs.length - 1}件`}
          </button>
        )}
      </div>
      {latest.fallbackReason && (
        <p className="border-b border-slate-200 bg-amber-50/70 px-4 py-2 text-[11px] font-bold leading-relaxed text-amber-800">
          {latest.fallbackReason}
        </p>
      )}
      <pre className="whitespace-pre-wrap break-words px-4 py-3 text-xs font-bold leading-relaxed text-slate-700">
        {latest.output || '(空の応答)'}
      </pre>
      {showHistory && runs.length > 1 && (
        <div className="space-y-2 border-t border-slate-200 bg-slate-50 px-4 py-3">
          {runs.slice(1).map((run) => (
            <details key={run.id} className="rounded-lg border border-slate-200 bg-white">
              <summary className="cursor-pointer list-none px-3 py-2 text-[11px] font-black text-slate-500">
                {run.provider}・{run.model}・{formatDateTime(run.createdAt)}
              </summary>
              <pre className="whitespace-pre-wrap break-words border-t border-slate-200 px-3 py-2 text-xs font-bold leading-relaxed text-slate-700">
                {run.output}
              </pre>
            </details>
          ))}
        </div>
      )}
    </div>
  )
}
