export type AiGenreId =
  | 'research'
  | 'writing'
  | 'coding'
  | 'analysis'
  | 'agent'
  | 'image'
  | 'textVideo'
  | 'imageVideo'

export type AiGenre = {
  id: AiGenreId
  label: string
  shortLabel: string
  description: string
  primaryMetrics: string[]
  sourceMetric: string
}

export type AiModel = {
  id: string
  name: string
  creator: string
  family: string
  releaseLabel: string
  modality: 'LLM' | 'Image' | 'Video'
  accessType: 'Proprietary' | 'Open weights' | 'Specialized'
  costLevel: 1 | 2 | 3 | 4 | 5
  speed: number
  japanese: number
  context: number
  visibleIn: AiGenreId[]
  performance: Record<AiGenreId, number>
  costPerformance: Record<AiGenreId, number>
  strengths: string[]
  cautions: string[]
  bestFor: string
  avoidFor: string
  note: string
  rank?: number
  metric?: string
  priceLabel?: string
  sourceUrl?: string
}

export type AiModelComparePayload = {
  models: AiModel[]
  updatedAt: string
  source: 'artificial-analysis' | 'fallback'
  sourceLabel: string
  sourceUrl: string
  isLive: boolean
  message: string
}

export const AI_GENRES: AiGenre[] = [
  {
    id: 'research',
    label: 'リサーチ・情報整理',
    shortLabel: 'リサーチ',
    description:
      '情報収集、出典確認、比較検討、長い資料の整理に向くLLMを比較します。',
    primaryMetrics: ['推論力', '長文読解', '出典確認', '情報整理'],
    sourceMetric: 'Artificial Analysis Intelligence Indexを主な基準にしています。',
  },
  {
    id: 'writing',
    label: '文章作成・記事改善',
    shortLabel: '文章',
    description:
      '記事作成、リライト、構成整理、トーン調整に向くLLMを比較します。',
    primaryMetrics: ['推論力', '指示追従', '長文編集', '日本語運用'],
    sourceMetric: 'Artificial Analysis Intelligence Indexを主な基準にしています。',
  },
  {
    id: 'coding',
    label: 'コード・開発補助',
    shortLabel: 'コード',
    description:
      '実装、デバッグ、設計相談、既存コード読解に向くLLMを比較します。',
    primaryMetrics: ['Coding Index', '実装力', 'デバッグ', '設計相談'],
    sourceMetric: 'Artificial Analysis Coding Indexを主な基準にしています。',
  },
  {
    id: 'analysis',
    label: 'データ分析・表計算',
    shortLabel: '分析',
    description:
      '数値処理、表計算、グラフ化、業務データ整理に向くLLMを比較します。',
    primaryMetrics: ['Math Index', '数値処理', '表計算', '推論力'],
    sourceMetric: 'Artificial Analysis Math Indexを主な基準にしています。',
  },
  {
    id: 'agent',
    label: 'エージェント性能',
    shortLabel: 'エージェント',
    description:
      'ツール実行、複数ステップの作業、長時間の自律タスクに向くLLMを比較します。',
    primaryMetrics: ['Agentic Index', 'ツール利用', '長時間タスク', '指示追従'],
    sourceMetric:
      'Artificial Analysis Agentic Indexが取得できる場合はそれを優先し、未提供時はIntelligence/Coding系指標を補助的に使います。',
  },
  {
    id: 'image',
    label: '画像生成・デザイン',
    shortLabel: '画像',
    description:
      '画像生成、記事用ビジュアル、サムネイル、広告素材に向く画像モデルを比較します。',
    primaryMetrics: ['Text to Image Elo', '画質', '指示追従', '商用運用'],
    sourceMetric: 'Artificial Analysis Text to Image Eloを主な基準にしています。',
  },
  {
    id: 'textVideo',
    label: '動画生成（Text to Video）',
    shortLabel: 'Text→Video',
    description:
      'テキストプロンプトだけから動画を生成するモデルを比較します。',
    primaryMetrics: ['Text to Video Elo', '映像品質', '動き', '素材化'],
    sourceMetric: 'Artificial Analysis Text to Video Elo（No Audio）を主な基準にしています。',
  },
  {
    id: 'imageVideo',
    label: '動画生成（Image to Video）',
    shortLabel: 'Image→Video',
    description:
      '参照画像をもとに動画を生成するモデルを比較します。',
    primaryMetrics: ['Image to Video Elo', '映像品質', '動き', '素材化'],
    sourceMetric: 'Artificial Analysis Image to Video Elo（No Audio）を主な基準にしています。',
  },
]

