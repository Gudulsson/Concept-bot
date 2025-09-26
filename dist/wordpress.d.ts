export interface WordPressEnv {
    WP_UPLOADS_DIR?: string | undefined;
    WP_DB_HOST?: string | undefined;
    WP_DB_PORT?: string | number | undefined;
    WP_DB_USER?: string | undefined;
    WP_DB_PASSWORD?: string | undefined;
    WP_DB_NAME?: string | undefined;
    WP_DB_TABLE_PREFIX?: string | undefined;
}
export declare function ensureApacheWebpRewrite(uploadsDir: string): Promise<boolean>;
export declare function optimizeAttachmentAltText(env: WordPressEnv): Promise<{
    updated: number;
}>;
//# sourceMappingURL=wordpress.d.ts.map