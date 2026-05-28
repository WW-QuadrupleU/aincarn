const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
const tokenMatch = env.match(/NOTION_TOKEN="([^"]+)"/);
const dbMatch = env.match(/NOTION_LAB_OUTPUTS_DB_ID="([^"]+)"/);
if (!tokenMatch || !dbMatch) { console.log('Missing env vars'); process.exit(1); }
const token = tokenMatch[1];
const dbId = dbMatch[1];

fetch('https://api.notion.com/v1/databases/' + dbId + '/query', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    filter: { property: 'Category', select: { equals: 'writing' } },
    page_size: 5,
  }),
})
.then(r => r.json())
.then(j => {
  console.log('Object:', j.object);
  console.log('Results count:', j.results?.length);
  if (j.results) {
    j.results.forEach(p => {
      const model = p.properties.Model?.title?.[0]?.plain_text || '?';
      const cat = p.properties.Category?.select?.name || '?';
      const order = p.properties.Order?.number ?? '?';
      console.log('  -', model, '| Category:', cat, '| Order:', order);
    });
  }
  if (j.code) console.log('Error:', j.code, j.message);
})
.catch(e => console.error(e));
