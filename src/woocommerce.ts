import fetch from "cross-fetch";

export interface WooCommerceClientOptions {
	baseUrl?: string | undefined;
	consumerKey?: string | undefined;
	consumerSecret?: string | undefined;
	apiVersion?: string | undefined;
}

export interface WooRequestOptions {
	method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | undefined;
	path: string;
	query?: Record<string, unknown> | undefined;
	body?: unknown;
}

export function createWooCommerceClient(opts: WooCommerceClientOptions = {}) {
	const baseUrl = (opts.baseUrl ?? process.env.WOOCOMMERCE_URL ?? "").replace(/\/$/, "");
	const apiVersion = opts.apiVersion ?? process.env.WOOCOMMERCE_API_VERSION ?? "wc/v3";
	const consumerKey = opts.consumerKey ?? process.env.WOOCOMMERCE_CONSUMER_KEY ?? "";
	const consumerSecret = opts.consumerSecret ?? process.env.WOOCOMMERCE_CONSUMER_SECRET ?? "";

	if (!baseUrl) throw new Error("Missing WOOCOMMERCE_URL");
	if (!consumerKey) throw new Error("Missing WOOCOMMERCE_CONSUMER_KEY");
	if (!consumerSecret) throw new Error("Missing WOOCOMMERCE_CONSUMER_SECRET");

	async function request<T = unknown>(opts: WooRequestOptions): Promise<T> {
		const method = opts.method ?? "GET";
		const path = opts.path;
		const search = new URLSearchParams();
		search.set("consumer_key", consumerKey);
		search.set("consumer_secret", consumerSecret);
		const query = opts.query;
		for (const [k, v] of Object.entries(query ?? {})) {
			if (v !== undefined && v !== null) search.set(k, String(v));
		}
		const url = `${baseUrl}/wp-json/${apiVersion}${path}${search.toString() ? "?" + search.toString() : ""}`;
		const headers: Record<string, string> = { "Content-Type": "application/json" };
		const init: RequestInit = { method, headers };
		if (opts.body !== undefined) {
			(init as any).body = JSON.stringify(opts.body);
		}
		const res = await fetch(url, init);
		if (!res.ok) {
			const text = await res.text().catch(() => "");
			throw new Error(`WooCommerce request failed ${res.status}: ${text}`);
		}
		return (await res.json()) as T;
	}

	return {
		get: (path: string, query?: Record<string, unknown>) => {
			const opts: WooRequestOptions = { method: "GET", path };
			if (query) opts.query = query;
			return request(opts);
		},
		post: (path: string, body?: unknown, query?: Record<string, unknown>) => {
			const opts: WooRequestOptions = { method: "POST", path, body };
			if (query) opts.query = query;
			return request(opts);
		},
		put: (path: string, body?: unknown, query?: Record<string, unknown>) => {
			const opts: WooRequestOptions = { method: "PUT", path, body };
			if (query) opts.query = query;
			return request(opts);
		},
		delete: (path: string, query?: Record<string, unknown>) => {
			const opts: WooRequestOptions = { method: "DELETE", path };
			if (query) opts.query = query;
			return request(opts);
		},
		patch: (path: string, body?: unknown, query?: Record<string, unknown>) => {
			const opts: WooRequestOptions = { method: "PATCH", path, body };
			if (query) opts.query = query;
			return request(opts);
		},
	};
}
