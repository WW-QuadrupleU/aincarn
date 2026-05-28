'use client'

import { useState } from 'react'
import type { LabModelOutput } from '@/lib/aincarn-lab'

const MODEL_ACCENT: Array<{ from: string; via: string; to: string; mark: string }> = [
  { from: '#15f5ba', via: '#39a7ff', to: '#7c3cff', mark: 'CG' },
  { from: '#30d5ff', via: '#7b61ff', to: '#ff4ecd', mark: 'GM' },
  { from: '#ff9a3c', via: '#ff5f6d', to: '#8f3cff', mark: 'CL' },
]

type TextBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }

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

function cleanLine(line: string) {
  return line
    .replace(/^#{1,4}\s*/, '')
    .replace(/^H[2-4][：:]\s*/, '')
    .trim()
}

function isBulletLine(line: string) {
  return /^([•・◦\-*]|[0-9]+[.)])\s+/.test(line.trim())
}

function stripBullet(line: string) {
  return line.trim().replace(/^([•・◦\-*]|[0-9]+[.)])\s+/, '').trim()
}

function isHeadingLine(line: string, nextLine?: string) {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (/^#{1,4}\s+/.test(trimmed) || /^H[2-4][：:]/.test(trimmed)) return true
  if (trimmed.length > 42) return false
  if (/[。.!?！？]$/.test(trimmed)) return false
  if (isBulletLine(trimmed)) return false
  return Boolean(nextLine && nextLine.trim())
}

function parseTextBlocks(text: string): TextBlock[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())

  const blocks: TextBlock[] = []
  let paragraph: string[] = []
  let listItems: string[] = []

  const flushParagraph = () => {
    const body = paragraph.join(' ').trim()
    if (body) blocks.push({ type: 'paragraph', text: body })
    paragraph = []
  }

  const flushList = () => {
    if (listItems.length > 0) blocks.push({ type: 'list', items: listItems })
    listItems = []
  }

  lines.forEach((line, index) => {
    if (!line) {
      flushParagraph()
      flushList()
      return
    }

    if (isBulletLine(line)) {
      flushParagraph()
      listItems.push(stripBullet(line))
      return
    }

    if (isHeadingLine(line, lines[index + 1])) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'heading', text: cleanLine(line) })
      return
    }

    flushList()
    paragraph.push(cleanLine(line))
  })

  flushParagraph()
  flushList()
  return blocks
}

function summarizeOutput(output: LabModelOutput) {
  const fallback = output.sections
    .map((section) => section.body || section.bullets?.join('。') || '')
    .join('。')
  const source = output.brief || fallback
  const blocks = parseTextBlocks(source)
  const firstParagraph = blocks.find((block): block is { type: 'paragraph'; text: string } => block.type === 'paragraph')?.text
  const firstList = blocks.find((block): block is { type: 'list'; items: string[] } => block.type === 'list')?.items[0]
  const summary = firstParagraph || firstList || source.replace(/\s+/g, ' ').trim()
  return summary.length > 120 ? `${summary.slice(0, 118)}...` : summary
}

function FormattedText({ text, gradient }: { text: string; gradient: string }) {
  const blocks = parseTextBlocks(text)
  if (blocks.length === 0) return null

  return (
    <div className="mt-5 space-y-4">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          return (
            <h4 key={`${block.text}-${index}`} className="pt-2 text-[11px] font-black uppercase tracking-[0.16em] text-white/58">
              {block.text}
            </h4>
          )
        }
        if (block.type === 'list') {
          return (
            <ul key={`list-${index}`} className="space-y-1.5">
              {block.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm font-semibold leading-relaxed text-white/86">
                  <span
                    className="mt-1.5 inline-flex size-1.5 shrink-0 rounded-full"
                    style={{ background: gradient }}
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )
        }
        return (
          <p key={`${block.text}-${index}`} className="text-sm font-semibold leading-relaxed text-white/86">
            {block.text}
          </p>
        )
      })}
    </div>
  )
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
        <h2 className="text-xl font-black tracking-tight text-slate-950">モデル別アウトプット</h2>
      </div>
      <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
        同じ条件で出した各モデルの回答を、要約と詳細の両方で比較できます。
      </p>

      <div className="mt-5 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Output Digest</p>
            <h3 className="mt-1 text-base font-black tracking-tight text-slate-950">モデル別アウトプット要約</h3>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-slate-500 ring-1 ring-slate-200">
            {outputs.length} models
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {outputs.map((output, index) => {
            const itemAccent = modelAccent(index)
            return (
              <button
                key={`${output.model}-summary`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  index === activeIndex ? 'border-slate-950 shadow-sm shadow-slate-950/10' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="grid size-7 place-items-center rounded-full text-[9px] font-black text-white"
                    style={{ background: `linear-gradient(135deg, ${itemAccent.from} 0%, ${itemAccent.via} 48%, ${itemAccent.to} 100%)` }}
                  >
                    {modelMark(output.model, index)}
                  </span>
                  <p className="min-w-0 truncate text-xs font-black text-slate-950">{output.model}</p>
                </div>
                <p className="mt-3 line-clamp-4 text-xs font-bold leading-relaxed text-slate-600">
                  {summarizeOutput(output)}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {outputs.map((output, index) => {
          const isActive = index === activeIndex
          const itemAccent = modelAccent(index)
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
              style={isActive ? { background: `linear-gradient(135deg, ${itemAccent.from} 0%, ${itemAccent.via} 48%, ${itemAccent.to} 100%)` } : undefined}
            >
              <span
                className="grid size-6 place-items-center rounded-full text-[9px] font-black text-white shadow-sm"
                style={{ background: `linear-gradient(135deg, ${itemAccent.from} 0%, ${itemAccent.via} 48%, ${itemAccent.to} 100%)` }}
              >
                {modelMark(output.model, index)}
              </span>
              <span className="max-w-[200px] truncate">{output.model}</span>
            </button>
          )
        })}
      </div>

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

          <FormattedText text={active.brief} gradient={gradient} />

          {active.sections.length > 0 && (
            <div className="mt-5 space-y-4">
              {active.sections.map((section) => (
                <div key={`${active.model}-${section.heading}`} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/55">{section.heading}</p>
                  {section.body && (
                    <p className="mt-2 whitespace-pre-wrap text-sm font-semibold leading-relaxed text-white/86">{section.body}</p>
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
          )}
        </div>
      </article>
    </section>
  )
}
