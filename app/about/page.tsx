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
            Aincarnは、AIモデルの性能、料金、AIサブスク管理、実際に同じ条件で試した比較ログを整理し、どのAIをどの用途で使うべきか判断しやすくするためのサイトです。
            AIの進化が速いからこそ、公開データ、公式料金、サブスク情報、Aincarn Labの実測ログを分けて扱います。
          </p>
          <section>
            <h2 className="text-lg font-black text-slate-950">編集方針</h2>
            <p className="mt-2">
              実体験のように断定できない内容は、公開情報や検証条件を明記したうえで整理します。料金やモデル仕様は変わりやすいため、重要な判断の前には公式ページの確認を推奨します。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-black text-slate-950">比較で重視すること</h2>
            <p className="mt-2">
              Aincarnは「一番賢いAI」を決めるだけのサイトではありません。文章作成、コード、調査、画像、動画、日常利用など、用途によって必要な性能やコストは変わります。
              そのため、性能、速度、価格効率、料金プラン、サブスク管理、比較ログを組み合わせて判断できるようにしています。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-black text-slate-950">情報更新について</h2>
            <p className="mt-2">
              AIサービスの仕様や料金は頻繁に変わります。主要な変更を見つけた場合は順次更新しますが、最終的な契約判断の前には各サービスの公式ページで最新情報をご確認ください。
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
