'use client'

import { useMemo } from 'react'
import type { LabModelOutput } from '@/lib/aincarn-lab'

function rawOutputText(output: LabModelOutput) {
  if (output.raw) return output.raw
  if (output.brief) return output.brief
  return output.sections
    .map((section) => {
      const body = section.body ? `\n${section.body}` : ''
      const bullets = section.bullets?.length ? `\n${section.bullets.map((bullet) => `・${bullet}`).join('\n')}` : ''
      return `${section.heading}${body}${bullets}`.trim()
    })
    .filter(Boolean)
    .join('\n\n')
}

function extractHtml(source: string) {
  const fenced = source.match(/```(?:html)?\s*([\s\S]*?)```/i)
  const candidate = fenced?.[1] || source
  const htmlStart = candidate.search(/<!doctype html|<html[\s>]/i)
  if (htmlStart < 0) return ''
  return candidate.slice(htmlStart).trim()
}

function withPreviewShell(html: string) {
  const storageShim = `<script>
try {
  window.localStorage.setItem('__aincarn_preview_test__', '1');
  window.localStorage.removeItem('__aincarn_preview_test__');
} catch (error) {
  const store = {};
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
      setItem: (key, value) => { store[key] = String(value); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((key) => delete store[key]); },
      key: (index) => Object.keys(store)[index] || null,
      get length() { return Object.keys(store).length; }
    }
  });
}
</script>`

  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${storageShim}`)
  }
  return `${storageShim}${html}`
}

export default function LabCodePreviews({ outputs }: { outputs: LabModelOutput[] }) {
  const previews = useMemo(
    () =>
      outputs
        .map((output) => ({
          model: output.model,
          html: extractHtml(rawOutputText(output)),
        }))
        .filter((preview) => preview.html),
    [outputs],
  )

  if (previews.length === 0) return null

  return (
    <section className="mt-6 rounded-[28px] border border-white/80 bg-white/92 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Live Preview</p>
          <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">生成アプリを触って比較</h2>
        </div>
        <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
          sandboxed iframe
        </span>
      </div>
      <p className="mt-3 max-w-3xl text-xs font-bold leading-relaxed text-slate-500">
        Notionに保存した各モデルのHTML出力を、ページ内の隔離プレビューとして表示しています。外部通信や親ページへの干渉を避けるため、sandbox付きiframeで実行します。
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        {previews.map((preview, index) => (
          <article key={preview.model} className="overflow-hidden rounded-[24px] border border-slate-200 bg-slate-50 shadow-sm shadow-slate-950/5">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Preview {index + 1}</p>
                <h3 className="truncate text-sm font-black text-slate-950">{preview.model}</h3>
              </div>
            </div>
            <iframe
              title={`${preview.model} generated app preview`}
              srcDoc={withPreviewShell(preview.html)}
              sandbox="allow-scripts allow-forms allow-modals"
              loading="lazy"
              className="h-[420px] w-full bg-white"
            />
          </article>
        ))}
      </div>
    </section>
  )
}
