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
  revokedAt: string | null
}

function formatDate(value: string | null) {
  if (!value) return '未使用'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未使用'
  return new Intl.DateTimeFormat('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default function DesktopTokenManager() {
  const [tokens, setTokens] = useState<AgentToken[]>([])
  const [newToken, setNewToken] = useState('')
  const [label, setLabel] = useState('My Desktop')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadTokens() {
    const response = await fetch('/api/agent/tokens', { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Desktop token list failed')
    setTokens(data.tokens || [])
  }

  useEffect(() => {
    loadTokens().catch((error) => setMessage(error instanceof Error ? error.message : '読み込みに失敗しました'))
  }, [])

  async function createToken() {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/agent/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'トークンを発行できませんでした')
      setNewToken(data.token)
      await loadTokens()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'トークンを発行できませんでした')
    } finally {
      setLoading(false)
    }
  }

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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Desktop Access</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
            Aincarn Agentを、このアカウントに接続する。
          </h1>
          <p className="mt-4 max-w-2xl text-sm font-bold leading-relaxed text-slate-600">
            DesktopアプリにはOpenAIキーを置かず、ユーザー別トークンでVercel中継APIに接続します。
            トークンは初回利用時に端末IDへ紐づき、ここからいつでも失効できます。
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50/80 p-4 sm:grid-cols-[1fr_auto]">
        <input
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold outline-none"
          placeholder="端末名"
        />
        <button
          type="button"
          onClick={createToken}
          disabled={loading}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-50"
        >
          トークンを発行
        </button>
      </div>

      {newToken && (
        <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Show once</p>
          <p className="mt-2 text-sm font-bold text-emerald-950">
            このトークンは一度だけ表示されます。Desktopアプリ右上の「Desktop接続」に貼り付けてください。
          </p>
          <code className="mt-3 block overflow-auto rounded-2xl bg-white p-3 text-xs font-bold text-slate-950">
            {newToken}
          </code>
        </div>
      )}

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
                Device: {token.deviceName || '未紐づけ'} / {token.deviceId || 'first useで端末固定'}
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
            まだDesktop接続トークンはありません。
          </p>
        )}
      </div>
    </section>
  )
}
