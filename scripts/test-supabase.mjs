import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("=== LIFE MEMORY -- SUPABASE CONNECTIVITY TEST ===");
console.log("Project URL:", url);
console.log("Anon Key Present:", Boolean(anonKey));
console.log("Service Key Present:", Boolean(serviceKey));

if (!url || !anonKey) {
  console.error("Error: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

// 1. Auth service ping
try {
  const start = Date.now();
  const res = await fetch(`${url}/auth/v1/health`, {
    headers: { apikey: anonKey },
  });
  const latency = Date.now() - start;
  console.log(`\n1. Auth Service Health: Status ${res.status} ${res.statusText} (${latency}ms)`);
  if (res.ok) {
    const text = await res.text();
    console.log("   Health body:", text);
  }
} catch (err) {
  console.error("1. Auth Service Ping Failed:", err.message);
}

// 2. Supabase Client Queries
const supabase = createClient(url, anonKey);
console.log("\n2. Testing Queries with Supabase Client:");

const tables = ["profiles", "activities", "activity_details"];

for (const table of tables) {
  const start = Date.now();
  const { data, count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: false })
    .limit(3);
  const latency = Date.now() - start;

  if (error) {
    console.log(`   - Table '${table}': ERROR [${error.code}] ${error.message} (${latency}ms)`);
  } else {
    console.log(`   - Table '${table}': SUCCESS (${latency}ms) - Retrieved ${data?.length || 0} rows (Total: ${count ?? "unknown"})`);
    if (data && data.length > 0) {
      const sample = data[0].email || data[0].full_name || data[0].summary || data[0].id;
      console.log(`     Sample item: ${typeof sample === "string" ? sample.slice(0, 50) : sample}`);
    }
  }
}

console.log("\n=== TEST COMPLETED ===");
