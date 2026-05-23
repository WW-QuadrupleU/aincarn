const fs = require('fs');
const file = require('path').join(__dirname, '../lib/ai-database.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /const ZERO_PERFORMANCE: Record<AiGenreId, number> = {[\s\S]*?}/,
  `const ZERO_PERFORMANCE: Record<AiGenreId, number> = {
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
}`
);

fs.writeFileSync(file, content);
console.log('Fixed ZERO_PERFORMANCE');
