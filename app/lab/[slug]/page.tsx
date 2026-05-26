import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getLabCategory, labCategories } from '@/lib/aincarn-lab'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return labCategories.map((category) => ({ slug: category.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = getLabCategory(slug)
  if (!category) return {}

  return {
    title: category.title,
    description: category.description,
  }
}

export default async function LabDetailPage({ params }: Props) {
  const { slug } = await params
  const category = getLabCategory(slug)
  if (!category) notFound()

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/lab" className="text-xs font-black text-slate-500 hover:text-slate-950">
        ← Aincarn Lab
      </Link>

      <section className={`mt-5 overflow-hidden rounded-[36px] border border-white/80 bg-gradient-to-br ${category.soft} shadow-xl shadow-slate-950/5`}>
        <div className="p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Aincarn Lab / {category.shortTitle}</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">{category.title}</h1>
          <p className="mt-5 max-w-3xl text-sm font-bold leading-relaxed text-slate-600 sm:text-base">{category.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {category.evaluation.map((item) => (
              <span key={item} className="rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm shadow-slate-950/5">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="rounded-[28px] border border-white/80 bg-white/86 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Latest Log</p>
            {category.logs.map((log) => (
              <article key={`${log.date}-${log.title}`} className="mt-5 rounded-3xl border border-slate-200/80 bg-slate-50/80 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
                    {log.date}
                  </span>
                  <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 ring-1 ring-slate-200">
                    {log.status === 'template' ? 'Template' : 'Published'}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-black text-slate-950">{log.title}</h2>
                <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{log.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {log.models.map((model) => (
                    <span key={model} className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 ring-1 ring-slate-200">
                      {model}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {log.findings.map((finding) => (
                    <div key={finding} className="rounded-2xl border border-white/80 bg-white/72 p-4 text-sm font-bold text-slate-700">
                      {finding}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="rounded-[28px] border border-white/80 bg-white/86 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Evaluation Format</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">実測後に追記する項目</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {['比較モデルと実行日', '使用プロンプト', '結果表', '各AIの出力傾向', 'Aincarn所感', '次回確認すること'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm font-bold text-slate-700">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="rounded-[28px] border border-white/80 bg-white/86 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl lg:sticky lg:top-24 lg:self-start">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Data Prompt</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">比較データ収集用プロンプト</h2>
          <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
            各AIに同じプロンプトを投げ、回答、実行日、モデル名、所要時間、料金目安を別途記録します。
          </p>
          <pre className="mt-4 max-h-[520px] overflow-auto rounded-3xl bg-slate-950 p-4 text-xs font-bold leading-relaxed text-white/86">
            {category.firstPrompt}
          </pre>
        </aside>
      </section>
    </main>
  )
}
