'use client'

import Link from 'next/link'
import { SignInButton, useUser } from '@clerk/nextjs'
import { useState } from 'react'

export type PricingPlan = {
  tier: string
  label: string
  priceJpy: number
  description: string
  bullets: string[]
  recommended: boolean
  available: boolean
}

type AiosPricingProps = {
  plans: PricingPlan[]
  currentTier: string
}

function formatJpy(amount: number) {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(amount)
}

export default function AiosPricing({ plans, currentTier }: AiosPricingProps) {
  const { isSignedIn, isLoaded } = useUser()
  const [loadingTier, setLoadingTier] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function readCheckoutResponse(response: Response) {
    const text = await response.text()
    if (!text) return {}
    try {
      return JSON.parse(text) as { url?: string; error?: string }
    } catch {
      return {
        error: response.ok
          ? 'Checkoutの応答を読み取れませんでした。時間をおいて再度お試しください。'
          : `Checkout APIでエラーが発生しました（HTTP ${response.status}）`,
      }
    }
  }

  async function upgrade(tier: string) {
    setLoadingTier(tier)
    setError('')
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const data = await readCheckoutResponse(response)
      if (!response.ok) throw new Error(data.error || 'チェックアウトを開始できませんでした')
      if (data.url) window.location.href = data.url
    } catch (error) {
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました')
    } finally {
      setLoadingTier(null)
    }
  }

  async function moveToFree() {
    setLoadingTier('free')
    setError('')
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flow: 'cancel' }),
      })
      const data = await readCheckoutResponse(response)
      if (!response.ok) throw new Error(data.error || '解約手続きを開始できませんでした')
      if (data.url) window.location.href = data.url
    } catch (error) {
      setError(error instanceof Error ? error.message : '不明なエラーが発生しました')
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Aincarn OS Pricing</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
          目標に合うAIを、無理なく使い続ける。
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm font-bold leading-relaxed text-slate-600">
          AI実行は1回ごとにAincarnが代理で叩く回数です。プラン生成や状態の保存は枠を消費しません。
          プラン変更時の請求額やクレジットは、Stripeの確認画面で確認してから確定できます。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => {
          const isFree = plan.tier === 'free'
          const isCurrent = currentTier === plan.tier
          const disabled = !isFree && !plan.available
          return (
            <article
              key={plan.tier}
              className={`relative flex h-full min-h-[344px] flex-col rounded-3xl border bg-white p-6 shadow-sm shadow-slate-950/5 ${
                isCurrent
                  ? 'border-slate-950 ring-2 ring-slate-200'
                  : plan.recommended
                    ? 'border-indigo-400 ring-2 ring-indigo-100'
                    : 'border-slate-200'
              }`}
            >
              {isCurrent && (
                <span className="absolute -top-3 right-6 rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow">
                  Current
                </span>
              )}
              {plan.recommended && (
                <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white shadow">
                  Recommended
                </span>
              )}
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{plan.label}</p>
              <p className="mt-3 text-3xl font-black text-slate-950">
                {plan.priceJpy === 0 ? '無料' : formatJpy(plan.priceJpy)}
                {plan.priceJpy > 0 && <span className="text-sm font-bold text-slate-500"> / 月</span>}
              </p>
              <p className="mt-2 min-h-[38px] text-xs font-bold leading-relaxed text-slate-500">{plan.description}</p>

              <ul className="mt-5 grid gap-2 text-sm font-bold text-slate-700">
                {plan.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 inline-flex size-1.5 shrink-0 rounded-full bg-indigo-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-6">
                {isCurrent ? (
                  <Link
                    href="/tools/aios"
                    className="inline-flex w-full justify-center rounded-full border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-black text-slate-500"
                  >
                    利用中のプラン
                  </Link>
                ) : isFree && currentTier !== 'free' && isSignedIn ? (
                  <button
                    type="button"
                    disabled={loadingTier === 'free'}
                    onClick={moveToFree}
                    className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    {loadingTier === 'free' ? 'Stripeへ移動中...' : '解約してFreeへ'}
                  </button>
                ) : isFree ? (
                  <Link
                    href="/tools/aios"
                    className="inline-flex w-full justify-center rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:border-slate-400"
                  >
                    そのまま使う
                  </Link>
                ) : isLoaded && !isSignedIn ? (
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                    >
                      ログインしてアップグレード
                    </button>
                  </SignInButton>
                ) : (
                  <button
                    type="button"
                    disabled={disabled || loadingTier === plan.tier}
                    onClick={() => upgrade(plan.tier)}
                    className="w-full rounded-full bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loadingTier === plan.tier
                      ? 'Stripeへ移動中...'
                      : disabled
                        ? '準備中'
                        : currentTier === 'free'
                          ? `${plan.label}にアップグレード`
                          : `${plan.label}に変更`}
                  </button>
                )}
                {disabled && (
                  <p className="mt-2 text-[11px] font-bold text-amber-700">
                    Stripeの価格IDが設定されていません。管理者にご連絡ください。
                  </p>
                )}
              </div>
            </article>
          )
        })}
      </section>

      {error && (
        <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
          {error}
        </p>
      )}

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-xl font-black text-slate-950">よくある質問</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm font-black text-slate-950">月の途中でプラン変更できますか？</dt>
            <dd className="mt-1 text-sm font-bold text-slate-600">
              Stripeの請求ポータルからいつでも変更できます。変更時の請求額やクレジットは、確定前の確認画面に表示されます。
            </dd>
          </div>
          <div>
            <dt className="text-sm font-black text-slate-950">解約したらどうなりますか？</dt>
            <dd className="mt-1 text-sm font-bold text-slate-600">
              現行請求期間の終了までは有料機能を使えます。期間終了後は自動的にFreeになります。
            </dd>
          </div>
          <div>
            <dt className="text-sm font-black text-slate-950">AI実行枠を超えたら？</dt>
            <dd className="mt-1 text-sm font-bold text-slate-600">
              有料プランでは契約の更新日ごとに実行枠がリセットされます。Freeでは毎月1日にリセットされます。
            </dd>
          </div>
          <div>
            <dt className="text-sm font-black text-slate-950">支払いはどの方法ですか？</dt>
            <dd className="mt-1 text-sm font-bold text-slate-600">
              クレジットカード、Apple Pay、Google PayをStripe経由で受け付けます。
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}
