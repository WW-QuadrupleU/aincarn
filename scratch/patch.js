const fs = require('fs');
let content = fs.readFileSync('lib/ai-database.ts', 'utf8');
content = content.replace(/matrixX: \('general' \| 'writing' \| 'coding' \| 'media'\)\[\]/g, "matrixX: ('general' | 'coding' | 'media')[]");
content = content.replace(/matrixX: \['general', 'writing', 'coding', 'media'\]/g, "matrixX: ['general', 'coding', 'media']");
content = content.replace(/matrixX: \['general', 'writing', 'coding'\]/g, "matrixX: ['general', 'coding']");
content = content.replace(/matrixX: \['general', 'writing'\]/g, "matrixX: ['general']");
fs.writeFileSync('lib/ai-database.ts', content);
console.log('Replaced writing from matrixX in lib/ai-database.ts');
