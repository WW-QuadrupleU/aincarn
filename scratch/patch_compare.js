const fs = require('fs');
const file = require('path').join(__dirname, '../components/AiModelCompareTool.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Rename page title
content = content.replace(/<h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">AIモデル比較ツール<\/h1>/g, '<h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">AI性能比較ツール</h1>');

// 2. Compact ModelSummary cards
content = content.replace(/<div className="rounded-\[20px\] border border-white\/75 bg-white\/90 p-3 shadow-sm shadow-slate-950\/5 backdrop-blur">/g, '<div className="rounded-[16px] border border-white/75 bg-white/90 p-2 shadow-sm shadow-slate-950/5 backdrop-blur">');

content = content.replace(
  /<div className="mb-3">\s*<p className="text-xs font-black text-slate-500">\{model\.creator\} \/ \{model\.family\}<\/p>\s*<h3 className="text-lg font-extrabold text-slate-950">\{model\.name\}<\/h3>\s*<p className="mt-1 text-xs text-gray-400">([\s\S]*?)<\/p>\s*\{model\.metric && <p className="mt-2 text-xs leading-relaxed text-gray-500">\{model\.metric\}<\/p>\}\s*<\/div>/,
  `<div className="mb-2 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black text-slate-500">{model.creator} / {model.family}</p>
          <h3 className="text-base font-extrabold text-slate-950 leading-tight">{model.name}</h3>
        </div>
        {model.metric && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap ml-2">{model.metric}</span>}
      </div>
      <div className="mb-2">
        <p className="text-[10px] text-gray-400 leading-tight">$1</p>
      </div>`
);

content = content.replace(/<div className="grid gap-2">/g, '<div className="grid gap-1.5">');
content = content.replace(/<div className="mt-3 grid gap-2 sm:grid-cols-2">/g, '<div className="mt-2 grid gap-1.5 sm:grid-cols-2">');
content = content.replace(/<div className="mt-3 rounded-xl border border-slate-100 bg-white\/72 p-2 text-\[11px\] leading-relaxed text-gray-500">/g, '<div className="mt-2 rounded-xl border border-slate-100 bg-white/72 p-1.5 text-[10px] leading-relaxed text-gray-500">');

fs.writeFileSync(file, content);
console.log('Fixed AiModelCompareTool.tsx');
