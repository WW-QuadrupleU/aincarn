const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../lib/ai-database.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /'imageVideo'/,
  "'imageVideo'\n  | 'textSpeech'\n  | 'music'"
);

content = content.replace(
  /matrixX\?: \('general' \| 'coding' \| 'media'\)\[\]/,
  "matrixX?: ('general' | 'coding' | 'media' | 'audio')[]"
);
content = content.replace(
  /matrixX: \('general' \| 'coding' \| 'media'\)\[\]/g,
  "matrixX: ('general' | 'coding' | 'media' | 'audio')[]"
);

const aiGenresAddition = `  {
    id: 'textSpeech',
    label: '音声生成（Text to Speech）',
    shortLabel: '音声生成',
    description: 'テキストから自然な音声を生成するTTSモデルを比較します。',
    primaryMetrics: ['音声品質', '感情表現', '多言語対応', '生成速度'],
    sourceMetric: '公開評価、価格、音声の自然さ、用途適性を項目別に確認します。',
  },
  {
    id: 'music',
    label: '音楽生成（Vocal & Instrumental）',
    shortLabel: '音楽生成',
    description: 'プロンプトからボーカル入り楽曲やインストゥルメンタルを生成するモデルを比較します。',
    primaryMetrics: ['楽曲品質', 'プロンプト追従', 'ボーカル自然さ', '構成力'],
    sourceMetric: '公開評価、価格、楽曲のクオリティ、用途適性を項目別に確認します。',
  },
];`;
content = content.replace(/];\s*const ZERO_PERFORMANCE: Record<AiGenreId, number> = {[^}]+}/, aiGenresAddition + `

const ZERO_PERFORMANCE: Record<AiGenreId, number> = {
  research: 0,
  writing: 0,
  coding: 0,
  analysis: 0,
  agent: 0,
  textImage: 0,
  imageImage: 0,
  textVideo: 0,
  imageVideo: 0,
  textSpeech: 0,
  music: 0,
}`);

const fallbackModelsAddition = `  {
    id: 'elevenlabs-multilingual-v2',
    name: 'Eleven Multilingual v2',
    creator: 'ElevenLabs',
    family: 'ElevenLabs',
    releaseLabel: 'TTS',
    modality: 'LLM',
    accessType: 'Specialized',
    costLevel: 4,
    speed: 85,
    japanese: 80,
    context: 0,
    visibleIn: ['textSpeech'],
    rank: 1,
    metric: 'Top Tier Voice',
    priceLabel: '$0.30 / 1k chars',
    sourceUrl: 'https://elevenlabs.io/pricing',
    performance: scores({ textSpeech: 95 }),
    costPerformance: scores({ textSpeech: 80 }),
    strengths: ['極めて自然な感情表現', '多言語対応', 'Voice Cloningの高精度'],
    cautions: ['料金が高め', '日本語のイントネーションはたまに不自然'],
    bestFor: 'YouTube解説動画、オーディオブック、ナレーションの自動化。',
    avoidFor: '大量のテキストを安価に読み上げさせたい用途。',
    note: 'TTSモデルの代表例として初期評価を反映しています。',
  },
  {
    id: 'suno-v3-5',
    name: 'Suno v3.5',
    creator: 'Suno',
    family: 'Suno',
    releaseLabel: 'Music',
    modality: 'LLM',
    accessType: 'Specialized',
    costLevel: 3,
    speed: 80,
    japanese: 90,
    context: 0,
    visibleIn: ['music'],
    rank: 1,
    metric: 'Top Tier Music',
    priceLabel: '$10.00 / month',
    sourceUrl: 'https://suno.com/pricing',
    performance: scores({ music: 95 }),
    costPerformance: scores({ music: 90 }),
    strengths: ['日本語の歌詞にも自然に曲が付く', 'ボーカル品質が高い', 'キャッチーなメロディ生成'],
    cautions: ['細かな楽器の指定や音質調整が難しい', '無料枠は商用利用不可'],
    bestFor: 'SNS向けBGM、ネタ曲、テーマソングの作成。',
    avoidFor: 'プロ水準のミックス・マスタリングが必要な商用楽曲。',
    note: '音楽生成モデルの代表例として初期評価を反映しています。',
  },
  {
    id: 'udio-v1-5',
    name: 'Udio v1.5',
    creator: 'Udio',
    family: 'Udio',
    releaseLabel: 'Music',
    modality: 'LLM',
    accessType: 'Specialized',
    costLevel: 3,
    speed: 80,
    japanese: 75,
    context: 0,
    visibleIn: ['music'],
    rank: 2,
    metric: 'High Fidelity',
    priceLabel: '$10.00 / month',
    sourceUrl: 'https://udio.com/pricing',
    performance: scores({ music: 92 }),
    costPerformance: scores({ music: 88 }),
    strengths: ['音質（クリアさ）が非常に高い', '複雑なプロンプトの理解', 'ステム分離が可能'],
    cautions: ['日本語ボーカルはSunoに比べるとやや不自然になりやすい'],
    bestFor: '高品質なインストゥルメンタルBGM、洋楽ライクな楽曲作成。',
    avoidFor: '日本語の歌詞をクリアに歌わせたい用途。',
    note: '音楽生成モデルの代表例として初期評価を反映しています。',
  },
];`;
content = content.replace(/];\s*export const FALLBACK_AI_PAYLOAD/, fallbackModelsAddition + '\n\nexport const FALLBACK_AI_PAYLOAD');

