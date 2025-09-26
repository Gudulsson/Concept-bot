import fetch from "cross-fetch";
export function createWooCommerceClient(opts = {}) {
    const baseUrl = (opts.baseUrl ?? process.env.WOOCOMMERCE_URL ?? "").replace(/\/$/, "");
    const apiVersion = opts.apiVersion ?? process.env.WOOCOMMERCE_API_VERSION ?? "wc/v3";
    const consumerKey = opts.consumerKey ?? process.env.WOOCOMMERCE_CONSUMER_KEY ?? "";
    const consumerSecret = opts.consumerSecret ?? process.env.WOOCOMMERCE_CONSUMER_SECRET ?? "";
    if (!baseUrl)
        throw new Error("Missing WOOCOMMERCE_URL");
    if (!consumerKey)
        throw new Error("Missing WOOCOMMERCE_CONSUMER_KEY");
    if (!consumerSecret)
        throw new Error("Missing WOOCOMMERCE_CONSUMER_SECRET");
    async function request(opts) {
        const method = opts.method ?? "GET";
        const path = opts.path;
        const search = new URLSearchParams();
        search.set("consumer_key", consumerKey);
        search.set("consumer_secret", consumerSecret);
        const query = opts.query;
        for (const [k, v] of Object.entries(query ?? {})) {
            if (v !== undefined && v !== null)
                search.set(k, String(v));
        }
        const url = `${baseUrl}/wp-json/${apiVersion}${path}${search.toString() ? "?" + search.toString() : ""}`;
        const headers = { "Content-Type": "application/json" };
        const init = { method, headers };
        if (opts.body !== undefined) {
            init.body = JSON.stringify(opts.body);
        }
        const res = await fetch(url, init);
        if (!res.ok) {
            const text = await res.text().catch(() => "");
            throw new Error(`WooCommerce request failed ${res.status}: ${text}`);
        }
        return (await res.json());
    }
    return {
        get: (path, query) => {
            const opts = { method: "GET", path };
            if (query)
                opts.query = query;
            return request(opts);
        },
        post: (path, body, query) => {
            const opts = { method: "POST", path, body };
            if (query)
                opts.query = query;
            return request(opts);
        },
        put: (path, body, query) => {
            const opts = { method: "PUT", path, body };
            if (query)
                opts.query = query;
            return request(opts);
        },
        delete: (path, query) => {
            const opts = { method: "DELETE", path };
            if (query)
                opts.query = query;
            return request(opts);
        },
        patch: (path, body, query) => {
            const opts = { method: "PATCH", path, body };
            if (query)
                opts.query = query;
            return request(opts);
        },
    };
}
//# sourceMappingURL=woocommerce.js.map