'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { useEffect, useMemo, useState } from 'react'
import type { SavedSubscription, SubscriptionInput } from '@/lib/subscription-store'

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

const categoryOptions = ['AIチャット', '画像生成', '動画生成', 'コーディング', '検索・リサーチ', 'デザイン', 'API', 'その他']
const billingCycleOptions: Array<{ value: SubscriptionInput['billingCycle']; label: string }> = [
  { value: 'monthly', label: '月払い' },
  { value: 'yearly', label: '年払い' },
  { value: 'weekly', label: '週払い' },
  { value: 'one_time', label: '買い切り' },
]
const statusOptions: Array<{ value: SubscriptionInput['status']; label: string }> = [
  { value: 'active', label: '契約中' },
  { value: 'trial', label: '試用中' },
  { value: 'paused', label: '一時停止' },
  { value: 'cancelled', label: '解約済み' },
]

type SubscriptionPreset = {
  id: string
  serviceName: string
  planName: string
  category: string
  monthlyCostUsd: number
  billingCycle: SubscriptionInput['billingCycle']
  notes: string
  accent: string
  mark: string
  vibe: string
}

const subscriptionPresets: SubscriptionPreset[] = [
  {
    id: 'chatgpt-plus',
    serviceName: 'ChatGPT',
    planName: 'Plus',
    category: 'AIチャット',
    monthlyCostUsd: 20,
    billingCycle: 'monthly',
    notes: '文章作成、調査、画像生成まで広く使う総合枠。料金は登録時点の目安です。',
    accent: 'from-[#15f5ba] via-[#39a7ff] to-[#7c3cff]',
    mark: 'CG',
    vibe: '万能',
  },
  {
    id: 'chatgpt-pro',
    serviceName: 'ChatGPT',
    planName: 'Pro',
    category: 'AIチャット',
    monthlyCostUsd: 200,
    billingCycle: 'monthly',
    notes: '高負荷利用や上位モデル利用を重視する人向け。料金は登録時点の目安です。',
    accent: 'from-[#ffe431] via-[#ff6b28] to-[#f0187a]',
    mark: 'CP',
    vibe: '上位',
  },
  {
    id: 'claude-pro',
    serviceName: 'Claude',
    planName: 'Pro',
    category: 'AIチャット',
    monthlyCostUsd: 20,
    billingCycle: 'monthly',
    notes: '長文、文章整理、分析用途で使いやすい枠。料金は登録時点の目安です。',
    accent: 'from-[#ff9a3c] via-[#ff5f6d] to-[#8f3cff]',
    mark: 'CL',
    vibe: '文章',
  },
  {
    id: 'claude-max',
    serviceName: 'Claude',
    planName: 'Max',
    category: 'AIチャット',
    monthlyCostUsd: 100,
    billingCycle: 'monthly',
    notes: 'Claudeを多めに使う人向けの上位枠。料金は登録時点の目安です。',
    accent: 'from-[#fdff6a] via-[#ff8a00] to-[#a100ff]',
    mark: 'CM',
    vibe: '深掘り',
  },
  {
    id: 'gemini-advanced',
    serviceName: 'Gemini',
    planName: 'Advanced',
    category: 'AIチャット',
    monthlyCostUsd: 19.99,
    billingCycle: 'monthly',
    notes: 'Google連携や日常利用をまとめたい人向け。料金は登録時点の目安です。',
    accent: 'from-[#30d5ff] via-[#7b61ff] to-[#ff4ecd]',
    mark: 'GM',
    vibe: 'Google',
  },
  {
    id: 'perplexity-pro',
    serviceName: 'Perplexity',
    planName: 'Pro',
    category: '検索・リサーチ',
    monthlyCostUsd: 20,
    billingCycle: 'monthly',
    notes: '検索、出典確認、調査の入り口に使うリサーチ枠。料金は登録時点の目安です。',
    accent: 'from-[#00e5ff] via-[#00c48c] to-[#7dff6a]',
    mark: 'PX',
    vibe: '調査',
  },
  {
    id: 'github-copilot-pro',
    serviceName: 'GitHub Copilot',
    planName: 'Pro',
    category: 'コーディング',
    monthlyCostUsd: 10,
    billingCycle: 'monthly',
    notes: 'IDE内のコード補完や実装支援用。料金は登録時点の目安です。',
    accent: 'from-[#1f2937] via-[#6d28d9] to-[#22d3ee]',
    mark: 'GH',
    vibe: '開発',
  },
  {
    id: 'cursor-pro',
    serviceName: 'Cursor',
    planName: 'Pro',
    category: 'コーディング',
    monthlyCostUsd: 20,
    billingCycle: 'monthly',
    notes: 'AIコードエディタを中心に開発する人向け。料金は登録時点の目安です。',
    accent: 'from-[#111827] via-[#0ea5e9] to-[#f97316]',
    mark: 'CU',
    vibe: '実装',
  },
  {
    id: 'midjourney-basic',
    serviceName: 'Midjourney',
    planName: 'Basic',
    category: '画像生成',
    monthlyCostUsd: 10,
    billingCycle: 'monthly',
    notes: '画像生成を軽めに試す枠。料金は登録時点の目安です。',
    accent: 'from-[#ff47a3] via-[#ffcc00] to-[#00e0ff]',
    mark: 'MJ',
    vibe: '画像',
  },
  {
    id: 'runway-standard',
    serviceName: 'Runway',
    planName: 'Standard',
    category: '動画生成',
    monthlyCostUsd: 15,
    billingCycle: 'monthly',
    notes: '動画生成や映像編集AIを触るための枠。料金は登録時点の目安です。',
    accent: 'from-[#b6ff00] via-[#00d5ff] to-[#3b00ff]',
    mark: 'RW',
    vibe: '動画',
  },
  {
    id: 'canva-pro',
    serviceName: 'Canva',
    planName: 'Pro',
    category: 'デザイン',
    monthlyCostUsd: 15,
    billingCycle: 'monthly',
    notes: 'デザイン制作、資料、SNS素材をまとめる枠。料金は登録時点の目安です。',
    accent: 'from-[#00c4cc] via-[#8b3dff] to-[#ff5e9c]',
    mark: 'CV',
    vibe: '制作',
  },
]

