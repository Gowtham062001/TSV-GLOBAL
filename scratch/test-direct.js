const { Client } = require("pg");
require("dotenv").config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
console.log("Testing connection to:", connectionString.split("@")[1]);

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await client.connect();
  console.log("Connected successfully!");
  const res = await client.query("SELECT NOW()");
  console.log("Time from DB:", res.rows[0]);
  await client.end();
}

main().catch(err => {
  console.error("Connection failed:", err);
  process.exit(1);
});
