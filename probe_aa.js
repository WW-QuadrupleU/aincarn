const fs = require('fs');
const https = require('https');

const envContent = fs.readFileSync('.env.local', 'utf8');
const match = envContent.match(/ARTIFICIAL_ANALYSIS_API_KEY="([^"]+)"/);
if (!match) {
  console.log("Key not found in .env.local");
  process.exit(1);
}
const key = match[1];

function check(path) {
  return new Promise((resolve) => {
    https.get(`https://artificialanalysis.ai/api/v2${path}`, { headers: { 'x-api-key': key } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`${path}: ${res.statusCode} - ${data.substring(0, 150)}`);
        resolve();
      });
    });
  });
}

async function run() {
  await check('/data/media/text-to-speech');
  await check('/data/audio/text-to-speech');
  await check('/data/media/music-generation');
  await check('/data/media/music');
  await check('/data/media/audio');
  await check('/models');
  await check('/data/audio/music-generation');
}
run();
