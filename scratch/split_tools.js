const fs = require('fs');
const path = require('path');

const pricingFile = path.join(__dirname, '../components/AiPricingTool.tsx');
const subFile = path.join(__dirname, '../components/AiSubscriptionTool.tsx');

let pricingContent = fs.readFileSync(pricingFile, 'utf8');
let subContent = fs.readFileSync(subFile, 'utf8');

// Update AiPricingTool.tsx
// Remove matrix and diagnosis view options
pricingContent = pricingContent.replace(/<button\s+onClick=\{\(\) => setViewMode\('matrix'\)\}[\s\S]*?<\/button>/, '');
pricingContent = pricingContent.replace(/<button\s+onClick=\{\(\) => setViewMode\('diagnosis'\)\}[\s\S]*?<\/button>/, '');

// Remove matrix and diagnosis views
pricingContent = pricingContent.replace(/\{\/\* ---------------- 🗺️ VIEW: 2次元ポジショニングマトリックス ---------------- \*\/\}([\s\S]*?)({viewMode === 'api' && \()/g, '$2');
pricingContent = pricingContent.replace(/\{\/\* ---------------- 🩺 VIEW: AIコンシェルジュ診断 ---------------- \*\/\}([\s\S]*?)({viewMode === 'matrix' && \()/g, '$2');

// Fix title and default viewMode
pricingContent = pricingContent.replace(/const \[viewMode, setViewMode\] = useState<'api' \| 'breakeven' \| 'matrix' \| 'diagnosis'>\('matrix'\)/, `const [viewMode, setViewMode] = useState<'api' | 'breakeven'>('api')`);
pricingContent = pricingContent.replace(/AI料金比較＆為替シミュレーター/g, 'AI料金比較ツール');
pricingContent = pricingContent.replace(/定額サブスクプランとAPI従量課金を一括比較。最適なAIの構成をコンシェルジュが提案します。/, 'API従量課金コストやサブスクとの損益分岐点をシミュレーションします。');

fs.writeFileSync(pricingFile, pricingContent);

// Update AiSubscriptionTool.tsx
subContent = subContent.replace(/export default function AiPricingTool/, 'export default function AiSubscriptionTool');
subContent = subContent.replace(/<button\s+onClick=\{\(\) => setViewMode\('api'\)\}[\s\S]*?<\/button>/, '');
subContent = subContent.replace(/<button\s+onClick=\{\(\) => setViewMode\('breakeven'\)\}[\s\S]*?<\/button>/, '');

// Remove API and breakeven views
subContent = subContent.replace(/\{\/\* ---------------- ⚖️ VIEW: 損益分岐点シミュレータ ---------------- \*\/\}([\s\S]*?)({viewMode === 'diagnosis' && \()/g, '$2');
subContent = subContent.replace(/\{\/\* ---------------- ⚙️ VIEW: API料金シミュレータ ---------------- \*\/\}([\s\S]*?)<\/div>\n      \)\}\n\n      \{\/\* ---------------- ⚖️ VIEW/g, '  {/* ---------------- ⚖️ VIEW');

// Fix title and default viewMode
subContent = subContent.replace(/const \[viewMode, setViewMode\] = useState<'api' \| 'breakeven' \| 'matrix' \| 'diagnosis'>\('matrix'\)/, `const [viewMode, setViewMode] = useState<'matrix' | 'diagnosis'>('matrix')`);
subContent = subContent.replace(/AI料金比較＆為替シミュレーター/g, 'AIサブスク管理');
subContent = subContent.replace(/定額サブスクプランとAPI従量課金を一括比較。最適なAIの構成をコンシェルジュが提案します。/, '各AIサービスのサブスクリプション構成やマトリックス比較、コンシェルジュによる最適なプラン診断を行います。');

fs.writeFileSync(subFile, subContent);

console.log('Tools split successfully');
