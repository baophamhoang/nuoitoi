/**
 * Import donations and expenses from JSON files into Turso/SQLite.
 *
 * Usage (Node 20.6+):
 *   node --env-file=.env scripts/import-turso.mjs
 *
 * Or pass vars inline:
 *   TURSO_DATABASE_URL=libsql://your-db.turso.io \
 *   TURSO_AUTH_TOKEN=your-token \
 *   node scripts/import-turso.mjs
 *
 * Input: scripts/data/donations.json, scripts/data/expenses.json
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@libsql/client';

const __dir = dirname(fileURLToPath(import.meta.url));

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL;
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_DATABASE_URL) {
  console.error('Missing env var: TURSO_DATABASE_URL is required');
  process.exit(1);
}

const db = createClient({
  url: TURSO_DATABASE_URL,
  authToken: TURSO_AUTH_TOKEN || undefined,
});

function readJson(filename) {
  const path = join(__dir, 'data', filename);
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    console.error(`Could not read ${path} — run export-supabase.mjs first`);
    process.exit(1);
  }
}

async function importDonations(donations) {
  console.log(`Importing ${donations.length} donations...`);
  let inserted = 0;
  let skipped = 0;

  for (const d of donations) {
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO donations (id, name, amount, message, verified, created_at)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          d.id,
          d.name ?? 'Ẩn danh',
          d.amount,
          d.message ?? null,
          d.verified ? 1 : 0,
          d.created_at,
        ],
      });
      inserted++;
    } catch (e) {
      console.warn(`  Skipped donation ${d.id}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`  → ${inserted} inserted, ${skipped} skipped`);
}

async function importExpenses(expenses) {
  console.log(`Importing ${expenses.length} expenses...`);
  let inserted = 0;
  let skipped = 0;

  for (const e of expenses) {
    try {
      await db.execute({
        sql: `INSERT OR IGNORE INTO expenses
                (id, category, label, description, percentage, spent, budget, color, chart_color, month, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          e.id,
          e.category,
          e.label,
          e.description ?? null,
          e.percentage,
          e.spent ?? 0,
          e.budget,
          e.color ?? null,
          e.chart_color ?? null,
          e.month ?? null,
          e.updated_at,
        ],
      });
      inserted++;
    } catch (err) {
      console.warn(`  Skipped expense ${e.id}: ${err.message}`);
      skipped++;
    }
  }

  console.log(`  → ${inserted} inserted, ${skipped} skipped`);
}

async function main() {
  const donations = readJson('donations.json');
  const expenses = readJson('expenses.json');

  await importDonations(donations);
  await importExpenses(expenses);

  // Summary
  const donationCount = await db.execute('SELECT COUNT(*) AS n FROM donations');
  const expenseCount = await db.execute('SELECT COUNT(*) AS n FROM expenses');
  console.log('\nFinal row counts in Turso:');
  console.log(`  donations: ${donationCount.rows[0].n}`);
  console.log(`  expenses:  ${expenseCount.rows[0].n}`);

  db.close();
  console.log('\nDone.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