const ZERO_PERFORMANCE: Record<AiGenreId, number> = {
  research: 0,
  writing: 0,
  coding: 0,
  analysis: 0,
  agent: 0,
  image: 0,
  textVideo: 0,
  imageVideo: 0,
}

function scores(values: Partial<Record<AiGenreId, number>>): Record<AiGenreId, number> {
  return { ...ZERO_PERFORMANCE, ...values }
}

export const FALLBACK_UPDATED_AT = '2026-05-06T00:00:00.000+09:00'

export const FALLBACK_AI_MODELS: AiModel[] = [
  {
    id: 'gpt-5-5-xhigh',
    name: 'GPT-5.5 (xhigh)',
    creator: 'OpenAI',
    family: 'GPT',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 5,
    speed: 73,
    japanese: 92,
    context: 92,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 1,
    metric: 'Intelligence Index 60',
    priceLabel: '$11.25 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 100, writing: 100, coding: 96, analysis: 96, agent: 98 }),
    costPerformance: scores({ research: 67, writing: 67, coding: 65, analysis: 65, agent: 66 }),
    strengths: ['総合推論が非常に強い', 'コード、分析、複雑な設計相談に向く', '難しい指示を粘り強く処理しやすい'],
    cautions: ['高コストで待ち時間も長め', '軽い要約や分類には過剰になりやすい'],
    bestFor: '難しい分析、コード、設計、記事改善の最終判断まで任せたい人。',
    avoidFor: '低コストで大量処理したい用途。',
    note: 'Artificial AnalysisのLLMリーダーボード上位モデルを基準にしたフォールバック値です。',
  },
  {
    id: 'gpt-5-5-high',
    name: 'GPT-5.5 (high)',
    creator: 'OpenAI',
    family: 'GPT',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 5,
    speed: 71,
    japanese: 92,
    context: 92,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 2,
    metric: 'Intelligence Index 59',
    priceLabel: '$11.25 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 98, writing: 98, coding: 95, analysis: 95, agent: 96 }),
    costPerformance: scores({ research: 66, writing: 66, coding: 64, analysis: 64, agent: 65 }),
    strengths: ['xhighより扱いやすく高性能', '文章、コード、分析を横断しやすい', '汎用の上位比較軸にしやすい'],
    cautions: ['価格は高め', '速度だけなら軽量モデルも比較したい'],
    bestFor: '高性能を保ちつつ、xhighほど重くしたくない人。',
    avoidFor: '日常の軽作業だけを高速に回したい人。',
    note: '高性能LLMの比較基準です。',
  },
  {
    id: 'claude-opus-4-7-max',
    name: 'Claude Opus 4.7 (max)',
    creator: 'Anthropic',
    family: 'Claude Opus',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 4,
    speed: 47,
    japanese: 94,
    context: 95,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 3,
    metric: 'Intelligence Index 57',
    priceLabel: '$10.94 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 95, writing: 95, coding: 94, analysis: 90, agent: 94 }),
    costPerformance: scores({ research: 65, writing: 65, coding: 64, analysis: 62, agent: 64 }),
    strengths: ['文章編集と長文読解に強い', '複雑な指示を保ちやすい', 'コードやエージェント用途でも上位候補'],
    cautions: ['速度は速さ重視ではない', '画像や動画生成は別ツールが必要'],
    bestFor: '長文記事、リライト、慎重な調査整理、コード相談。',
    avoidFor: '動画や画像生成まで1つで済ませたい人。',
    note: '文章品質を重視する比較で外しにくいモデルです。',
  },
  {
    id: 'gemini-3-1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    creator: 'Google',
    family: 'Gemini',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 3,
    speed: 137,
    japanese: 88,
    context: 98,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 4,
    metric: 'Intelligence Index 57',
    priceLabel: '$4.50 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 95, writing: 95, coding: 91, analysis: 92, agent: 93 }),
    costPerformance: scores({ research: 82, writing: 82, coding: 80, analysis: 80, agent: 81 }),
    strengths: ['長文とリサーチに強い', '速度と価格のバランスがよい', 'Google系の作業導線と相性がよい'],
    cautions: ['Preview系は仕様が変わる可能性がある', '日本語の最終仕上げは好みが分かれる'],
    bestFor: 'リサーチ、資料整理、長文読解、Google環境中心の作業。',
    avoidFor: '安定した本番運用だけを重視する用途。',
    note: '長文・調査寄りの強力な候補です。',
  },
  {
    id: 'kimi-k2-6',
    name: 'Kimi K2.6',
    creator: 'Kimi',
    family: 'Kimi',
    releaseLabel: 'LLM',
    modality: 'LLM',
    accessType: 'Proprietary',
    costLevel: 2,
    speed: 34,
    japanese: 74,
    context: 86,
    visibleIn: ['research', 'writing', 'coding', 'analysis', 'agent'],
    rank: 6,
    metric: 'Intelligence Index 54',
    priceLabel: '$1.71 / 1M tokens',
    sourceUrl: 'https://artificialanalysis.ai/leaderboards/models',
    performance: scores({ research: 90, writing: 90, coding: 86, analysis: 84, agent: 86 }),
    costPerformance: scores({ research: 87, writing: 87, coding: 84, analysis: 83, agent: 84 }),
    strengths: ['性能に対して価格を抑えやすい', 'コードと分析の補助に向く', '上位勢との比較軸になる'],
    cautions: ['日本語記事の仕上げは確認したい', '一般ユーザー向けUIは別途確認が必要'],
    bestFor: 'コストと性能のバランスを重視する開発者。',
    avoidFor: '日本語記事の最終品質だけを重視する人。',
    note: 'コスパ比較で入れておきたいモデルです。',
  },
  {
    id: 'gpt-image-2-high',
    name: 'GPT Image 2 (high)',
    creator: 'OpenAI',
    family: 'GPT Image',
    releaseLabel: 'Text to Image',
    modality: 'Image',
    accessType: 'Specialized',
    costLevel: 4,
    speed: 55,
    japanese: 60,
    context: 40,
    visibleIn: ['image'],
    rank: 1,
    metric: 'Text to Image Elo 1338',
    sourceUrl: 'https://artificialanalysis.ai/image/leaderboard/text-to-image',
    performance: scores({ image: 100 }),
    costPerformance: scores({ image: 76 }),
    strengths: ['画像生成品質が非常に高い', '記事用ビジュアルや商用寄りの素材に向く', '文字や指示追従も比較しやすい'],
    cautions: ['汎用チャットや調査用途ではない', '実在商品風の表現は権利面に注意'],
    bestFor: '記事ヒーロー、サムネイル、広告素材の画像生成。',
    avoidFor: '調査や文章作成まで同じモデルで行いたい人。',
    note: 'Text to Imageの上位モデルとして入れています。',
  },
  {
    id: 'nano-banana-2',
    name: 'Nano Banana 2',
    creator: 'Google',
    family: 'Gemini Image',
    releaseLabel: 'Text to Image',
    modality: 'Image',
    accessType: 'Specialized',
    costLevel: 2,
    speed: 70,
    japanese: 58,
    context: 40,
    visibleIn: ['image'],
    rank: 3,
    metric: 'Text to Image Elo 1261',
    sourceUrl: 'https://artificialanalysis.ai/image/leaderboard/text-to-image',
    performance: scores({ image: 94 }),
    costPerformance: scores({ image: 87 }),
    strengths: ['画像品質とコストのバランスがよい', '指示への追従を期待しやすい', 'Google系の画像用途に入りやすい'],
    cautions: ['画像専用枠として考える', '商用利用条件は必ず確認したい'],
    bestFor: 'コスパ良く画像生成を試したい人。',
    avoidFor: '動画生成や文章作成を主目的にする人。',
    note: '画像生成のコスパ枠です。',
  },
  {
    id: 'kling-3-0-1080p-pro',
    name: 'Kling 3.0 1080p (Pro)',
    creator: 'KlingAI',
    family: 'Kling',
    releaseLabel: 'Text to Video',
    modality: 'Video',
    accessType: 'Specialized',
    costLevel: 4,
    speed: 45,
    japanese: 35,
    context: 30,
    visibleIn: ['textVideo'],
    rank: 3,
    metric: 'Text to Video Elo 1246',
    sourceUrl: 'https://artificialanalysis.ai/video/leaderboard/text-to-video',
    performance: scores({ textVideo: 96 }),
    costPerformance: scores({ textVideo: 72 }),
    strengths: ['動画生成の上位候補', '人物や動きのある映像で比較しやすい', 'Kling系の最新候補として重要'],
    cautions: ['価格は高め', '長尺や正確な商品再現は個別確認が必要'],
    bestFor: 'SNS動画、Bロール、動きのある短尺映像。',
    avoidFor: '文章作成やリサーチ用途。',
    note: '動画比較では必ず入れておきたいKling系モデルです。',
  },
  {
    id: 'runway-gen-4-5',
    name: 'Runway Gen-4.5',
    creator: 'Runway',
    family: 'Runway',
    releaseLabel: 'Text to Video',
    modality: 'Video',
    accessType: 'Specialized',
    costLevel: 4,
    speed: 45,
    japanese: 38,
    context: 32,
    visibleIn: ['textVideo'],
    rank: 10,
    metric: 'Text to Video Elo 1215',
    sourceUrl: 'https://artificialanalysis.ai/video/leaderboard/text-to-video',
    performance: scores({ textVideo: 91 }),
    costPerformance: scores({ textVideo: 70 }),
    strengths: ['制作ツールとしての完成度が高い', '編集ワークフローに組み込みやすい', '映像制作者向けの選択肢'],
    cautions: ['単純な品質順位だけならKlingやVeoも比較したい', '料金体系と利用制限の確認が必要'],
    bestFor: '映像制作、SNS素材、編集込みの動画ワークフロー。',
    avoidFor: '低コストで試したいだけの人。',
    note: '動画制作ツールとしての使いやすさも含めて候補に入れています。',
  },
  {
    id: 'veo-3-1',
    name: 'Veo 3.1',
    creator: 'Google',
    family: 'Veo',
    releaseLabel: 'Image to Video',
    modality: 'Video',
    accessType: 'Specialized',
    costLevel: 4,
    speed: 45,
    japanese: 40,
    context: 32,
    visibleIn: ['imageVideo'],
    rank: 14,
    metric: 'Image to Video Elo 1235',
    sourceUrl: 'https://artificialanalysis.ai/video/leaderboard/image-to-video',
    performance: scores({ imageVideo: 90 }),
    costPerformance: scores({ imageVideo: 70 }),
    strengths: ['Google系動画生成の主力候補', '映像品質が高い', 'Veo系の比較軸として重要'],
    cautions: ['提供地域やプラン条件を確認したい', '細かな編集は外部ツール併用が前提になりやすい'],
    bestFor: '高品質な短尺動画や映像素材を作りたい人。',
    avoidFor: '動画生成を低コストで大量に回したい用途。',
    note: 'Veo系の現行比較枠です。',
  },
]

export const FALLBACK_AI_PAYLOAD: AiModelComparePayload = {
  models: FALLBACK_AI_MODELS,
  updatedAt: FALLBACK_UPDATED_AT,
  source: 'fallback',
  sourceLabel: 'Artificial Analysis公開情報をもとにしたAincarn編集データ',
  sourceUrl: 'https://artificialanalysis.ai/',
  isLive: false,
  message:
    '現在はフォールバックデータを表示しています。サーバー側にArtificial Analysisのキーを設定すると、公開ベンチマークを定期取得して更新します。',
}
