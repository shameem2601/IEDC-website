/**
 * Bulk Member Importer for Sanity CMS (IEDC MTM)
 * Converts a CSV or JSON file of members into Sanity NDJSON format
 * for instant import via: `npx sanity dataset import members.ndjson production`
 */
import fs from 'fs';
import path from 'path';

const inputFile = process.argv[2] || 'members.csv';
const outputFile = process.argv[3] || 'members.ndjson';

if (!fs.existsSync(inputFile)) {
  console.log(`\n❌ File not found: ${inputFile}`);
  console.log(`Usage: node scripts/convert-csv-to-ndjson.mjs <input.csv|input.json> [output.ndjson]\n`);
  process.exit(1);
}

let members = [];

if (inputFile.endsWith('.json')) {
  const raw = fs.readFileSync(inputFile, 'utf-8');
  members = JSON.parse(raw);
} else {
  // Parse CSV
  const raw = fs.readFileSync(inputFile, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length <= 1) {
    console.log('CSV file is empty or only contains headers');
    process.exit(1);
  }
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
    const entry = {};
    headers.forEach((h, idx) => {
      entry[h] = cols[idx] || '';
    });
    members.push(entry);
  }
}

const ndjsonLines = members.map((m, idx) => {
  const name = m.name || m.fullname || `Member ${idx + 1}`;
  const initials = m.initials || name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'TM';
  const role = m.role || m.designation || 'Member';
  const rawHierarchy = (m.hierarchy || m.tier || 'member').toLowerCase();
  const hierarchy = rawHierarchy.includes('nodal') || rawHierarchy.includes('faculty') 
    ? 'nodal' 
    : rawHierarchy.includes('exec') 
      ? 'executive' 
      : 'member';

  return JSON.stringify({
    _id: `member-${Date.now()}-${idx}`,
    _type: 'teamMember',
    name,
    initials,
    role,
    hierarchy,
    badgeIcon: m.badgeicon || 'person',
    linkedin: m.linkedin || undefined,
    instagram: m.instagram || undefined,
    github: m.github || undefined,
    twitter: m.twitter || undefined,
    order: Number(m.order) || idx,
  });
});

fs.writeFileSync(outputFile, ndjsonLines.join('\n') + '\n', 'utf-8');
console.log(`\n✅ Successfully generated ${outputFile} with ${members.length} members!`);
console.log(`\nTo import these members into your live Sanity dataset, run:`);
console.log(`  npx sanity dataset import ${outputFile} production\n`);