const emptyForm: SubscriptionInput = {
  serviceName: '',
  planName: '',
  category: 'AIチャット',
  monthlyCostUsd: 20,
  billingCycle: 'monthly',
  renewalDate: '',
  status: 'active',
  notes: '',
}

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value >= 100 ? 0 : 2,
  }).format(value)
}

function formatDate(value?: string) {
  if (!value) return '未設定'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function toInput(subscription: SavedSubscription): SubscriptionInput {
  return {
    serviceName: subscription.serviceName,
    planName: subscription.planName,
    category: subscription.category,
    monthlyCostUsd: subscription.monthlyCostUsd,
    billingCycle: subscription.billingCycle,
    renewalDate: subscription.renewalDate ? subscription.renewalDate.slice(0, 10) : '',
    status: subscription.status,
    notes: subscription.notes,
  }
}

function presetToInput(preset: SubscriptionPreset): SubscriptionInput {
  return {
    serviceName: preset.serviceName,
    planName: preset.planName,
    category: preset.category,
    monthlyCostUsd: preset.monthlyCostUsd,
    billingCycle: preset.billingCycle,
    renewalDate: '',
    status: 'active',
    notes: preset.notes,
  }
}

function getAccentForSubscription(subscription: SavedSubscription) {
  const preset = subscriptionPresets.find(
    (item) =>
      item.serviceName.toLowerCase() === subscription.serviceName.toLowerCase() &&
      item.planName.toLowerCase() === (subscription.planName || '').toLowerCase(),
  )
  return preset?.accent || 'from-[#f0187a] via-[#ff6b28] to-[#ffe431]'
}

function AccountUnavailable() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-sm shadow-rose-900/5 backdrop-blur">
      <div className="bg-gradient-to-br from-[#f0187a] via-[#ff6b28] to-[#ffe431] p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">Subscription Collection</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">AIサブスク管理</h1>
        <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-white/80">
          アカウント別のサブスク管理機能は準備中です。公開画面では設定情報を表示せず、利用可能になり次第ログインして使えるようにします。
        </p>
      </div>
    </section>
  )
}

