
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error("Usage: tsx scripts/generate-admin-hash.ts <your-password>");
  console.error("Password must be between 32-64 characters");
  process.exit(1);
}

if (password.length < 32 || password.length > 64) {
  console.error("Password must be between 32-64 characters");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nGenerated hash:");
console.log(hash);
console.log("\nAdd this to your Secrets in Replit:");
console.log("Key: ADMIN_PASSWORD_HASH");
console.log("Value:", hash);
