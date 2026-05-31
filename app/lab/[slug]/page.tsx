import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import LabCodePreviews from '@/components/LabCodePreviews'
import LabModelTabs from '@/components/LabModelTabs'
import { getLabCategory, labCategories } from '@/lib/aincarn-lab'
import type { LabModelOutput, LabScoreRow } from '@/lib/aincarn-lab'
import { fetchLabOutputsFromNotion } from '@/lib/aincarn-lab-notion'

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return labCategories.map((category) => ({ slug: category.slug }))
}

// 5 分ごとに ISR で再生成。Notion 編集後 5 分以内に反映される。
export const revalidate = 300

function normalizeModelName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function getModelScore(model: string, scoreTable: LabScoreRow[] | undefined) {
  if (!scoreTable) return 0
  return scoreTable.reduce((total, row) => total + (row.scores[model] || 0), 0)
}

function rankModels(models: string[], scoreTable: LabScoreRow[] | undefined) {
  return [...models].sort((a, b) => {
    const scoreDiff = getModelScore(b, scoreTable) - getModelScore(a, scoreTable)
    if (scoreDiff !== 0) return scoreDiff
    return models.indexOf(a) - models.indexOf(b)
  })
}

function sortOutputsByModelRank(outputs: LabModelOutput[] | undefined, rankedModels: string[]) {
  if (!outputs) return outputs

  const remaining = [...outputs]
  const sorted: LabModelOutput[] = []
  for (const model of rankedModels) {
    const modelKey = normalizeModelName(model)
    const index = remaining.findIndex((output) => {
      const outputKey = normalizeModelName(output.model)
      return outputKey === modelKey || outputKey.includes(modelKey) || modelKey.includes(outputKey)
    })
    if (index >= 0) {
      const [output] = remaining.splice(index, 1)
      sorted.push(output)
    }
  }

  return [...sorted, ...remaining]
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

  // ページ表示順:
  //  1. 戻る導線 + カテゴリ概要 (タイトル + 評価指標 + 評価対象)
  //  2. 最新ログ概要 (タイトル + 比較条件 + サマリー)
  //  3. 評価サマリー (スコア表 + モデル別の使いどころ)
  //  4. モデル別の実出力 (タブ切替の黒ボックス)
  //  5. 比較データ収集用プロンプト (常に白文字で表示)
  const log = category.logs[0]

  // Notion からモデル別出力を取得 (失敗すれば null → 埋め込みデータにフォールバック)。
  // ISR で 5 分キャッシュされるので Notion 編集後の反映タイムラグはおよそ 5 分。
  const notionOutputs = await fetchLabOutputsFromNotion(slug)
  const outputs = notionOutputs && notionOutputs.length > 0 ? notionOutputs : log?.outputs
  const rankedModels = log ? rankModels(log.models, log.scoreTable) : []
  const rankedOutputs = sortOutputsByModelRank(outputs, rankedModels)
  const promptSection = (
    <section className="mt-6 rounded-[28px] border border-white/80 bg-white/86 p-5 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:p-6">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Data Prompt</p>
      <h2 className="mt-2 text-xl font-black tracking-tight text-slate-950">比較データ収集用プロンプト</h2>
      <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
        各AIに同じプロンプトを投げ、回答、実行日、モデル名、所要時間、料金目安を別途記録します。
      </p>
      <pre className="mt-4 overflow-auto rounded-3xl bg-slate-950 p-5 text-xs font-bold leading-relaxed text-white whitespace-pre-wrap break-words">
        {category.firstPrompt}
      </pre>
    </section>
  )

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/lab" className="text-xs font-black text-slate-500 hover:text-slate-950">
        ← Aincarn Lab
      </Link>

      {/* 1. ヒーロー */}
      <section className={`mt-5 overflow-hidden rounded-[36px] border border-white/80 bg-gradient-to-br ${category.soft} shadow-xl shadow-slate-950/5`}>
        <div className="p-6 sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Aincarn Lab / {category.shortTitle}
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
            {category.title}
          </h1>
          <p className="mt-5 max-w-3xl text-sm font-bold leading-relaxed text-slate-600 sm:text-base">
            {category.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {category.evaluation.map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/80 bg-white/72 px-3 py-1.5 text-xs font-black text-slate-600 shadow-sm shadow-slate-950/5"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 2. 最新ログのトップサマリー */}
      {log && (
        <section className="mt-8 rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-950 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white">
              {log.date}
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 ring-1 ring-slate-200">
              {log.status === 'template' ? 'Template' : 'Published'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {rankedModels.map((model) => (
                <span
                  key={model}
                  className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600"
                >
                  {model}
                </span>
              ))}
            </div>
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">{log.title}</h2>
          <p className="mt-3 text-sm font-bold leading-relaxed text-slate-700 sm:text-base">{log.summary}</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {log.findings.map((finding) => (
              <div
                key={finding}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 text-sm font-bold leading-relaxed text-slate-700"
              >
                {finding}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. 評価サマリー (Score Table + Roles) */}
      {log?.scoreTable && log.scoreTable.length > 0 && (
        <section className="mt-6 rounded-[28px] border border-white/80 bg-white/92 p-6 shadow-sm shadow-slate-950/5 backdrop-blur-xl sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Evaluation</p>
            <h2 className="text-xl font-black tracking-tight text-slate-950">出力条件への評価サマリー</h2>
          </div>
          <p className="mt-2 text-xs font-bold leading-relaxed text-slate-500">
            条件「{category.taskExample}」に対する各モデルのスコア (5点満点)。
          </p>

          <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-left">
                  <th className="border-b border-slate-200 px-4 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    評価項目
                  </th>
                  {rankedModels.map((model) => (
                    <th
                      key={model}
                      className="border-b border-slate-200 px-4 py-3 text-center text-[11px] font-black uppercase tracking-[0.14em] text-slate-500"
                    >
                      {model.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {log.scoreTable.map((row, idx) => (
                  <tr key={row.metric} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                    <td className="px-4 py-3 text-sm font-black text-slate-900">{row.metric}</td>
                    {rankedModels.map((model) => {
                      const score = row.scores[model] || 0
                      const isTop = score === Math.max(...Object.values(row.scores))
                      return (
                        <td key={model} className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center rounded-full text-xs font-black ${
                              isTop ? 'bg-slate-950 px-3 py-1 text-white' : 'text-slate-700'
                            }`}
                          >
                            {score}
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {log.roles && log.roles.length > 0 && (
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[...log.roles].sort((a, b) => rankedModels.indexOf(a.model) - rankedModels.indexOf(b.model)).map((role) => (
                <div key={role.model} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Best for</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{role.model}</p>
                  <p className="mt-2 text-xs font-bold leading-relaxed text-slate-700">{role.goodFor}</p>
                  <p className="mt-2 text-[11px] font-black text-amber-700">改善案: {role.improve}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {slug === 'coding' && promptSection}

      {/* 4. モデル別の実出力タブ (Notion 優先、失敗時は埋め込みデータ) */}
      {slug === 'coding' && rankedOutputs && rankedOutputs.length > 0 && (
        <LabCodePreviews outputs={rankedOutputs} />
      )}

      {rankedOutputs && rankedOutputs.length > 0 && (
        <div className="mt-6">
          <LabModelTabs outputs={rankedOutputs} />
        </div>
      )}

      {slug !== 'coding' && promptSection}
    </main>
  )
}
