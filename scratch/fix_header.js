const fs = require('fs');
const file = require('path').join(__dirname, '../components/Header.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace standard links
content = content.replace(
  /<Link href="\/tools\/ai-model-compare" className="rounded-full px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">\s*AIモデル比較\s*<\/Link>/,
  `<Link href="/tools/ai-model-compare" className="rounded-full px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
            AI性能比較
          </Link>`
);
content = content.replace(
  /<Link href="\/tools\/ai-pricing" className="rounded-full px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">\s*AI料金計算\s*<\/Link>/,
  `<Link href="/tools/ai-pricing" className="rounded-full px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
            AI料金比較
          </Link>
          <Link href="/tools/ai-subscription" className="rounded-full px-3 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950">
            AIサブスク管理
          </Link>`
);

// Replace mobile links
content = content.replace(
  /<Link href="\/tools\/ai-model-compare" className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm shadow-slate-950\/5">\s*AIモデル比較\s*<\/Link>/,
  `<Link href="/tools/ai-model-compare" className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm shadow-slate-950/5">
          AI性能比較
        </Link>`
);
content = content.replace(
  /<Link href="\/tools\/ai-pricing" className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm shadow-slate-950\/5">\s*AI料金計算\s*<\/Link>/,
  `<Link href="/tools/ai-pricing" className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm shadow-slate-950/5">
          AI料金比較
        </Link>
        <Link href="/tools/ai-subscription" className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-600 shadow-sm shadow-slate-950/5">
          AIサブスク管理
        </Link>`
);

fs.writeFileSync(file, content);
console.log('Fixed Header');
