import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '運営者情報',
  description: 'Aincarnの運営方針と編集方針を掲載しています。',
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
          </p>
          <p>
            初期版では公開ベンチマーク、料金、速度、文脈長、公式情報をもとに、リサーチ、文章作成、コード、分析、画像生成、動画生成の用途別に整理しています。
            今後は運営者が実際に契約しているAIサブスクの実測テストも追加します。
          </p>
          <p>
            実測していない内容は体験談風に断定せず、公式情報、公開ベンチマーク、料金情報、実測データを分けて扱います。
          </p>
        </div>
      </section>
    </main>
  )
}

