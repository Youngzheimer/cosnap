import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { env } from "$env/dynamic/private";
import { dev } from "$app/environment";
import { resetDevValue } from "./devvalue";
import * as schema from "./schema";

const databaseUrl = env.DATABASE_URL ?? "file:./data/db.sqlite";
const filePath = databaseUrl.startsWith("file:")
	? databaseUrl.slice("file:".length)
	: databaseUrl;
const directory = path.dirname(filePath);

if (directory && directory !== "." && !fs.existsSync(directory)) {
	fs.mkdirSync(directory, { recursive: true });
}

const sqlite = new Database(filePath);

export const db = drizzle(sqlite, { schema });

if (dev) {
    resetDevValue();
}
