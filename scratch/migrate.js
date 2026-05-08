import { ConvexHttpClient } from "convex/browser";
import { api } from "./convex/_generated/api.js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

async function runMigration() {
  console.log("Starting migration...");
  try {
    const result = await client.mutation(api.users.migrateTeamMembers);
    console.log("Migration result:", result);
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

runMigration();
