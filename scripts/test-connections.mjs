import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// Load .env from project root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Lazy import built modules to avoid TS paths
const { createWooCommerceClient } = await import("../dist/woocommerce.js");

async function testWoo() {
  try {
    const woo = createWooCommerceClient();
    const status = await woo.get("/system_status");
    return { 
      ok: true, 
      status: { 
        environment: status?.environment, 
        database: status?.database 
      } 
    };
  } catch (err) {
    return { ok: false, error: String(err?.message || err) };
  }
}

async function testWordPressDB() {
  try {
    // Check if we have DB credentials
    const hasDbCreds = process.env.WP_DB_HOST && 
                      process.env.WP_DB_USER && 
                      process.env.WP_DB_PASSWORD && 
                      process.env.WP_DB_NAME;
    
    if (!hasDbCreds) {
      return { 
        ok: false, 
        error: "Missing WordPress DB credentials in .env",
        suggestion: "Add WP_DB_HOST, WP_DB_USER, WP_DB_PASSWORD, WP_DB_NAME to .env"
      };
    }

    // Try to import and test DB connection
    const { optimizeAttachmentAltText } = await import("../dist/wordpress.js");
    const res = await optimizeAttachmentAltText({
      WP_DB_HOST: process.env.WP_DB_HOST,
      WP_DB_PORT: process.env.WP_DB_PORT,
      WP_DB_USER: process.env.WP_DB_USER,
      WP_DB_PASSWORD: process.env.WP_DB_PASSWORD,
      WP_DB_NAME: process.env.WP_DB_NAME,
      WP_DB_TABLE_PREFIX: process.env.WP_DB_TABLE_PREFIX,
    });
    
    return { ok: true, updatedProbe: res?.updated ?? 0 };
  } catch (err) {
    const e = err || {};
    
    // Provide helpful suggestions based on error type
    let suggestion = "";
    if (e.code === "ECONNREFUSED") {
      suggestion = "Database connection refused. Try: 1) SSH tunnel, 2) Public MySQL host, or 3) Check firewall settings";
    } else if (e.code === "ER_ACCESS_DENIED_ERROR") {
      suggestion = "Database access denied. Check username/password in .env";
    } else if (e.code === "ER_BAD_DB_ERROR") {
      suggestion = "Database doesn't exist. Check WP_DB_NAME in .env";
    }
    
    return {
      ok: false,
      error: String(e.message || e),
      code: e.code,
      errno: e.errno,
      sqlState: e.sqlState,
      sqlMessage: e.sqlMessage,
      suggestion,
      stack: typeof e.stack === "string" ? e.stack.split("\n").slice(0, 3) : undefined,
    };
  }
}

console.log("🔍 Testing connections...\n");

const [wooRes, wpRes] = await Promise.all([testWoo(), testWordPressDB()]);

const summary = {
  woocommerce: wooRes,
  wordpressDb: wpRes,
};

console.log(JSON.stringify(summary, null, 2));

// Only exit with error if WooCommerce fails (DB is optional for basic functionality)
if (!wooRes.ok) {
  console.log("\n❌ WooCommerce connection failed - this is required!");
  process.exitCode = 1;
} else if (!wpRes.ok) {
  console.log("\n⚠️  WordPress DB connection failed - some features may not work");
  console.log("💡 Suggestion:", wpRes.suggestion || "Check your .env file");
} else {
  console.log("\n✅ All connections successful!");
}
