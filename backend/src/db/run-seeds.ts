import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const seedsDir = path.join(__dirname, 'seeds');

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS seed_runs (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const files = (await readdir(seedsDir)).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    const applied = await pool.query('SELECT 1 FROM seed_runs WHERE id = $1', [file]);
    if (applied.rowCount) continue;

    const sql = await readFile(path.join(seedsDir, file), 'utf8');
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO seed_runs (id) VALUES ($1)', [file]);
      await pool.query('COMMIT');
      console.log(`seeded ${file}`);
    } catch (error) {
      await pool.query('ROLLBACK');
      throw error;
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
