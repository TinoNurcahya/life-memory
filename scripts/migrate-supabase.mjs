import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;

console.log("=== LIFE MEMORY — SUPABASE DATABASE MIGRATION ===");

if (!connectionString) {
  console.error("Error: Missing DATABASE_URL in .env.local.");
  console.error("Please add your Supabase connection string to .env.local:");
  console.error("DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres");
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  console.log("Connecting to Supabase PostgreSQL database…");
  await client.connect();
  console.log("Connected successfully!\n");

  const migrationFiles = [
    "supabase/migrations/20261020000000_init_life_memory.sql",
    "supabase/migrations/20261020000001_vertical_slice_hardening.sql",
    "supabase/migrations/20261020000002_chat_messages.sql",
    "supabase/migrations/20261020000003_chat_sessions.sql",
    "supabase/migrations/20261020000004_backfill_profiles.sql",
    "supabase/migrations/20261020000005_activity_images.sql",
  ];

  for (const relPath of migrationFiles) {
    const fullPath = resolve(process.cwd(), relPath);
    console.log(`Executing migration: ${relPath}…`);
    const sql = await readFile(fullPath, "utf-8");
    await client.query(sql);
    console.log(`✓ Completed ${relPath}\n`);
  }

  console.log("Verifying created tables and views…");
  const tables = [
    "profiles",
    "activities",
    "activity_details",
    "people",
    "places",
    "topics",
    "activity_people",
    "activity_places",
    "activity_topics",
    "insights",
    "chat_sessions",
    "chat_messages",
  ];

  for (const table of tables) {
    const res = await client.query(`SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1`, [table]);
    const exists = Number(res.rows[0]?.count) > 0;
    console.log(`  Table public.${table}: ${exists ? "✓ EXISTS" : "✗ MISSING"}`);
  }

  const views = ["v_topics_with_stats", "v_places_with_stats", "v_people_with_stats"];
  for (const view of views) {
    const res = await client.query(`SELECT count(*) FROM information_schema.views WHERE table_schema = 'public' AND table_name = $1`, [view]);
    const exists = Number(res.rows[0]?.count) > 0;
    console.log(`  View  public.${view}: ${exists ? "✓ EXISTS" : "✗ MISSING"}`);
  }

  console.log("\n=== MIGRATION COMPLETED SUCCESSFULLY ===");
} catch (error) {
  console.error("\nMigration failed with error:", error.message);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
