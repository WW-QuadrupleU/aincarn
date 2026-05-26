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
  logs: Array<{
    date: string
    title: string
    status: 'template' | 'published'
    models: string[]
    summary: string
    findings: string[]
  }>
}

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
        models: ['ChatGPT 5.5 Thinking拡張', 'Gemini 3.1 Pro拡張', 'Claude 4.7 アダプティブ'],
        summary:
          '同じ記事構成プロンプトに対して、ChatGPTは網羅性と記事化のしやすさ、Geminiは初心者向けの簡潔さ、Claudeは自然な導入と論点整理に強みが出ました。',
        findings: [
          'ChatGPTは比較表・注意点・誤解されやすい点まで最も具体的',
          'GeminiはAPIを非エンジニアにも説明する実用補足が分かりやすい',
          'ClaudeはPlusとAPIの本質的な違いを自然な文章で整理できる',
        ],
      },
    ],
  },
  {
    slug: 'coding',
    title: 'コード生成AI比較ログ',
    shortTitle: 'コード生成',
    description:
      '同じ小さな実装課題を主要AIに依頼し、設計の妥当性、コードの読みやすさ、修正指示への強さ、実装後の説明力を記録します。',
    taskExample: '小さなTODOアプリの設計と実装方針を作る',
    accent: 'from-indigo-500 via-sky-400 to-cyan-300',
    soft: 'from-indigo-50 to-cyan-50',
    evaluation: ['要件理解', '実装方針の安全さ', 'コード品質', 'エラー時の修正力', '説明の分かりやすさ'],
    firstPrompt: `あなたはAI比較サイト「Aincarn Lab」の検証対象AIです。
以下の条件で、小さなWebアプリの実装計画とコード方針を作成してください。

課題:
ブラウザで使えるシンプルなTODOアプリを作る

要件:
- タスクを追加できる
- 完了状態を切り替えられる
- 削除できる
- localStorageに保存する
- モバイルでも見やすい

出力条件:
- まず実装方針を説明する
- 必要なファイル構成を示す
- 主要なコード例を出す
- 想定されるバグと対策を挙げる
- 最後に「初心者が詰まりやすい点」を3つ挙げる`,
    logs: [
      {
        date: '2026-05',
        title: 'TODOアプリ実装計画でコード生成力を比較する',
        status: 'template',
        models: ['ChatGPT', 'Claude', 'Gemini'],
        summary: '初回比較用のテンプレートです。実測後に設計傾向、コード品質、修正しやすさを追記します。',
        findings: ['要件の抜け漏れを見る', 'localStorage処理の安全さを見る', '説明とコードの整合性を見る'],
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
