import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, 'migrations');

async function main() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();

  for (const file of files) {
    const applied = await pool.query('SELECT 1 FROM schema_migrations WHERE id = $1', [file]);
    if (applied.rowCount) continue;

    const sql = await readFile(path.join(migrationsDir, file), 'utf8');
    await pool.query('BEGIN');
    try {
      await pool.query(sql);
      await pool.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
      await pool.query('COMMIT');
      console.log(`applied ${file}`);
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
