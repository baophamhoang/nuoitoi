/**
 * Export donations and expenses from Supabase to JSON files.
 *
 * Usage (Node 20.6+):
 *   node --env-file=.env scripts/export-supabase.mjs
 *
 * Or pass vars inline:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-key \
 *   node scripts/export-supabase.mjs
 *
 * Output: scripts/data/donations.json, scripts/data/expenses.json
 */

import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));

const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!NEXT_PUBLIC_SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const headers = {
  apikey: SERVICE_ROLE_KEY,
  Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
};

const ORDER_COLUMN = {
  donations: 'created_at',
  expenses: 'updated_at',
};

async function fetchAll(table) {
  const order = ORDER_COLUMN[table] ?? 'created_at';
  const url = `${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}?select=*&order=${order}.asc`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch ${table}: ${res.status} ${text}`);
  }
  return res.json();
}

async function main() {
  const outDir = join(__dir, 'data');
  mkdirSync(outDir, { recursive: true });

  console.log('Exporting donations...');
  const donations = await fetchAll('donations');
  writeFileSync(join(outDir, 'donations.json'), JSON.stringify(donations, null, 2));
  console.log(`  → ${donations.length} rows written to scripts/data/donations.json`);

  console.log('Exporting expenses...');
  const expenses = await fetchAll('expenses');
  writeFileSync(join(outDir, 'expenses.json'), JSON.stringify(expenses, null, 2));
  console.log(`  → ${expenses.length} rows written to scripts/data/expenses.json`);

  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
