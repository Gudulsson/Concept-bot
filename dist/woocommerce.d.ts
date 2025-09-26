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
export declare function createWooCommerceClient(opts?: WooCommerceClientOptions): {
    get: (path: string, query?: Record<string, unknown>) => Promise<unknown>;
    post: (path: string, body?: unknown, query?: Record<string, unknown>) => Promise<unknown>;
    put: (path: string, body?: unknown, query?: Record<string, unknown>) => Promise<unknown>;
    delete: (path: string, query?: Record<string, unknown>) => Promise<unknown>;
    patch: (path: string, body?: unknown, query?: Record<string, unknown>) => Promise<unknown>;
};
//# sourceMappingURL=woocommerce.d.ts.map