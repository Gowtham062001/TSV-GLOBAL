const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.zuwhxkwcsumvsecrejfa:%21awg%23h2PEuW2B%23%2A@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require"
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, title, slug, "parentId", "isVisible", status FROM "Service"');
  console.table(res.rows);
  await client.end();
}

main().catch(console.error);
