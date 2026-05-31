import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aincarnについて',
  description: 'Aincarnの運営方針、比較方針、情報源の扱いについて掲載しています。',
}

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <section className="rounded-[28px] border border-white bg-white/84 p-8 shadow-sm backdrop-blur">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">About</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-text">Aincarnについて</h1>
        <div className="mt-7 space-y-6 text-sm font-bold leading-relaxed text-gray-600">
          <p>
            <span className="inline-block">Aincarnは、</span>
            <span className="inline-block">AIモデルの性能、</span>
            <span className="inline-block">料金、</span>
            <span className="inline-block">AIサブスク管理、</span>
            <span className="inline-block">実際に同じ条件で試した</span>
            <span className="inline-block">比較ログを整理し、</span>
            <span className="inline-block">どのAIを</span>
            <span className="inline-block">どの用途で</span>
            <span className="inline-block">使うべきか</span>
            <span className="inline-block">判断しやすくするための</span>
            <span className="inline-block">サイトです。</span>
            <br className="hidden sm:inline" />
            <span className="inline-block">AIの進化が速いからこそ、</span>
            <span className="inline-block">公開データ、</span>
            <span className="inline-block">公式料金、</span>
            <span className="inline-block">サブスク情報、</span>
            <span className="inline-block">Aincarn Labの実測ログを</span>
            <span className="inline-block">分けて扱います。</span>
          </p>
          <section>
            <h2 className="text-lg font-black text-slate-950">編集方針</h2>
            <p className="mt-2">
              <span className="inline-block">実体験のように</span>
              <span className="inline-block">断定できない内容は、</span>
              <span className="inline-block">公開情報や</span>
              <span className="inline-block">検証条件を</span>
              <span className="inline-block">明記したうえで</span>
              <span className="inline-block">整理します。</span>
              <span className="inline-block">料金や</span>
              <span className="inline-block">モデル仕様は</span>
              <span className="inline-block">変わりやすいため、</span>
              <span className="inline-block">重要な判断の</span>
              <span className="inline-block">前には</span>
              <span className="inline-block">公式ページの</span>
              <span className="inline-block">確認を推奨します。</span>
            </p>
          </section>
          <section>
            <h2 className="text-lg font-black text-slate-950">比較で重視すること</h2>
            <p className="mt-2">
              <span className="inline-block">Aincarnは</span>
              <span className="inline-block">「一番賢いAI」を</span>
              <span className="inline-block">決めるだけの</span>
              <span className="inline-block">サイトではありません。</span>
              <span className="inline-block">文章作成、</span>
              <span className="inline-block">コード、</span>
              <span className="inline-block">調査、</span>
              <span className="inline-block">画像、</span>
              <span className="inline-block">動画、</span>
              <span className="inline-block">日常利用など、</span>
              <span className="inline-block">用途によって</span>
              <span className="inline-block">必要な性能や</span>
              <span className="inline-block">コストは変わります。</span>
              <br className="hidden sm:inline" />
              <span className="inline-block">そのため、</span>
              <span className="inline-block">性能、</span>
              <span className="inline-block">速度、</span>
              <span className="inline-block">価格効率、</span>
              <span className="inline-block">料金プラン、</span>
              <span className="inline-block">サブスク管理、</span>
              <span className="inline-block">比較ログを</span>
              <span className="inline-block">組み合わせて</span>
              <span className="inline-block">判断できるようにしています。</span>
            </p>
          </section>
          <section>
            <h2 className="text-lg font-black text-slate-950">情報更新について</h2>
            <p className="mt-2">
              <span className="inline-block">AIサービスの仕様や</span>
              <span className="inline-block">料金は</span>
              <span className="inline-block">頻繁に変わります。</span>
              <span className="inline-block">主要な変更を</span>
              <span className="inline-block">見つけた場合は</span>
              <span className="inline-block">順次更新しますが、</span>
              <span className="inline-block">最終的な</span>
              <span className="inline-block">契約判断の</span>
              <span className="inline-block">前には</span>
              <span className="inline-block">各サービスの</span>
              <span className="inline-block">公式ページで</span>
              <span className="inline-block">最新情報を</span>
              <span className="inline-block">ご確認ください。</span>
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
