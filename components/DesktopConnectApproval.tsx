'use client'

import { useState } from 'react'

export default function DesktopConnectApproval({ userCode }: { userCode: string }) {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  async function approve() {
    setLoading(true)
    setStatus('')
    try {
      const response = await fetch('/api/agent/device/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userCode }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || '接続を承認できませんでした')
      setStatus('承認しました。Desktopアプリに戻ると自動で接続されます。')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '接続を承認できませんでした')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-[32px] border border-white/80 bg-white/90 p-6 text-center shadow-xl shadow-slate-950/8 backdrop-blur-xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-400">Aincarn Agent Login</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Desktopアプリを接続しますか？</h1>
      <p className="mt-4 text-sm font-bold leading-relaxed text-slate-600">
        この操作により、現在ログイン中のAincarnアカウントのプランと利用枠でDesktopアプリを使えるようになります。
      </p>
      <div className="mt-6 rounded-3xl bg-slate-950 px-5 py-4 font-mono text-3xl font-black tracking-[0.18em] text-white">
        {userCode}
      </div>
      <button
        type="button"
        onClick={approve}
        disabled={loading}
        className="mt-6 rounded-full bg-slate-950 px-7 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        接続を承認
      </button>
      {status && <p className="mt-4 text-sm font-bold text-slate-600">{status}</p>}
    </section>
  )
}
