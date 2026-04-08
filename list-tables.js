import { Pool } from 'pg';
import * as fs from 'fs';

const envContent = fs.readFileSync('./.env.local', 'utf-8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
if (!dbUrlMatch) {
  console.error('No se encontró DATABASE_URL');
  process.exit(1);
}
const dbUrl = dbUrlMatch[1].trim().replace('[YOUR-PASSWORD]', 'postgres');

const pool = new Pool({ connectionString: dbUrl });

async function listTables() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('📋 Tablas en Supabase:\n');
    result.rows.forEach(row => {
      console.log('  - ' + row.table_name);
    });
    console.log('\nTotal:', result.rows.length, 'tablas');
  } finally {
    client.release();
    await pool.end();
  }
}

listTables();
