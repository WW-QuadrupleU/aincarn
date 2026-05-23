const fs = require('fs');
const files = [
  require('path').join(__dirname, '../app/page.tsx'),
  require('path').join(__dirname, '../app/tools/page.tsx')
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/\/tools\/subscriptions/g, '/tools/ai-subscription');
  fs.writeFileSync(file, content);
}
console.log('Fixed app/page.tsx and app/tools/page.tsx');
