'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { useEffect, useMemo, useState } from 'react'
import {
  categoryOptions,
  defaultSubscriptionCatalog,
  type SubscriptionCatalogPlan,
  type SubscriptionCatalogService,
} from '@/lib/subscription-catalog'
import type { SavedSubscription, SubscriptionInput } from '@/lib/subscription-store'

const clerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)
const allFilter = 'すべて'

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

const emptyForm: SubscriptionInput = {
  serviceName: '',
  planName: '',
  category: 'チャット',
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

function categoriesToText(categories: string[]) {
  return categories.join(', ')
}

function splitCategories(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
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

function planToInput(service: SubscriptionCatalogService, plan: SubscriptionCatalogPlan): SubscriptionInput {
  return {
    serviceName: service.name,
    planName: plan.name,
    category: categoriesToText(service.categories),
    monthlyCostUsd: plan.monthlyCostUsd,
    billingCycle: plan.billingCycle,
    renewalDate: '',
    status: 'active',
    notes: `${service.description} ${plan.summary} 料金は${service.updatedAt}時点の目安です。`,
  }
}

function getAccentForSubscription(subscription: SavedSubscription, catalog: SubscriptionCatalogService[]) {
  const service = catalog.find((item) => item.name.toLowerCase() === subscription.serviceName.toLowerCase())
  return service?.accent || 'from-[#f0187a] via-[#ff6b28] to-[#ffe431]'
}

function AccountUnavailable() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-sm shadow-rose-900/5 backdrop-blur">
      <div className="bg-gradient-to-br from-[#f0187a] via-[#ff6b28] to-[#ffe431] p-6 text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-white/75">Subscription Collection</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">AIサブスク管理</h1>
        <p className="mt-3 max-w-2xl text-sm font-bold leading-relaxed text-white/80">
          アカウント別のサブスク保存機能は準備中です。Clerkとデータベース設定後に利用できます。
        </p>
      </div>
    </section>
  )
}

