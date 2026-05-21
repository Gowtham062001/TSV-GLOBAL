const { Client } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

function generateCuid() {
  // Simple cuid-compatible string generator
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 10);
  const random2 = Math.random().toString(36).substring(2, 10);
  return `c${timestamp}${random1}${random2}`.substring(0, 25);
}

async function main() {
  const email = "media@tsvhomes.in";
  const password = "TSVGlobal0415";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`Setting up/Updating user: ${email} in DB using direct pg connection...`);

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    // Check if user already exists
    const checkRes = await client.query('SELECT id FROM "AdminUser" WHERE email = $1', [email]);

    if (checkRes.rows.length > 0) {
      // Update password and ensure active status
      await client.query(
        'UPDATE "AdminUser" SET "passwordHash" = $1, "isActive" = true, role = \'ADMIN\' WHERE email = $2',
        [hashedPassword, email]
      );
      console.log(`✅ Admin user '${email}' already exists. Password successfully updated to '${password}'!`);
    } else {
      // Insert new user
      const newId = generateCuid();
      await client.query(
        'INSERT INTO "AdminUser" (id, name, email, "passwordHash", role, "isActive") VALUES ($1, $2, $3, $4, \'ADMIN\', true)',
        [newId, "Media Admin", email, hashedPassword]
      );
      console.log(`✅ Admin user '${email}' did not exist. Successfully created new admin account with password '${password}'!`);
    }

    // Double check the result
    const verifyRes = await client.query('SELECT id, name, email, "isActive", role FROM "AdminUser" WHERE email = $1', [email]);
    console.log("Updated User details in DB:", verifyRes.rows[0]);

  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error("Error occurred:", e);
});
