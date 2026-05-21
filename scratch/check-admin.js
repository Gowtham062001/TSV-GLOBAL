const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function main() {
  const email = "media@tsvhomes.in";
  const password = "TSVGlobal0415";

  console.log(`Checking DB for user: ${email} using direct pg connection...`);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    const res = await client.query('SELECT id, name, email, "passwordHash", "isActive", role FROM "AdminUser" WHERE email = $1', [email]);

    if (res.rows.length === 0) {
      console.log(`❌ User not found with email: ${email}`);
      return;
    }

    const user = res.rows[0];
    console.log(`Found user in DB:`, {
      id: user.id,
      name: user.name,
      email: user.email,
      isActive: user.isActive,
      role: user.role,
    });

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (isPasswordValid) {
      console.log(`\n✅ PASSWORD IS CORRECT! The password '${password}' matches the stored hash.`);
    } else {
      console.log(`\n❌ PASSWORD IS INCORRECT! The password '${password}' does NOT match the stored hash.`);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("Error occurred:", e);
});