function SignInPrompt() {
  return (
    <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-xl shadow-rose-900/10 backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Subscription Collection</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-brand-text sm:text-5xl">
            AIサブスクを選んで、集めて、育てる。
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-gray-600">
            ChatGPT、Claude、Gemini、Midjourney、Runwayなどをサービスから選び、その中のプランを選んで保存できます。
            ジャンルがまたがるサービスも、コレクションでは複数タグとして扱います。
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
        <div className="min-h-[300px] bg-[linear-gradient(135deg,#f0187a_0%,#ff6b28_38%,#ffe431_70%,#39a7ff_100%)] p-6">
          <div className="grid grid-cols-2 gap-3">
            {defaultSubscriptionCatalog.slice(0, 6).map((service) => (
              <div key={service.id} className="rounded-2xl border border-white/45 bg-white/18 p-3 text-white shadow-lg shadow-black/10 backdrop-blur">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white text-xs font-black text-brand-text">{service.mark}</div>
                <p className="mt-3 text-sm font-black">{service.name}</p>
                <p className="text-xs font-bold text-white/75">{service.categories.slice(0, 2).join(' / ')}</p>
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
  const [catalog, setCatalog] = useState(defaultSubscriptionCatalog)
  const [selectedServiceId, setSelectedServiceId] = useState(defaultSubscriptionCatalog[0]?.id || '')
  const [form, setForm] = useState<SubscriptionInput>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [serviceFilter, setServiceFilter] = useState(allFilter)

  const selectedService = catalog.find((service) => service.id === selectedServiceId) || catalog[0]

  async function loadCatalog() {
    setCatalogLoading(true)
    try {
      const response = await fetch('/api/subscription-catalog', { cache: 'no-store' })
      const data = await response.json()
      if (response.ok && Array.isArray(data.services) && data.services.length > 0) {
        setCatalog(data.services)
        setSelectedServiceId((current) => data.services.some((service: SubscriptionCatalogService) => service.id === current) ? current : data.services[0].id)
      }
    } finally {
      setCatalogLoading(false)
    }
  }

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
      loadCatalog()
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
    const totals = new Map<string, number>()
    activeSubscriptions.forEach((item) => {
      splitCategories(item.category).forEach((category) => {
        totals.set(category, (totals.get(category) || 0) + item.monthlyCostUsd)
      })
    })
    return Array.from(totals, ([category, total]) => ({ category, total })).sort((a, b) => b.total - a.total)
  }, [activeSubscriptions])

  const filteredCatalog =
    serviceFilter === allFilter ? catalog : catalog.filter((service) => service.categories.includes(serviceFilter as never))

  function updateForm<K extends keyof SubscriptionInput>(key: K, value: SubscriptionInput[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function resetForm() {
    setForm(emptyForm)
    setEditingId(null)
  }

  function choosePlan(service: SubscriptionCatalogService, plan: SubscriptionCatalogPlan) {
    setForm(planToInput(service, plan))
    setEditingId(null)
    setMessage(`${service.name} ${plan.name} をフォームに入れました。更新日やメモを調整して保存できます。`)
  }

  async function addPlan(service: SubscriptionCatalogService, plan: SubscriptionCatalogPlan) {
    const alreadyExists = subscriptions.some(
      (item) =>
        item.serviceName.toLowerCase() === service.name.toLowerCase() &&
        (item.planName || '').toLowerCase() === plan.name.toLowerCase() &&
        item.status !== 'cancelled',
    )
    if (alreadyExists) {
      setMessage(`${service.name} ${plan.name} はすでにコレクションにあります。`)
      return
    }
    await saveSubscription(planToInput(service, plan), null)
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
      setMessage(targetEditingId ? '更新しました' : `${input.serviceName} ${input.planName || ''}をコレクションに追加しました`)
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
              AIサブスクを、カードで集める。
            </h1>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-gray-600">
              {user?.primaryEmailAddress?.emailAddress || 'ログイン中のアカウント'} に紐づけて、契約中のAIサービスを保存します。
              サービスを選んでからプランを選択でき、画像と動画など複数ジャンルのサービスもそのままタグ化します。
            </p>
          </div>
          <div className="bg-[linear-gradient(135deg,#f0187a_0%,#ff6b28_40%,#ffe431_72%,#39a7ff_100%)] p-5 text-white sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/75">Monthly total</p>
            <p className="mt-3 text-4xl font-black">{formatUsd(totalMonthly)}</p>
            <p className="mt-2 text-sm font-bold text-white/82">年換算目安 {formatUsd(yearlyEstimate)}</p>
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
            <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-500">Choose Service</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-brand-text">サービスを選んで、その場でプランを選択</h2>
            <p className="mt-2 text-sm font-bold text-gray-500">
              料金は公式ページをもとにした目安です。外部カタログURLを設定すると、デプロイなしで最新プランに差し替えられます。
              {catalogLoading && ' 最新カタログを確認中...'}
            </p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {[allFilter, ...categoryOptions].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setServiceFilter(category)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-black transition ${
                  serviceFilter === category
                    ? 'bg-brand-text text-white shadow-sm shadow-slate-900/15'
                    : 'border border-gray-200 bg-white text-gray-500 hover:border-brand-text hover:text-brand-text'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {filteredCatalog.map((service) => {
            const isSelected = selectedService?.id === service.id
            return (
              <article
                key={service.id}
                className={`overflow-visible rounded-3xl border bg-white shadow-sm shadow-rose-900/5 transition ${
                  isSelected ? 'border-brand-text shadow-lg shadow-rose-900/10' : 'border-white/80'
                }`}
              >
                <button type="button" onClick={() => setSelectedServiceId(service.id)} className="block w-full text-left">
                  <div className={`h-2 rounded-t-3xl bg-gradient-to-r ${service.accent}`} />
                  <div className="grid gap-4 p-4 md:grid-cols-[220px_1fr_auto] md:items-center">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${service.accent} text-xs font-black text-white`}>
                        {service.mark}
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-brand-text">{service.name}</h3>
                        <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-gray-500">
                          {service.vibe}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {service.categories.map((category) => (
                        <span key={category} className="rounded-full bg-slate-50 px-2.5 py-1.5 text-[11px] font-black text-gray-500">
                          {category}
                        </span>
                      ))}
                    </div>
                    <span className="rounded-full bg-brand-text px-4 py-2 text-center text-xs font-black text-white">
                      {isSelected ? 'プランを表示中' : 'プランを見る'}
                    </span>
                  </div>
                </button>

                {isSelected && (
                  <div className="border-t border-gray-100 bg-white/92 p-4">
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <p className="max-w-3xl text-sm font-bold leading-relaxed text-gray-600">{service.description}</p>
                      <a
                        href={service.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-2 text-xs font-black text-gray-500 transition hover:border-brand-text hover:text-brand-text"
                      >
                        公式料金
                      </a>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {service.plans.map((plan) => {
                        const exists = subscriptions.some(
                          (item) =>
                            item.serviceName.toLowerCase() === service.name.toLowerCase() &&
                            (item.planName || '').toLowerCase() === plan.name.toLowerCase() &&
                            item.status !== 'cancelled',
                        )
                        return (
                          <article key={plan.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-slate-900/5">
                            <p className="text-xs font-black uppercase tracking-[0.14em] text-rose-500">{service.name}</p>
                            <h4 className="mt-2 text-lg font-black text-brand-text">{plan.name}</h4>
                            <p className="mt-2 text-3xl font-black text-brand-text">{formatUsd(plan.monthlyCostUsd)}</p>
                            <p className="text-xs font-bold text-gray-400">
                              {billingCycleOptions.find((cycle) => cycle.value === plan.billingCycle)?.label || plan.billingCycle}
                            </p>
                            <p className="mt-3 min-h-[54px] text-xs font-bold leading-relaxed text-gray-500">{plan.summary}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={saving || exists}
                                onClick={() => addPlan(service, plan)}
                                className="rounded-full bg-brand-text px-4 py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                              >
                                {exists ? '登録済み' : 'そのまま追加'}
                              </button>
                              <button
                                type="button"
                                onClick={() => choosePlan(service, plan)}
                                className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-black text-gray-500 transition hover:border-brand-text hover:text-brand-text"
                              >
                                編集して追加
                              </button>
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )}
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
            <label className="block">
              <span className="text-xs font-black text-gray-500">ジャンル（複数可・カンマ区切り）</span>
              <input
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
                placeholder="チャット, 画像, 動画"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
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
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-black text-gray-500">更新日</span>
                <input
                  type="date"
                  value={form.renewalDate}
                  onChange={(event) => updateForm('renewalDate', event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                />
              </label>
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
            </div>
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
            <h2 className="text-lg font-black text-brand-text">ジャンル別コスト</h2>
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
                  まずは上のサービスカードから、契約中または気になるAIサブスクをコレクションに追加してください。
                </div>
              )}
              {subscriptions.map((item) => (
                <article key={item.id} className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm shadow-slate-900/5">
                  <div className={`h-2 bg-gradient-to-r ${getAccentForSubscription(item, catalog)}`} />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate text-base font-black text-brand-text">{item.serviceName}</h3>
                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-gray-500">
                            {statusOptions.find((status) => status.value === item.status)?.label || item.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-gray-400">{item.planName || 'プラン未設定'}</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {splitCategories(item.category).map((category) => (
                            <span key={category} className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-black text-gray-500">
                              {category}
                            </span>
                          ))}
                        </div>
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
