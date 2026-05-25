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
            Aincarnは、AIモデルとAIサブスクを用途別に比較し、どのAIに課金すべきかを判断しやすくするためのサイトです。
            AIの進化が速いからこそ、性能だけでなく、料金、速度、使い勝手、用途ごとの向き不向きを分けて整理します。
          </p>
          <section>
            <h2 className="text-lg font-black text-slate-950">編集方針</h2>
            <p className="mt-2">
              Aincarnでは、公式情報、公開ベンチマーク、価格情報、運営者が今後行う実測テストを区別して扱います。
              実測していない内容を体験談のように断定せず、確認日や情報源の性質が分かるように記載します。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-black text-slate-950">比較で重視すること</h2>
            <p className="mt-2">
              Aincarnは「一番賢いAI」を決めるだけのサイトではありません。
              文章作成、コード、調査、画像生成、動画生成、日常利用など、用途によって必要な性能やコストは変わります。
              そのため、性能、速度、価格効率、料金プラン、サブスク管理を組み合わせて判断できるようにしています。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-black text-slate-950">情報更新について</h2>
            <p className="mt-2">
              AIサービスの仕様や料金は頻繁に変わります。重要な変更を見つけた場合は順次更新しますが、最終的な契約判断の前には、
              各サービスの公式ページで最新情報をご確認ください。
            </p>
          </section>
        </div>
      </section>
    </main>
  )
}
