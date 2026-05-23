'use client'

import { SignInButton, UserButton, useUser } from '@clerk/nextjs'
import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import {
  categoryOptions,
  defaultSubscriptionCatalog,
  type SubscriptionBillingCycle,
  type SubscriptionCatalogPlan,
  type SubscriptionCatalogService,
} from '@/lib/ai-database'
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

function planToInput(
  service: SubscriptionCatalogService,
  plan: SubscriptionCatalogPlan,
  cycle: SubscriptionBillingCycle = 'monthly',
): SubscriptionInput {
  const isYearly = cycle === 'yearly' && plan.yearly
  const monthlyCostUsd = isYearly ? plan.yearly!.monthlyCostUsd : plan.monthlyCostUsd
  const billingCycle: SubscriptionBillingCycle = isYearly ? 'yearly' : 'monthly'
  const cycleSummary = isYearly && plan.yearly?.summary ? plan.yearly.summary : plan.summary
  const planLabel = isYearly ? `${plan.name}（年払い）` : plan.name
  return {
    serviceName: service.name,
    planName: planLabel,
    category: categoriesToText(service.categories),
    monthlyCostUsd,
    billingCycle,
    renewalDate: '',
    status: 'active',
    notes: `${service.description} ${cycleSummary} 料金は${service.updatedAt}時点の目安です。`,
  }
}

function getCatalogServiceForSubscription(subscription: SavedSubscription, catalog: SubscriptionCatalogService[]) {
  return catalog.find((item) => item.name.toLowerCase() === subscription.serviceName.toLowerCase())
}

function getCollectionMark(subscription: SavedSubscription, catalog: SubscriptionCatalogService[]) {
  const service = getCatalogServiceForSubscription(subscription, catalog)
  return service?.mark || subscription.serviceName.slice(0, 2).toUpperCase()
}

function getServiceTone(serviceId: string) {
  const tones: Record<string, { soft: string; border: string; ink: string; shadow: string; gradient: string }> = {
    chatgpt: {
      soft: 'rgba(21,245,186,0.12)',
      border: 'rgba(21,245,186,0.34)',
      ink: '#0f766e',
      shadow: 'rgba(21,245,186,0.18)',
      gradient: 'linear-gradient(135deg, #15f5ba 0%, #39a7ff 48%, #7c3cff 100%)',
    },
    claude: {
      soft: 'rgba(255,154,60,0.13)',
      border: 'rgba(255,95,109,0.34)',
      ink: '#c2410c',
      shadow: 'rgba(255,95,109,0.18)',
      gradient: 'linear-gradient(135deg, #ff9a3c 0%, #ff5f6d 48%, #8f3cff 100%)',
    },
    gemini: {
      soft: 'rgba(48,213,255,0.13)',
      border: 'rgba(123,97,255,0.32)',
      ink: '#2563eb',
      shadow: 'rgba(123,97,255,0.18)',
      gradient: 'linear-gradient(135deg, #30d5ff 0%, #7b61ff 48%, #ff4ecd 100%)',
    },
    perplexity: {
      soft: 'rgba(0,229,255,0.13)',
      border: 'rgba(0,196,140,0.34)',
      ink: '#047857',
      shadow: 'rgba(0,196,140,0.18)',
      gradient: 'linear-gradient(135deg, #00e5ff 0%, #00c48c 48%, #7dff6a 100%)',
    },
    'github-copilot': {
      soft: 'rgba(109,40,217,0.1)',
      border: 'rgba(34,211,238,0.3)',
      ink: '#4338ca',
      shadow: 'rgba(34,211,238,0.14)',
      gradient: 'linear-gradient(135deg, #1f2937 0%, #6d28d9 48%, #22d3ee 100%)',
    },
    cursor: {
      soft: 'rgba(14,165,233,0.1)',
      border: 'rgba(249,115,22,0.28)',
      ink: '#0369a1',
      shadow: 'rgba(14,165,233,0.16)',
      gradient: 'linear-gradient(135deg, #111827 0%, #0ea5e9 48%, #f97316 100%)',
    },
    midjourney: {
      soft: 'rgba(240,24,122,0.1)',
      border: 'rgba(240,24,122,0.28)',
      ink: '#be185d',
      shadow: 'rgba(240,24,122,0.15)',
      gradient: 'linear-gradient(135deg, #f0187a 0%, #ff6b28 48%, #ffe431 100%)',
    },
    runway: {
      soft: 'rgba(124,60,255,0.1)',
      border: 'rgba(124,60,255,0.28)',
      ink: '#6d28d9',
      shadow: 'rgba(124,60,255,0.15)',
      gradient: 'linear-gradient(135deg, #7c3cff 0%, #39a7ff 48%, #15f5ba 100%)',
    },
  }

  return tones[serviceId] || {
    soft: 'rgba(57,167,255,0.1)',
    border: 'rgba(57,167,255,0.26)',
    ink: '#2563eb',
    shadow: 'rgba(57,167,255,0.14)',
    gradient: 'linear-gradient(135deg, #39a7ff 0%, #7c3cff 52%, #f0187a 100%)',
  }
}

