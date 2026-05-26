'use client'

import { useState } from 'react'
import type { LabModelOutput } from '@/lib/aincarn-lab'

const MODEL_ACCENT: Array<{ from: string; via: string; to: string; mark: string }> = [
  { from: '#15f5ba', via: '#39a7ff', to: '#7c3cff', mark: 'CG' },
  { from: '#30d5ff', via: '#7b61ff', to: '#ff4ecd', mark: 'GM' },
  { from: '#ff9a3c', via: '#ff5f6d', to: '#8f3cff', mark: 'CL' },
]

function modelAccent(index: number) {
  return MODEL_ACCENT[index % MODEL_ACCENT.length]
}

function modelMark(name: string, index: number) {
  const upper = name.toUpperCase()
  if (upper.includes('CHATGPT') || upper.includes('GPT')) return 'CG'
  if (upper.includes('CLAUDE')) return 'CL'
  if (upper.includes('GEMINI')) return 'GM'
  return modelAccent(index).mark
}

export default function LabModelTabs({ outputs }: { outputs: LabModelOutput[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  if (!outputs.length) return null

  const active = outputs[activeIndex] ?? outputs[0]
  const accent = modelAccent(activeIndex)
  const gradient = `linear-gradient(135deg, ${accent.from} 0%, ${accent.via} 48%, ${accent.to} 100%)`

  return (
    <section className="rounded-[28px] border border-white/80 bg-white/86 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Per-model output</p>
        <h2 className="text-xl font-black tracking-tight text-slate-950">モデル別の実出力</h2>
      </div>
      <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
        同じプロンプトに対する3モデルの出力をタブで切り替えて比較できます。
      </p>

      {/* タブ */}
      <div className="mt-4 flex flex-wrap gap-2">
        {outputs.map((output, index) => {
          const isActive = index === activeIndex
          const a = modelAccent(index)
          return (
            <button
              key={output.model}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`group flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black transition ${
                isActive
                  ? 'border-transparent text-white shadow-md shadow-slate-950/15'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
              }`}
              style={isActive ? { background: `linear-gradient(135deg, ${a.from} 0%, ${a.via} 48%, ${a.to} 100%)` } : undefined}
            >
              <span
                className="grid size-6 place-items-center rounded-full text-[9px] font-black text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${a.from} 0%, ${a.via} 48%, ${a.to} 100%)` }}
              >
                {modelMark(output.model, index)}
              </span>
              <span className="truncate max-w-[200px]">{output.model}</span>
            </button>
          )
        })}
      </div>

      {/* 黒ボックス */}
      <article className="mt-4 overflow-hidden rounded-[24px] bg-slate-950 text-slate-100 shadow-2xl shadow-slate-950/30">
        <div className="h-1 w-full" style={{ background: gradient }} />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="grid size-10 place-items-center rounded-2xl text-xs font-black text-white shadow-md shadow-slate-950/30"
              style={{ background: gradient }}
            >
              {modelMark(active.model, activeIndex)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/55">Model</p>
              <h3 className="mt-0.5 truncate text-base font-black tracking-tight text-white">{active.model}</h3>
            </div>
          </div>

          <p className="mt-5 text-sm font-bold leading-relaxed text-white/82">{active.brief}</p>

          <div className="mt-5 space-y-4">
            {active.sections.map((section) => (
              <div key={`${active.model}-${section.heading}`} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/55">{section.heading}</p>
                {section.body && (
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-white/86 whitespace-pre-wrap">{section.body}</p>
                )}
                {section.bullets && section.bullets.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-white/86">
                        <span
                          className="mt-1.5 inline-flex size-1.5 shrink-0 rounded-full"
                          style={{ background: gradient }}
                          aria-hidden="true"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  )
}
