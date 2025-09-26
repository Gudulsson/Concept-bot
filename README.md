# Site Optimizer for Concept Solutions

See .env.example for WordPress and WooCommerce integration. Run: npm install && npm run build && npx site-optimizer --mode once.

## Quick Start

1. **Install dependencies**: `npm install`
2. **Build project**: `npm run build` 
3. **Configure .env**: See sections below
4. **Test connections**: `node scripts/test-connections.mjs`
5. **Run optimizer**: `npx site-optimizer --mode once`

## WooCommerce Setup

1. Create API keys in WooCommerce → Settings → Advanced → REST API (Read or Read/Write).
2. Copy keys into your `.env` using the variables below.
3. Ensure permalinks are not set to Plain, and your site is reachable via HTTPS.

**Required .env variables:**
```
WOOCOMMERCE_URL=https://your-site.tld
WOOCOMMERCE_CONSUMER_KEY=ck_xxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxx
WOOCOMMERCE_API_VERSION=wc/v3
```

## WordPress Database Setup

### Option 1: SSH Tunnel (Recommended)
```bash
# Start tunnel (keep this running)
ssh -N -L 3307:127.0.0.1:3306 -i "path/to/key" user@your-server.com

# In .env:
WP_DB_HOST=127.0.0.1
WP_DB_PORT=3307
WP_DB_USER=your_db_user
WP_DB_PASSWORD=your_db_password
WP_DB_NAME=your_db_name
WP_DB_TABLE_PREFIX=wp_
```

### Option 2: Public MySQL Host
```bash
# In .env (get these from your hosting provider):
WP_DB_HOST=mysql.yourhost.com  # NOT localhost
WP_DB_PORT=3306
WP_DB_USER=your_db_user
WP_DB_PASSWORD=your_db_password
WP_DB_NAME=your_db_name
WP_DB_TABLE_PREFIX=wp_
```

### Option 3: Skip Database (WooCommerce only)
If you only need WooCommerce functionality, you can skip the database setup. The optimizer will work with just WooCommerce API keys.

## Usage Examples

### WooCommerce API
```ts
import { createWooCommerceClient } from "./dist/woocommerce.js";

const woo = createWooCommerceClient();
const products = await woo.get("/products", { per_page: 5 });
console.log(products);
```

### Full Optimizer
```bash
# Run once
npx site-optimizer --mode once

# Run continuously
npx site-optimizer --mode watch
```

## Troubleshooting

### "ECONNREFUSED" Error
- **SSH Tunnel**: Make sure tunnel is running and port matches .env
- **Public MySQL**: Check hostname, port, and firewall settings
- **Skip DB**: Remove WP_DB_* variables from .env if not needed

### "Permission denied (publickey)" 
- Check SSH key path and permissions
- Verify username and hostname
- Try different SSH port (often 2222 instead of 22)

### Test Your Setup
```bash
node scripts/test-connections.mjs
```
This will test both WooCommerce and database connections with helpful error messages.
