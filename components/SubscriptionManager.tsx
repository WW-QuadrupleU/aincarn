'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { useEffect, useMemo, useState } from 'react'
import type { SavedSubscription, SubscriptionInput } from '@/lib/subscription-store'

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)

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

const categoryOptions = ['AIチャット', '画像生成', '動画生成', 'コーディング', '検索・リサーチ', 'API', 'その他']
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

function AccountUnavailable() {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-sm shadow-rose-900/5 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Subscription Manager</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">AIサブスク管理</h1>
      <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-gray-500">
        アカウント別のサブスク管理機能は準備中です。公開画面では設定情報を表示せず、利用可能になり次第ログインして使えるようにします。
      </p>
      <div className="mt-6 inline-flex rounded-full bg-slate-100 px-5 py-3 text-sm font-black text-gray-500">
        Coming soon
      </div>
    </section>
  )
}

function SignInPrompt() {
  return (
    <section className="rounded-[28px] border border-white/80 bg-white/90 p-6 shadow-sm shadow-rose-900/5 backdrop-blur">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Subscription Manager</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">AIサブスク管理</h1>
      <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-gray-500">
        契約中のAIサービス、更新日、月額換算コストをアカウントごとに保存できます。利用するにはログインしてください。
      </p>
      <SignInButton mode="modal">
        <button
          type="button"
          className="mt-6 rounded-full bg-brand-text px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-gray-700"
        >
          ログインして始める
        </button>
      </SignInButton>
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

  function updateForm<K extends keyof SubscriptionInput>(key: K, value: SubscriptionInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  async function saveSubscription() {
    setSaving(true)
    setMessage('')
    try {
      const endpoint = editingId ? `/api/subscriptions/${editingId}` : '/api/subscriptions'
      const response = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '保存に失敗しました')
      await loadSubscriptions()
      resetForm()
      setMessage('保存しました')
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
      <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-sm shadow-rose-900/5 backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Subscription Manager</p>
              <UserButton />
            </div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">AIサブスク管理</h1>
            <p className="mt-3 max-w-3xl text-sm font-bold leading-relaxed text-gray-500">
              {user?.primaryEmailAddress?.emailAddress || 'ログイン中のアカウント'} に紐づけて、AIサービスの月額換算コストと更新日を保存します。
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#f0187a] via-[#ff6b28] to-[#ffe431] p-5 text-white sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Monthly total</p>
            <p className="mt-3 text-3xl font-black">{formatUsd(totalMonthly)}</p>
            <p className="mt-2 text-sm font-bold text-white/78">年間目安 {formatUsd(yearlyEstimate)}</p>
            <p className="mt-3 text-xs font-bold leading-relaxed text-white/78">
              次回更新: {nextRenewal ? `${nextRenewal.serviceName} / ${formatDate(nextRenewal.renewalDate)}` : '未設定'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
        <form
          className="rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-rose-900/5 backdrop-blur"
          onSubmit={(event) => {
            event.preventDefault()
            saveSubscription()
          }}
        >
          <h2 className="text-lg font-black text-brand-text">{editingId ? 'サブスクを編集' : 'サブスクを追加'}</h2>
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
          <div className="mt-5 flex gap-2">
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
              <h2 className="text-lg font-black text-brand-text">登録済みサブスク</h2>
              {loading && <span className="text-xs font-bold text-gray-400">読み込み中...</span>}
            </div>
            <div className="space-y-3">
              {subscriptions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-5 text-sm font-bold text-gray-500">
                  まずはChatGPT、Claude、Geminiなど、契約中のAIサービスを登録してください。
                </div>
              )}
              {subscriptions.map((item) => (
                <article key={item.id} className="rounded-2xl border border-gray-100 bg-white/78 p-4 shadow-sm shadow-slate-900/5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-black text-brand-text">{item.serviceName}</h3>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-gray-500">
                          {statusOptions.find((status) => status.value === item.status)?.label || item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-bold text-gray-400">
                        {item.planName || 'プラン未設定'} / {item.category} / 更新日 {formatDate(item.renewalDate)}
                      </p>
                      {item.notes && <p className="mt-2 text-xs font-bold leading-relaxed text-gray-500">{item.notes}</p>}
                    </div>
                    <div className="shrink-0 text-left sm:text-right">
                      <p className="text-lg font-black text-brand-text">{formatUsd(item.monthlyCostUsd)}</p>
                      <p className="text-xs font-bold text-gray-400">
                        {billingCycleOptions.find((cycle) => cycle.value === item.billingCycle)?.label || item.billingCycle}
                      </p>
                    </div>
                  </div>
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
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
