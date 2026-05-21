const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  const res = await pool.query('SELECT email, role FROM "AdminUser"');
  console.log('--- Admin Users ---');
  console.log(res.rows);
  await pool.end();
}

main().catch(console.error);
