import type { Metadata } from 'next'
import Link from 'next/link'
import { labCategories } from '@/lib/aincarn-lab'

export const metadata: Metadata = {
  title: 'Aincarn Lab',
  description:
    'Aincarn Labは、その時点の最新AIを同じ条件で比較し、文章作成、コード生成、調査・要約などの用途別に結果を蓄積する比較ログです。',
}

export default function LabIndexPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="overflow-hidden rounded-[36px] border border-white/80 bg-white/84 shadow-xl shadow-slate-950/5 backdrop-blur-xl">
        <div className="grid gap-0 lg:grid-cols-[1fr_380px]">
          <div className="p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Aincarn Lab</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-6xl">
              その時点のAIを、
              <span className="block bg-gradient-to-r from-indigo-600 via-sky-500 to-fuchsia-500 bg-clip-text text-transparent">
                同じ条件で比べる。
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm font-bold leading-relaxed text-slate-600 sm:text-base">
              Aincarn Labは、主要AIに同じタスクを実行させ、出力の傾向、使いやすさ、料金感を記録していく比較ログです。
              単発の記事ではなく、月ごとの検証結果を同じページに蓄積します。
            </p>
          </div>
          <div className="relative min-h-64 overflow-hidden bg-slate-950 p-6 text-white">
            <div className="absolute inset-x-6 top-6 h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-rose-300" />
            <div className="mt-12 grid gap-3">
              {['Same prompt', 'Latest models', 'Monthly log'].map((item, index) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">Step {index + 1}</p>
                  <p className="mt-1 text-lg font-black">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {labCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/lab/${category.slug}`}
            className={`group relative overflow-hidden rounded-[28px] border border-white/80 bg-gradient-to-br ${category.soft} p-6 shadow-sm shadow-slate-950/5 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-950/10`}
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${category.accent}`} />
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Compare Log</p>
            <h2 className="mt-7 text-2xl font-black tracking-tight text-slate-950">{category.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">{category.description}</p>
            <div className="mt-6 rounded-2xl border border-white/80 bg-white/70 p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">First test</p>
              <p className="mt-1 text-sm font-black text-slate-800">{category.taskExample}</p>
            </div>
            <span className={`mt-6 inline-flex rounded-full bg-gradient-to-r ${category.accent} px-4 py-2 text-xs font-black text-white`}>
              ログを見る
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-8 rounded-[32px] border border-white/80 bg-white/82 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Rule</p>
        <h2 className="mt-2 text-2xl font-black text-slate-950">比較ログの基本ルール</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {['比較日を明記する', '同じプロンプトで試す', '出力全文は載せすぎない', '今回の条件で評価する'].map((rule) => (
            <div key={rule} className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm font-bold text-slate-700">
              {rule}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
