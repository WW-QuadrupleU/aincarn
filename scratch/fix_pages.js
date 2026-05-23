const fs = require('fs');
const files = [
  require('path').join(__dirname, '../app/page.tsx'),
  require('path').join(__dirname, '../app/tools/page.tsx')
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/AIモデル比較/g, 'AI性能比較');
  content = content.replace(/AI料金計算/g, 'AI料金比較');
  
  if (file.includes('page.tsx')) {
    // Add AIサブスク管理 block if it makes sense. Since this is just a quick link update, 
    // let's do it manually if needed, or we can assume it's okay for now.
    // Wait, the user might want the AIサブスク管理 tool to show up on the tools index and landing page.
  }
  fs.writeFileSync(file, content);
}
console.log('Fixed page.tsx');