function SignInPrompt() {
  return (
    <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-xl shadow-rose-900/10 backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Subscription Collection</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-brand-text sm:text-5xl">
            AIサブスクを集めて、眺めて、育てる。
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-gray-600">
            契約中のAIサービス、更新日、月額換算コストをアカウントごとに保存できます。主要サービスはカードから選んで追加できます。
          </p>
          <SignInButton mode="modal">
            <button
              type="button"
              className="mt-6 rounded-full bg-brand-text px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-gray-700"
            >
              ログインしてコレクションを作る
            </button>
          </SignInButton>
        </div>
        <div className="min-h-[260px] bg-[radial-gradient(circle_at_15%_20%,#fff06a_0,transparent_28%),radial-gradient(circle_at_75%_15%,#ff5e9c_0,transparent_28%),radial-gradient(circle_at_55%_80%,#00d5ff_0,transparent_30%),linear-gradient(135deg,#f0187a,#ff6b28,#ffe431)] p-6">
          <div className="grid grid-cols-2 gap-3">
            {subscriptionPresets.slice(0, 6).map((preset) => (
              <div key={preset.id} className="rounded-2xl border border-white/45 bg-white/18 p-3 text-white shadow-lg shadow-black/10 backdrop-blur">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white text-xs font-black text-brand-text">{preset.mark}</div>
                <p className="mt-3 text-sm font-black">{preset.serviceName}</p>
                <p className="text-xs font-bold text-white/75">{preset.planName}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function SubscriptionManager() {
  if (!clerkEnabled) return <AccountUnavailable />
  return <AuthenticatedSubscriptionManager />
}

function AuthenticatedSubscriptionManager() {
  const { isLoaded, isSignedIn, user } = useUser()
  const [subscriptions, setSubscriptions] = useState<SavedSubscription[]>([])
  const [form, setForm] = useState<SubscriptionInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [presetFilter, setPresetFilter] = useState('すべて')

  async function loadSubscriptions() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/subscriptions')
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'サブスク情報を読み込めませんでした')
      setSubscriptions(data.subscriptions || [])
    } catch {
      setMessage('サブスク情報を読み込めませんでした。少し時間をおいて再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadSubscriptions()
    }
  }, [isLoaded, isSignedIn])

  const activeSubscriptions = subscriptions.filter((item) => item.status === 'active' || item.status === 'trial')
  const totalMonthly = activeSubscriptions.reduce((sum, item) => sum + item.monthlyCostUsd, 0)
  const yearlyEstimate = totalMonthly * 12
  const nextRenewal = activeSubscriptions
    .filter((item): item is SavedSubscription & { renewalDate: string } => Boolean(item.renewalDate))
    .sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime())[0]

  const categoryTotals = useMemo(() => {
    return activeSubscriptions
      .reduce<Array<{ category: string; total: number }>>((acc, item) => {
        const existing = acc.find((entry) => entry.category === item.category)
        if (existing) existing.total += item.monthlyCostUsd
        else acc.push({ category: item.category, total: item.monthlyCostUsd })
        return acc
      }, [])
      .sort((a, b) => b.total - a.total)
  }, [activeSubscriptions])

  const presetCategories = ['すべて', ...Array.from(new Set(subscriptionPresets.map((preset) => preset.category)))]
  const filteredPresets =
    presetFilter === 'すべて' ? subscriptionPresets : subscriptionPresets.filter((preset) => preset.category === presetFilter)

  function updateForm<K extends keyof SubscriptionInput>(key: K, value: SubscriptionInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function choosePreset(preset: SubscriptionPreset) {
    setForm(presetToInput(preset))
    setEditingId(null)
    setMessage(`${preset.serviceName} ${preset.planName} をフォームに入れました。更新日だけ足して保存できます。`)
  }

  async function addPreset(preset: SubscriptionPreset) {
    const alreadyExists = subscriptions.some(
      (item) =>
        item.serviceName.toLowerCase() === preset.serviceName.toLowerCase() &&
        (item.planName || '').toLowerCase() === preset.planName.toLowerCase() &&
        item.status !== 'cancelled',
    )
    if (alreadyExists) {
      setMessage(`${preset.serviceName} ${preset.planName} はすでにコレクションにあります。`)
      return
    }
    await saveSubscription(presetToInput(preset), null)
  }

  async function saveSubscription(input: SubscriptionInput = form, targetEditingId: string | null = editingId) {
    setSaving(true)
    setMessage('')
    try {
      const endpoint = targetEditingId ? `/api/subscriptions/${targetEditingId}` : '/api/subscriptions'
      const response = await fetch(endpoint, {
        method: targetEditingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '保存に失敗しました')
      await loadSubscriptions()
      resetForm()
      setMessage(targetEditingId ? '更新しました' : `${input.serviceName} をコレクションに追加しました`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  async function removeSubscription(id: string) {
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '削除に失敗しました')
      setSubscriptions((current) => current.filter((item) => item.id !== id))
      if (editingId === id) resetForm()
      setMessage('削除しました')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '削除に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="rounded-[24px] border border-white/80 bg-white/90 p-6 text-sm font-bold text-gray-500">
        アカウント情報を確認しています...
      </div>
    )
  }

  if (!isSignedIn) return <SignInPrompt />

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-xl shadow-rose-900/10 backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <p className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-rose-500">
                Subscription Collection
              </p>
              <UserButton />
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-brand-text sm:text-5xl">
              AIサブスクを、集める楽しさに変える。
            </h1>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-gray-600">
              {user?.primaryEmailAddress?.emailAddress || 'ログイン中のアカウント'} に紐づけて、契約中のAIサービスをカードで管理します。
              主要サービスは下のカードから選ぶだけで追加できます。
            </p>
          </div>
          <div className="bg-[radial-gradient(circle_at_10%_15%,#fff36d_0,transparent_26%),radial-gradient(circle_at_85%_20%,#ff39a8_0,transparent_28%),radial-gradient(circle_at_45%_85%,#00d5ff_0,transparent_32%),linear-gradient(135deg,#f0187a,#ff6b28,#ffe431)] p-5 text-white sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">Monthly total</p>
            <p className="mt-3 text-4xl font-black">{formatUsd(totalMonthly)}</p>
            <p className="mt-2 text-sm font-bold text-white/82">年間目安 {formatUsd(yearlyEstimate)}</p>
            <div className="mt-5 rounded-2xl border border-white/35 bg-white/16 p-4 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/70">Next renewal</p>
              <p className="mt-2 text-sm font-black">
                {nextRenewal ? `${nextRenewal.serviceName} / ${formatDate(nextRenewal.renewalDate)}` : '未設定'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-rose-900/5 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Quick Add</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-text">主要AIサービスを選んで追加</h2>
            <p className="mt-2 text-sm font-bold text-gray-500">料金は登録時点の目安です。追加後にプラン名・更新日・メモを編集できます。</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {presetCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setPresetFilter(category)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-black transition ${
                  presetFilter === category
                    ? 'bg-brand-text text-white shadow-sm shadow-slate-900/15'
                    : 'border border-gray-200 bg-white text-gray-500 hover:border-brand-text hover:text-brand-text'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredPresets.map((preset) => {
            const exists = subscriptions.some(
              (item) =>
                item.serviceName.toLowerCase() === preset.serviceName.toLowerCase() &&
                (item.planName || '').toLowerCase() === preset.planName.toLowerCase() &&
                item.status !== 'cancelled',
            )
            return (
              <article
                key={preset.id}
                className="group overflow-hidden rounded-2xl border border-white/80 bg-white shadow-sm shadow-rose-900/5 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-900/10"
              >
                <div className={`h-2 bg-gradient-to-r ${preset.accent}`} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${preset.accent} text-xs font-black text-white shadow-lg shadow-slate-900/10`}>
                      {preset.mark}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-gray-500">{preset.vibe}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-black text-brand-text">{preset.serviceName}</h3>
                  <p className="text-xs font-bold text-gray-400">{preset.planName} / {preset.category}</p>
                  <p className="mt-3 text-2xl font-black text-brand-text">{formatUsd(preset.monthlyCostUsd)}</p>
                  <p className="mt-2 min-h-[40px] text-xs font-bold leading-relaxed text-gray-500">{preset.notes}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      disabled={saving || exists}
                      onClick={() => addPreset(preset)}
                      className="rounded-full bg-brand-text px-4 py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      {exists ? '登録済み' : 'コレクションに追加'}
                    </button>
                    <button
                      type="button"
                      onClick={() => choosePreset(preset)}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-black text-gray-500 transition hover:border-brand-text hover:text-brand-text"
                    >
                      編集して追加
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form
          className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-rose-900/5 backdrop-blur"
          onSubmit={(event) => {
            event.preventDefault()
            saveSubscription()
          }}
        >
          <h2 className="text-lg font-black text-brand-text">{editingId ? 'カードを編集' : '手動でカードを作る'}</h2>
          <div className="mt-4 space-y-3">
            <label className="block">
              <span className="text-xs font-black text-gray-500">サービス名</span>
              <input
                value={form.serviceName}
                onChange={(event) => updateForm('serviceName', event.target.value)}
                placeholder="ChatGPT, Claude, Gemini..."
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-gray-500">プラン名</span>
              <input
                value={form.planName}
                onChange={(event) => updateForm('planName', event.target.value)}
                placeholder="Pro, Team, API..."
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-black text-gray-500">カテゴリ</span>
                <select
                  value={form.category}
                  onChange={(event) => updateForm('category', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                >
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-gray-500">月額換算 USD</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthlyCostUsd}
                  onChange={(event) => updateForm('monthlyCostUsd', Number(event.target.value))}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-black text-gray-500">請求周期</span>
                <select
                  value={form.billingCycle}
                  onChange={(event) => updateForm('billingCycle', event.target.value as SubscriptionInput['billingCycle'])}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                >
                  {billingCycleOptions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-black text-gray-500">更新日</span>
                <input
                  type="date"
                  value={form.renewalDate}
                  onChange={(event) => updateForm('renewalDate', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs font-black text-gray-500">ステータス</span>
              <select
                value={form.status}
                onChange={(event) => updateForm('status', event.target.value as SubscriptionInput['status'])}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
              >
                {statusOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black text-gray-500">メモ</span>
              <textarea
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
              />
            </label>
          </div>
          {message && <p className="mt-3 text-xs font-bold text-gray-500">{message}</p>}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-brand-text px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? '保存中...' : editingId ? '更新する' : '追加する'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-500 transition hover:border-brand-text hover:text-brand-text"
              >
                キャンセル
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          <section className="grid gap-3 md:grid-cols-3">
            {[
              ['契約中', `${activeSubscriptions.length}件`],
              ['月額合計', formatUsd(totalMonthly)],
              ['年額目安', formatUsd(yearlyEstimate)],
            ].map(([label, value]) => (
              <article key={label} className="rounded-2xl border border-white/80 bg-white/88 p-4 shadow-sm shadow-rose-900/5 backdrop-blur">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-500">{label}</p>
                <p className="mt-2 text-xl font-black text-brand-text">{value}</p>
              </article>
            ))}
          </section>

          <section className="rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-rose-900/5 backdrop-blur">
            <h2 className="text-lg font-black text-brand-text">カテゴリ別コスト</h2>
            <div className="mt-4 space-y-3">
              {categoryTotals.length === 0 && <p className="text-sm font-bold text-gray-500">契約中のサブスクはまだありません。</p>}
              {categoryTotals.map((entry) => (
                <div key={entry.category}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs font-black">
                    <span className="text-gray-500">{entry.category}</span>
                    <span className="text-brand-text">{formatUsd(entry.total)}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#f0187a] via-[#ff6b28] to-[#ffe431]"
                      style={{ width: `${Math.max(8, Math.min(100, (entry.total / Math.max(1, totalMonthly)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-rose-900/5 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-black text-brand-text">My Collection</h2>
              {loading && <span className="text-xs font-bold text-gray-400">読み込み中...</span>}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {subscriptions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-5 text-sm font-bold text-gray-500 md:col-span-2">
                  まずは主要サービスカードから、契約中のAIサブスクをコレクションに追加してください。
                </div>
              )}
              {subscriptions.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-slate-900/5">
                  <div className={`h-2 bg-gradient-to-r ${getAccentForSubscription(item)}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-black text-brand-text">{item.serviceName}</h3>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-gray-500">
                            {statusOptions.find((status) => status.value === item.status)?.label || item.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-gray-400">
                          {item.planName || 'プラン未設定'} / {item.category}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-lg font-black text-brand-text">{formatUsd(item.monthlyCostUsd)}</p>
                        <p className="text-xs font-bold text-gray-400">
                          {billingCycleOptions.find((cycle) => cycle.value === item.billingCycle)?.label || item.billingCycle}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-xs font-bold text-gray-400">更新日 {formatDate(item.renewalDate)}</p>
                    {item.notes && <p className="mt-2 text-xs font-bold leading-relaxed text-gray-500">{item.notes}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(item.id)
                          setForm(toInput(item))
                        }}
                        className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-500 transition hover:border-brand-text hover:text-brand-text"
                      >
                        編集
                      </button>
                      <button
                        type="button"
                        onClick={() => removeSubscription(item.id)}
                        className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-black text-rose-500 transition hover:border-rose-500 hover:bg-rose-50"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
