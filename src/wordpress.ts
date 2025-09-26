import fs from "fs-extra";
import path from "node:path";
import mysql from "mysql2/promise";

export interface WordPressEnv {
	WP_UPLOADS_DIR?: string | undefined;
	WP_DB_HOST?: string | undefined;
	WP_DB_PORT?: string | number | undefined;
	WP_DB_USER?: string | undefined;
	WP_DB_PASSWORD?: string | undefined;
	WP_DB_NAME?: string | undefined;
	WP_DB_TABLE_PREFIX?: string | undefined;
}

export async function ensureApacheWebpRewrite(uploadsDir: string) {
	const htaccessPath = path.join(uploadsDir, ".htaccess");
	const webpRewrite = `
# WebP support
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTP_ACCEPT} image/webp
RewriteCond %{REQUEST_FILENAME} \.(jpe?g|png)$
RewriteCond %{REQUEST_FILENAME}.webp -f
RewriteRule ^(.+)\.(jpe?g|png)$ $1.$2.webp [T=image/webp,E=accept:1]
</IfModule>

<IfModule mod_headers.c>
Header append Vary Accept env=REDIRECT_accept
</IfModule>
`;

	try {
		await fs.ensureDir(uploadsDir);
		await fs.writeFile(htaccessPath, webpRewrite);
		return true;
	} catch (error) {
		console.error("Failed to create .htaccess:", error);
		return false;
	}
}

export async function optimizeAttachmentAltText(env: WordPressEnv) {
	const { WP_DB_HOST, WP_DB_PORT, WP_DB_USER, WP_DB_PASSWORD, WP_DB_NAME, WP_DB_TABLE_PREFIX } = env;
	
	if (!WP_DB_HOST || !WP_DB_USER || !WP_DB_PASSWORD || !WP_DB_NAME) {
		return { updated: 0 };
	}

	const connection = await mysql.createConnection({
		host: WP_DB_HOST,
		port: Number(WP_DB_PORT) || 3306,
		user: WP_DB_USER,
		password: WP_DB_PASSWORD,
		database: WP_DB_NAME,
	});

	try {
		const prefix = WP_DB_TABLE_PREFIX || "wp_";
		const [rows] = await connection.execute(
			`SELECT ID, post_title FROM ${prefix}posts WHERE post_type = 'attachment' AND post_mime_type LIKE 'image/%' AND ID NOT IN (SELECT post_id FROM ${prefix}postmeta WHERE meta_key = '_wp_attachment_image_alt')`
		);

		let updated = 0;
		for (const row of rows as any[]) {
			const altText = row.post_title || `Image ${row.ID}`;
			await connection.execute(
				`INSERT INTO ${prefix}postmeta (post_id, meta_key, meta_value) VALUES (?, '_wp_attachment_image_alt', ?)`,
				[row.ID, altText]
			);
			updated++;
		}

		return { updated };
	} finally {
		await connection.end();
	}
}
