# Site Optimizer for Concept Solutions

See .env.example for WordPress and WooCommerce integration. Run: npm install && npm run build && npx site-optimizer --mode once.

## WooCommerce setup

1. Create API keys in WooCommerce → Settings → Advanced → REST API (Read or Read/Write).
2. Copy keys into your `.env` using the variables below.
3. Ensure permalinks are not set to Plain, and your site is reachable via HTTPS.

Required env vars:

```
WOOCOMMERCE_URL=https://your-site.tld
WOOCOMMERCE_CONSUMER_KEY=ck_xxx
WOOCOMMERCE_CONSUMER_SECRET=cs_xxx
WOOCOMMERCE_API_VERSION=wc/v3
```

Usage example (Node):

```ts
import { createWooCommerceClient } from "./dist/woocommerce.js";

const woo = createWooCommerceClient();
const products = await woo.get("/products", { per_page: 5 });
console.log(products);
```
