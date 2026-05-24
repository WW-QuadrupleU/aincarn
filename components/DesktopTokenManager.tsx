'use client'

import { useEffect, useState } from 'react'

type AgentToken = {
  id: string
  label: string
  deviceId: string
  deviceName: string
  status: 'active' | 'revoked'
  lastUsedAt: string | null
  createdAt: string
}

function formatDate(value: string | null) {
  if (!value) return '未使用'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未使用'
  return new Intl.DateTimeFormat('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(date)
}

export default function DesktopTokenManager() {
  const [tokens, setTokens] = useState<AgentToken[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadTokens() {
    const response = await fetch('/api/agent/tokens', { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Desktop device list failed')
    setTokens(data.tokens || [])
  }

  useEffect(() => {
    loadTokens().catch((error) => setMessage(error instanceof Error ? error.message : '読み込みに失敗しました'))
  }, [])

  async function revokeToken(id: string) {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/agent/tokens', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '失効できませんでした')
      await loadTokens()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '失効できませんでした')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-[32px] border border-white/80 bg-white/90 p-6 shadow-xl shadow-slate-950/8 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Desktop Devices</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
        Aincarn Agentの接続端末を管理する。
      </h1>
      <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-slate-600">
        Desktopアプリ側で「ブラウザでログイン」を押すと、このアカウントに端末が紐づきます。
        ここでは接続済み端末の確認と失効だけを行います。
      </p>

      {message && <p className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm font-bold text-rose-700">{message}</p>}

      <div className="mt-6 grid gap-3">
        {tokens.map((token) => (
          <article key={token.id} className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-slate-950">{token.label}</h2>
                <span className={`rounded-full px-2 py-1 text-[10px] font-black ${token.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {token.status}
                </span>
              </div>
              <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
                Device: {token.deviceName || 'Desktop'} / {token.deviceId || '未紐づけ'}
              </p>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Last used: {formatDate(token.lastUsedAt)} / Created: {formatDate(token.createdAt)}
              </p>
            </div>
            {token.status === 'active' && (
              <button
                type="button"
                onClick={() => revokeToken(token.id)}
                disabled={loading}
                className="rounded-2xl border border-rose-200 bg-white px-4 py-2 text-xs font-black text-rose-600 transition hover:bg-rose-50 disabled:opacity-50"
              >
                失効
              </button>
            )}
          </article>
        ))}
        {tokens.length === 0 && (
          <p className="rounded-3xl border border-dashed border-slate-300 p-5 text-sm font-bold text-slate-500">
            まだ接続済みのDesktop端末はありません。Desktopアプリからログインしてください。
          </p>
        )}
      </div>
    </section>
  )
}