function getServiceFrameStyle(serviceId: string, isSelected: boolean): CSSProperties {
  const tone = getServiceTone(serviceId)
  return {
    borderColor: isSelected ? tone.border : 'rgba(255,255,255,0.84)',
    background: `linear-gradient(135deg, ${tone.soft} 0%, rgba(255,255,255,0.97) 34%, rgba(255,255,255,0.99) 100%)`,
    boxShadow: isSelected ? `0 22px 48px ${tone.shadow}` : undefined,
  }
}

function AccountUnavailable() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/80 bg-white/90 shadow-sm shadow-slate-950/5 backdrop-blur">
      <div className="bg-slate-950 p-6 text-white">
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
    <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-xl shadow-slate-950/10 backdrop-blur">
      <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
        <div className="p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Subscription Collection</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
            AIサブスクを選んで、集めて、育てる。
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-gray-600">
            ChatGPT、Claude、Gemini、Midjourney、Runwayなどをサービスから選び、その中のプランを選んで保存できます。
            ジャンルがまたがるサービスも、コレクションでは複数タグとして扱います。
          </p>
          <SignInButton mode="modal">
            <button
              type="button"
              className="mt-6 rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              ログインしてコレクションを作る
            </button>
          </SignInButton>
        </div>
        <div className="min-h-[300px] bg-slate-950 p-6">
          <div className="grid grid-cols-2 gap-3">
            {defaultSubscriptionCatalog.slice(0, 6).map((service) => (
              <div key={service.id} className="rounded-2xl border border-white/45 bg-white/18 p-3 text-white shadow-lg shadow-black/10 backdrop-blur">
                <div className="flex size-10 items-center justify-center rounded-xl bg-white text-xs font-black text-slate-950">{service.mark}</div>
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

type PlanCardTone = ReturnType<typeof getServiceTone>

function PlanCard({
  service,
  plan,
  tone,
  subscriptions,
  saving,
  onAdd,
  onChoose,
}: {
  service: SubscriptionCatalogService
  plan: SubscriptionCatalogPlan
  tone: PlanCardTone
  subscriptions: SavedSubscription[]
  saving: boolean
  onAdd: (service: SubscriptionCatalogService, plan: SubscriptionCatalogPlan, cycle: SubscriptionBillingCycle) => void
  onChoose: (service: SubscriptionCatalogService, plan: SubscriptionCatalogPlan, cycle: SubscriptionBillingCycle) => void
}) {
  const hasYearly = Boolean(plan.yearly)
  const [cycle, setCycle] = useState<SubscriptionBillingCycle>('monthly')
  const activeCycle: SubscriptionBillingCycle = cycle === 'yearly' && hasYearly ? 'yearly' : 'monthly'
  const monthlyCostUsd = activeCycle === 'yearly' ? plan.yearly!.monthlyCostUsd : plan.monthlyCostUsd
  const summary = activeCycle === 'yearly' && plan.yearly?.summary ? plan.yearly.summary : plan.summary
  const yearlyTotal = activeCycle === 'yearly' ? plan.yearly!.monthlyCostUsd * 12 : null
  const planLabel = activeCycle === 'yearly' ? `${plan.name}（年払い）` : plan.name
  const exists = subscriptions.some(
    (item) =>
      item.serviceName.toLowerCase() === service.name.toLowerCase() &&
      (item.planName || '').toLowerCase() === planLabel.toLowerCase() &&
      item.status !== 'cancelled',
  )

  return (
    <article
      className="overflow-hidden rounded-2xl border bg-white shadow-sm shadow-slate-900/5"
      style={{
        borderColor: tone.border,
        background: `linear-gradient(180deg, ${tone.soft} 0%, rgba(255,255,255,0.98) 22%, #fff 100%)`,
      }}
    >
      <div className="h-1.5" style={{ background: tone.gradient }} />
      <div className="p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em]" style={{ color: tone.ink }}>
          {service.name}
        </p>
        <h4 className="mt-2 text-lg font-black text-brand-text">{plan.name}</h4>

        <div
          className="mt-3 inline-flex rounded-full border bg-white/80 p-0.5 text-[10px] font-black"
          style={{ borderColor: tone.border }}
          role="tablist"
          aria-label={`${plan.name}の請求周期`}
        >
          {(['monthly', 'yearly'] as const).map((option) => {
            const disabled = option === 'yearly' && !hasYearly
            const isActive = activeCycle === option
            return (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={isActive}
                disabled={disabled}
                onClick={() => !disabled && setCycle(option)}
                className="rounded-full px-2.5 py-1 transition disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: isActive ? tone.gradient : 'transparent',
                  color: isActive ? '#fff' : tone.ink,
                }}
              >
                {option === 'monthly' ? '月払い' : '年払い'}
              </button>
            )
          })}
        </div>

        <p className="mt-3 text-3xl font-black text-brand-text">{formatUsd(monthlyCostUsd)}</p>
        <p className="text-xs font-bold text-gray-400">
          {activeCycle === 'yearly' ? `年額 ${formatUsd(yearlyTotal || 0)}・月額換算` : '月払い'}
        </p>
        {activeCycle === 'yearly' && hasYearly && (
          <p className="mt-1 text-[11px] font-black text-emerald-600">
            月払いより {formatUsd(Math.max(0, plan.monthlyCostUsd - monthlyCostUsd))}/月お得
          </p>
        )}
        {!hasYearly && (
          <p className="mt-1 text-[11px] font-bold text-gray-400">このプランは月払いのみ</p>
        )}
        <p className="mt-3 min-h-[54px] text-xs font-bold leading-relaxed text-gray-500">{summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={saving || exists}
            onClick={() => onAdd(service, plan, activeCycle)}
            className="rounded-full bg-brand-text px-4 py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5 hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {exists ? '登録済み' : 'そのまま追加'}
          </button>
          <button
            type="button"
            onClick={() => onChoose(service, plan, activeCycle)}
            className="rounded-full border border-gray-200 bg-white px-4 py-2.5 text-xs font-black text-gray-500 transition hover:border-brand-text hover:text-brand-text"
          >
            編集して追加
          </button>
        </div>
      </div>
    </article>
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

  function choosePlan(service: SubscriptionCatalogService, plan: SubscriptionCatalogPlan, cycle: SubscriptionBillingCycle = 'monthly') {
    const input = planToInput(service, plan, cycle)
    setForm(input)
    setEditingId(null)
    setMessage(`${service.name} ${input.planName} をフォームに入れました。更新日やメモを調整して保存できます。`)
  }

  async function addPlan(service: SubscriptionCatalogService, plan: SubscriptionCatalogPlan, cycle: SubscriptionBillingCycle = 'monthly') {
    const input = planToInput(service, plan, cycle)
    const alreadyExists = subscriptions.some(
      (item) =>
        item.serviceName.toLowerCase() === service.name.toLowerCase() &&
        (item.planName || '').toLowerCase() === (input.planName || '').toLowerCase() &&
        item.status !== 'cancelled',
    )
    if (alreadyExists) {
      setMessage(`${service.name} ${input.planName} はすでにコレクションにあります。`)
      return
    }
    await saveSubscription(input, null)
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
      <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white/92 shadow-xl shadow-slate-950/10 backdrop-blur">
        <div className="grid gap-0 lg:grid-cols-[1fr_340px]">
          <div className="p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-3">
              <p className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                Subscription Collection
              </p>
              <UserButton />
            </div>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
              AIサブスクを、カードで集める。
            </h1>
            <p className="mt-4 max-w-3xl text-sm font-bold leading-relaxed text-gray-600">
              このアカウントに紐づけて、契約中のAIサービスを保存します。
              サービスを選んでからプランを選択でき、画像と動画など複数ジャンルのサービスもそのままタグ化します。
            </p>
          </div>
          <div className="bg-slate-950 p-5 text-white sm:p-6">
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

      <section className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-950/5 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">My Collection</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">契約中のAIサブスク</h2>
            <p className="mt-2 text-sm font-bold text-gray-500">
              いま持っているサブスクを先に確認できます。カードの色はサービスごとのアクセントに合わせています。
            </p>
          </div>
          {loading && <span className="text-xs font-bold text-gray-400">読み込み中...</span>}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ['契約中', `${activeSubscriptions.length}件`, 'from-[#111827] to-[#334155]'],
            ['月額合計', formatUsd(totalMonthly), 'from-[#334155] to-[#64748b]'],
            ['年額目安', formatUsd(yearlyEstimate), 'from-[#475569] to-[#94a3b8]'],
          ].map(([label, value, accent]) => (
            <article key={label} className={`rounded-2xl bg-gradient-to-br ${accent} p-4 text-white shadow-lg shadow-slate-900/10`}>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/70">{label}</p>
              <p className="mt-2 text-xl font-black">{value}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {subscriptions.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white/70 p-5 text-sm font-bold text-gray-500 md:col-span-2 xl:col-span-3">
              まずは下のサービスカードから、契約中または気になるAIサブスクをコレクションに追加してください。
            </div>
          )}
          {subscriptions.map((item) => {
            const service = getCatalogServiceForSubscription(item, catalog)
            const tone = getServiceTone(service?.id || item.serviceName.toLowerCase())
            return (
            <article
              key={item.id}
              className="group relative isolate overflow-hidden rounded-3xl border p-4 pl-5 shadow-lg shadow-slate-900/8 transition hover:-translate-y-0.5 hover:shadow-xl"
              style={getServiceFrameStyle(service?.id || item.serviceName.toLowerCase(), false)}
            >
              <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: tone.gradient }} />
              <div className="absolute right-0 top-0 h-14 w-24 rounded-bl-[34px] opacity-10" style={{ background: tone.gradient }} />
              <div className="h-full">
                <div className="flex min-w-0 items-start gap-3">
                    <div
                      className="flex size-12 shrink-0 items-center justify-center rounded-[18px] text-xs font-black text-white shadow-md shadow-slate-900/10"
                      style={{ background: tone.gradient }}
                    >
                      {getCollectionMark(item, catalog)}
                    </div>
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
                          <span
                            key={category}
                            className="rounded-full border bg-white/80 px-2 py-1 text-[10px] font-black text-gray-600"
                            style={{ borderColor: tone.border }}
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                </div>
                <div className="mt-4 grid gap-2 rounded-2xl border border-white/80 bg-white/72 p-3 shadow-sm shadow-slate-950/5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-gray-400">
                      {item.billingCycle === 'yearly' ? 'Annual plan' : 'Monthly plan'}
                    </p>
                    <p className="mt-1 text-xs font-bold text-gray-500">
                      {billingCycleOptions.find((cycle) => cycle.value === item.billingCycle)?.label || item.billingCycle}
                      {item.billingCycle === 'yearly' ? '・月額換算' : ''}
                    </p>
                  </div>
                  <p className="text-2xl font-black tracking-tight text-slate-950">{formatUsd(item.monthlyCostUsd)}</p>
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
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-400 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    削除
                  </button>
                </div>
              </div>
            </article>
            )
          })}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-950/5 backdrop-blur sm:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Choose Service</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">サービスを選んで、その場でプランを選択</h2>
            <p className="mt-2 text-sm font-bold text-gray-500">
              料金は公式ページをもとにした目安です。プラン情報はカタログ更新にあわせて差し替えます。
              {catalogLoading && ' 最新カタログを確認中...'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[allFilter, ...categoryOptions].map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setServiceFilter(category)}
                className={`shrink-0 rounded-full px-3 py-2 text-xs font-black transition ${
                  serviceFilter === category
                    ? 'bg-slate-950 text-white shadow-sm shadow-slate-900/15'
                    : 'border border-gray-200 bg-white text-gray-500 hover:border-slate-300 hover:text-slate-950'
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
            const tone = getServiceTone(service.id)
            return (
              <article
                key={service.id}
                className="relative isolate max-w-full overflow-hidden rounded-[30px] border shadow-sm shadow-slate-900/5 transition hover:-translate-y-0.5"
                style={getServiceFrameStyle(service.id, isSelected)}
              >
                <button type="button" onClick={() => setSelectedServiceId(service.id)} className="block w-full text-left">
                  <div className="absolute inset-y-0 left-0 w-2" style={{ background: tone.gradient }} />
                  <div className="absolute right-0 top-0 h-16 w-32 rounded-bl-[42px] opacity-10" style={{ background: tone.gradient }} />
                  <div className="flex max-w-full flex-col gap-4 p-4 pl-6 lg:flex-row lg:items-center">
                    <div className="flex min-w-0 items-center gap-3 lg:w-[240px] lg:shrink-0">
                      <div
                        className="flex size-12 shrink-0 items-center justify-center rounded-[18px] text-xs font-black text-white shadow-md shadow-slate-900/10"
                        style={{ background: tone.gradient }}
                      >
                        {service.mark}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-black text-brand-text">{service.name}</h3>
                        <span
                          className="mt-1 inline-flex rounded-full border px-2 py-1 text-[10px] font-black"
                          style={{ borderColor: tone.border, color: tone.ink, backgroundColor: 'rgba(255,255,255,0.72)' }}
                        >
                          {service.vibe}
                        </span>
                      </div>
                    </div>
                    <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                      {service.categories.map((category) => (
                        <span
                          key={category}
                          className="rounded-full border border-white/70 bg-white/80 px-2.5 py-1.5 text-[11px] font-black text-gray-600 shadow-sm shadow-slate-900/5"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                    <span
                      className="rounded-full px-4 py-2 text-center text-xs font-black text-white shadow-sm lg:ml-auto lg:shrink-0"
                      style={{ background: isSelected ? tone.gradient : '#191724' }}
                    >
                      {isSelected ? 'プランを表示中' : 'プランを見る'}
                    </span>
                  </div>
                </button>

                {isSelected && (
                  <div className="border-t border-white/80 bg-white/64 p-4 pl-6">
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
                      {service.plans.map((plan) => (
                        <PlanCard
                          key={plan.id}
                          service={service}
                          plan={plan}
                          tone={tone}
                          subscriptions={subscriptions}
                          saving={saving}
                          onAdd={addPlan}
                          onChoose={choosePlan}
                        />
                      ))}
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
          className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-950/5 backdrop-blur"
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
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-gray-500">プラン名</span>
              <input
                value={form.planName}
                onChange={(event) => updateForm('planName', event.target.value)}
                placeholder="Pro, Team, API..."
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black text-gray-500">ジャンル（複数可・カンマ区切り）</span>
              <input
                value={form.category}
                onChange={(event) => updateForm('category', event.target.value)}
                placeholder="チャット, 画像, 動画"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-gray-500">請求周期</span>
                <select
                  value={form.billingCycle}
                  onChange={(event) => updateForm('billingCycle', event.target.value as SubscriptionInput['billingCycle'])}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black text-gray-500">ステータス</span>
                <select
                  value={form.status}
                  onChange={(event) => updateForm('status', event.target.value as SubscriptionInput['status'])}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-bold text-brand-text outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
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
          <section className="rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-slate-950/5 backdrop-blur">
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
                      className="h-full rounded-full bg-gradient-to-r from-[#111827] via-[#334155] to-[#94a3b8]"
                      style={{ width: `${Math.max(8, Math.min(100, (entry.total / Math.max(1, totalMonthly)) * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