const defaultSubscriptionCatalogAddition = `  {
    id: 'suno',
    name: 'Suno',
    provider: 'Suno',
    categories: ['音声・音楽'],
    accent: 'from-[#ff0055] via-[#ff4488] to-[#ff88bb]',
    mark: 'SN',
    vibe: '音楽生成',
    description: '誰でも簡単に高品質なボーカル曲やBGMを生成できるAI音楽作成サービス。',
    sourceUrl: 'https://suno.com/pricing',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'pro',
        name: 'Pro',
        monthlyCostUsd: 10,
        summary: '月間2500クレジット。商用利用可能な標準プラン。',
        category: '音楽生成',
        includes: ['月間2500クレジット(約500曲)', '商用利用', '優先アクセス'],
        bestFor: '動画のBGMや独自のテーマ曲を商用利用したい動画クリエイター',
        cautions: 'クレジットは月単位で使い切りです。',
        matrixX: ['audio'],
        matrixY: 'low',
        yearly: {
          monthlyCostUsd: 8,
          summary: '年払い時の月額換算（年額$96）。',
        },
      },
    ],
  },
  {
    id: 'udio',
    name: 'Udio',
    provider: 'Udio',
    categories: ['音声・音楽'],
    accent: 'from-[#ff0055] via-[#ff4488] to-[#ff88bb]',
    mark: 'UD',
    vibe: '音楽生成',
    description: 'ボーカルとインストゥルメンタルの両方で、極めて高音質な楽曲生成が可能なサービス。',
    sourceUrl: 'https://udio.com/pricing',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'standard',
        name: 'Standard',
        monthlyCostUsd: 10,
        summary: '月間1200クレジット。商用利用可能な標準プラン。',
        category: '音楽生成',
        includes: ['月間1200クレジット', '商用利用', '優先生成'],
        bestFor: '高品質なBGMやボーカル曲を商用利用したいクリエイター',
        cautions: 'クレジットの繰り越しはありません。',
        matrixX: ['audio'],
        matrixY: 'low',
        yearly: {
          monthlyCostUsd: 8,
          summary: '年払い時の月額換算（年額$96）。',
        },
      },
    ],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    provider: 'ElevenLabs',
    categories: ['音声・音楽'],
    accent: 'from-[#000000] via-[#444444] to-[#888888]',
    mark: 'EL',
    vibe: '音声生成',
    description: '極めて自然なテキスト読み上げ(TTS)やボイスクローニングを提供するサービス。',
    sourceUrl: 'https://elevenlabs.io/pricing',
    updatedAt: catalogUpdatedAt,
    plans: [
      {
        id: 'starter',
        name: 'Starter',
        monthlyCostUsd: 5,
        summary: '月間約3万文字の生成と、ボイスクローニングを試せるプラン。',
        category: '音声生成',
        includes: ['30,000文字/月', 'カスタムボイス最大10個', '商用利用'],
        bestFor: '短いナレーションや動画の音声を安価に生成したい人',
        cautions: '長編動画やオーディオブック作成には文字数が不足します。',
        matrixX: ['audio'],
        matrixY: 'low',
      },
      {
        id: 'creator',
        name: 'Creator',
        monthlyCostUsd: 22,
        summary: '月間約10万文字生成可能。YouTuberやコンテンツクリエイター向け。',
        category: '音声生成',
        includes: ['100,000文字/月', 'プロボイスクローニング', '最高品質の音声'],
        bestFor: '定期的に動画を投稿するYouTuberやポッドキャスター',
        cautions: '文字数の消費状況を定期的に確認する必要があります。',
        matrixX: ['audio'],
        matrixY: 'mid',
      },
    ],
  },
];`;
content = content.replace(/];\s*\/\/ ==========================================\s*\/\/ 4\. Utility Functions/, defaultSubscriptionCatalogAddition + '\n\n// ==========================================\n// 4. Utility Functions');

fs.writeFileSync(file, content);
console.log('Restored ai-database.ts and ZERO_PERFORMANCE');
