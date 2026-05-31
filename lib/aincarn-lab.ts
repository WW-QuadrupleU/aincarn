export type LabModelOutput = {
  model: string
  brief: string
  raw?: string
  sections: Array<{ heading: string; body?: string; bullets?: string[] }>
}

export type LabScoreRow = {
  metric: string
  scores: Record<string, number>
  note?: string
}

export type LabModelRole = {
  model: string
  goodFor: string
  improve: string
}

export type LabLog = {
  date: string
  title: string
  status: 'template' | 'published'
  models: string[]
  summary: string
  findings: string[]
  scoreTable?: LabScoreRow[]
  roles?: LabModelRole[]
  outputs?: LabModelOutput[]
}

export type LabCategory = {
  slug: string
  title: string
  shortTitle: string
  description: string
  taskExample: string
  accent: string
  soft: string
  evaluation: string[]
  firstPrompt: string
  logs: LabLog[]
}

const writingModels = ['ChatGPT 5.5 Thinking拡張', 'Gemini 3.1 Pro拡張', 'Claude 4.7 アダプティブ']
const codingModels = ['GPT5.5 非常に高い', 'Opus4.8 Max', 'Gemini3.1 Pro(High)']

export const labCategories: LabCategory[] = [
  {
    slug: 'writing',
    title: '文章作成AI比較ログ',
    shortTitle: '文章作成',
    description:
      '同じテーマと条件で、主要AIに記事構成・導入文・見出し案などを作らせ、文章の自然さ、情報整理力、SEO向けの使いやすさを記録します。',
    taskExample: 'AI料金比較の記事構成を作る',
    accent: 'from-fuchsia-500 via-rose-400 to-orange-300',
    soft: 'from-fuchsia-50 to-orange-50',
    evaluation: ['構成の明確さ', '日本語の自然さ', '検索意図の理解', '独自性の出しやすさ', '修正の少なさ'],
    firstPrompt: `あなたはAI比較サイト「Aincarn Lab」の検証対象AIです。
以下の条件で、AI料金比較に関する記事構成を作成してください。

テーマ:
ChatGPT PlusとAPI利用はどちらが向いているか

想定読者:
- AIに月額課金するか迷っている個人ユーザー
- ChatGPT Plus、Claude Pro、Gemini Advanced、API利用の違いがよく分からない人

出力条件:
- 実体験のような表現は禁止
- 料金は変動するため断定しすぎない
- 初心者にも分かる表現にする
- 見出し構成、冒頭文、比較表に入れるべき項目、注意点、まとめを出す
- 最後に「このテーマで読者が誤解しやすい点」を3つ挙げる`,
    logs: [
      {
        date: '2026-05',
        title: 'ChatGPT PlusとAPI利用の記事構成を3モデルで比較する',
        status: 'published',
        models: writingModels,
        summary:
          '同じ記事構成プロンプトに対して、ChatGPTは網羅性と記事化のしやすさ、Geminiは初心者向けの簡潔さ、Claudeは自然な導入と論点整理に強みが出ました。',
        findings: [
          'ChatGPTは比較表・注意点・誤解されやすい点まで最も具体的',
          'GeminiはAPIを非エンジニアにも説明する実用補足が分かりやすい',
          'ClaudeはPlusとAPIの本質的な違いを自然な文章で整理できる',
        ],
        scoreTable: [
          { metric: '構成の明確さ', scores: { [writingModels[0]]: 5, [writingModels[1]]: 4, [writingModels[2]]: 4 } },
          { metric: '日本語の自然さ', scores: { [writingModels[0]]: 4, [writingModels[1]]: 4, [writingModels[2]]: 5 } },
          { metric: '検索意図の理解', scores: { [writingModels[0]]: 5, [writingModels[1]]: 4, [writingModels[2]]: 5 } },
          { metric: '独自性の出しやすさ', scores: { [writingModels[0]]: 4, [writingModels[1]]: 3, [writingModels[2]]: 4 } },
          { metric: '修正の少なさ', scores: { [writingModels[0]]: 5, [writingModels[1]]: 3, [writingModels[2]]: 4 } },
        ],
        roles: [
          {
            model: writingModels[0],
            goodFor: '記事全体の骨子、比較表、注意点の洗い出し',
            improve: '文章量を削り、重複を整理する',
          },
          {
            model: writingModels[1],
            goodFor: '初心者向けの説明、API導入ハードルの補足',
            improve: '比較対象ごとの具体性を足す',
          },
          {
            model: writingModels[2],
            goodFor: '冒頭文、概念整理、自然なまとめ',
            improve: '表や見出しの粒度を増やす',
          },
        ],
        outputs: [
          {
            model: writingModels[0],
            brief:
              '記事化まで最も近い出力。比較表の項目数が多く、Plus、Claude Pro、Gemini Advanced、API利用の違いをまとめるための材料が揃っていました。',
            sections: [
              {
                heading: '主な構成',
                bullets: [
                  '結論: 多くの個人ユーザーはまず月額プラン、開発・自動化ならAPI',
                  'ChatGPT Plusが向いている人 / API利用が向いている人',
                  'ChatGPT Plus・Claude Pro・Gemini Advanced・API利用の違い',
                  '料金比較で見るべきポイント、注意点、まとめ',
                ],
              },
              {
                heading: '比較表で挙げた項目',
                bullets: [
                  '料金体系、主な使い方、初心者向け度',
                  'コストの読みやすさ、導入の手間、モデル選択の自由度',
                  '自動化への向き不向き、大量処理、データ管理',
                ],
              },
              {
                heading: '注意点',
                bullets: [
                  'ChatGPT PlusとAPIは別料金であること',
                  'APIは使い方によって高額化すること',
                  '価格だけでなく用途で選ぶべきこと',
                ],
              },
            ],
          },
          {
            model: writingModels[1],
            brief:
              '初心者向けに短く整理する力がある出力。APIはWebUIと組み合わせれば非エンジニアでも使えるという補足が実用的でした。',
            sections: [
              {
                heading: '主な構成',
                bullets: [
                  '主要なAI定額制サービスとAPI利用の基本',
                  '定額制 vs API利用の料金システムと特徴',
                  'タイプ別のおすすめ、注意点、まとめ',
                ],
              },
              {
                heading: '比較表で挙げた項目',
                bullets: ['料金システム', '支払いの見通し', '利用の手軽さ', '追加機能', '利用制限'],
              },
              {
                heading: '注意点',
                bullets: [
                  'APIの従量課金リスク',
                  '料金改定の可能性',
                  'Dify、LibreChat、NextChatなどのWebUIを使えば導入しやすい点',
                ],
              },
            ],
          },
          {
            model: writingModels[2],
            brief:
              '導入文と概念整理が自然な出力。PlusとAPIを「同じAIの別の使い方」と捉える説明が分かりやすい結果でした。',
            sections: [
              {
                heading: '主な構成',
                bullets: [
                  'ChatGPT PlusとAPI利用は同じAIの別の使い方',
                  'ChatGPT Plusとは / API利用とは',
                  '料金体系の違い、ユースケース別おすすめ、他サブスクとの位置づけ',
                ],
              },
              {
                heading: '比較表で挙げた項目',
                bullets: [
                  '料金体系、利用上限、使えるインターフェース',
                  'モデル選択の自由度、カスタマイズ性',
                  '追加機能、技術的ハードル、データの取り扱い',
                ],
              },
              {
                heading: '注意点',
                bullets: [
                  '同じモデル名でもPlusとAPIで同じ体験にはならない',
                  '業務利用ではデータポリシー確認が必要',
                  '料金だけでなく用途との相性で選ぶべき',
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    slug: 'coding',
    title: 'コード生成AI比較ログ',
    shortTitle: 'コード生成',
    description:
      '同じ小さな実装課題を主要AIに依頼し、実際に動く成果物、コード品質、UIの完成度、修正しやすさを記録します。生成物はページ内で触れるプレビューとして比較します。',
    taskExample: '単体HTMLで動く小さなTODOアプリを作る',
    accent: 'from-indigo-500 via-sky-400 to-cyan-300',
    soft: 'from-indigo-50 to-cyan-50',
    evaluation: ['完成物の動作', 'UIの使いやすさ', 'コード品質', '要件の満たし方', '修正しやすさ'],
    firstPrompt: `あなたはAI比較サイト「Aincarn Lab」の検証対象AIです。
以下の条件で、ブラウザ上でそのまま動かせる小さなWebアプリを作成してください。

課題:
ブラウザで使えるシンプルなTODOアプリを作る

要件:
- タスクを追加できる
- 完了状態を切り替えられる
- 削除できる
- localStorageに保存する
- モバイルでも見やすい

出力条件:
- HTML、CSS、JavaScriptを1つのHTMLファイルにまとめる
- 外部ライブラリ、外部CDN、画像、ビルドツールは使わない
- そのまま .html として保存すれば動くコードを出す
- コードは全文を1つのコードブロックで出す
- コードの前後に長い説明を入れすぎない
- コードの後に、実装した機能、工夫した点、制限事項を短く箇条書きでまとめる
- セキュリティ上危険な処理、外部通信、トラッキングは入れない`,
    logs: [
      {
        date: '2026-05-31',
        title: 'TODOアプリの完成物でコード生成力を比較する',
        status: 'published',
        models: codingModels,
        summary:
          '同じTODOアプリ課題に対して、完成物の動作、UIの触りやすさ、コード品質、修正しやすさを比較します。コード全文だけでなく、ページ内で実際に触れるプレビューも並べて確認できます。',
        findings: [
          'GPT5.5は要件の拾い上げと完成物のまとまりが強く、まず動く試作品を作る用途に向く',
          'Opus4.8はコードの読みやすさとUIの整え方がよく、修正前提の素材として扱いやすい',
          'Gemini3.1は軽量にまとめやすい一方、細部の使い勝手は追加指示で補強したい',
        ],
        scoreTable: [
          { metric: '完成物の動作', scores: { [codingModels[0]]: 5, [codingModels[1]]: 4, [codingModels[2]]: 4 } },
          { metric: 'UIの使いやすさ', scores: { [codingModels[0]]: 5, [codingModels[1]]: 5, [codingModels[2]]: 4 } },
          { metric: 'コード品質', scores: { [codingModels[0]]: 5, [codingModels[1]]: 5, [codingModels[2]]: 4 } },
          { metric: '要件の満たし方', scores: { [codingModels[0]]: 5, [codingModels[1]]: 4, [codingModels[2]]: 4 } },
          { metric: '修正しやすさ', scores: { [codingModels[0]]: 4, [codingModels[1]]: 5, [codingModels[2]]: 4 } },
        ],
        roles: [
          {
            model: codingModels[0],
            goodFor: '完成度の高い単体HTMLを素早く出し、要件を大きく外しにくい。まず動くプロトタイプを作る用途に向く。',
            improve: '生成コードが長くなりやすいため、後から部品分割や状態管理の整理をしたい。',
          },
          {
            model: codingModels[1],
            goodFor: 'UIのまとまりとコードの読みやすさを重視したい場合に向く。修正前提の比較素材として扱いやすい。',
            improve: '要件を細かく指定しないと、完成物の挙動より設計の美しさを優先する可能性がある。',
          },
          {
            model: codingModels[2],
            goodFor: '短時間でシンプルな成果物を作る用途に向く。軽量なHTMLアプリのたたき台として使いやすい。',
            improve: '細かいエラー処理やUIの詰めは、追加プロンプトで補強したい。',
          },
        ],
      },
    ],
  },
  {
    slug: 'research',
    title: '調査・要約AI比較ログ',
    shortTitle: '調査・要約',
    description:
      '同じ調査テーマを主要AIに依頼し、論点整理、根拠の扱い、不確実性の明示、要約の読みやすさを記録します。',
    taskExample: 'AIサブスクを選ぶときの判断軸を整理する',
    accent: 'from-emerald-400 via-teal-400 to-sky-400',
    soft: 'from-emerald-50 to-sky-50',
    evaluation: ['論点の網羅性', '根拠の扱い', '不確実性の明示', '要約の読みやすさ', '次に取る行動の明確さ'],
    firstPrompt: `あなたはAI比較サイト「Aincarn Lab」の検証対象AIです。
以下のテーマについて、調査・要約タスクとして回答してください。

テーマ:
個人ユーザーがAIサブスクを選ぶときに見るべき判断軸

出力条件:
- 公式情報、料金、用途、制限、使いやすさを分けて整理する
- 分からない点や変動しやすい点は断定しない
- 初心者向けに説明する
- 比較表に入れるべき項目を提案する
- 最後に「契約前に確認すべきこと」を5つ挙げる`,
    logs: [
      {
        date: '2026-05',
        title: 'AIサブスク選びの判断軸を比較する',
        status: 'template',
        models: ['ChatGPT', 'Claude', 'Gemini'],
        summary: '初回比較用のテンプレートです。実測後に根拠の扱い、要約力、実用性を追記します。',
        findings: ['断定しすぎないかを見る', '論点の抜け漏れを見る', '行動に移しやすい要約かを見る'],
      },
    ],
  },
]

export function getLabCategory(slug: string) {
  return labCategories.find((category) => category.slug === slug)
}
