import { createClient, type Client } from "@libsql/client";

const read = (name: string) => process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];

let client: Client | undefined;
let ready: Promise<Client> | undefined;

const connect = () => {
  client ??= createClient({
    url: read("TURSO_DATABASE_URL") ?? "file:local.db",
    authToken: read("TURSO_AUTH_TOKEN"),
  });
  return client;
};

export const ROLES = ["master_admin", "admin", "user"] as const;
export type Role = (typeof ROLES)[number];

export const db = (): Promise<Client> => {
  ready ??= (async () => {
    const connection = connect();
    await connection.batch(
      [
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL,
          modules TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS content (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          module TEXT NOT NULL,
          position INTEGER NOT NULL DEFAULT 0,
          data TEXT NOT NULL,
          updated_by TEXT,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE INDEX IF NOT EXISTS idx_content_module ON content (module, position)`,
        `CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)`,
      ],
      "write"
    );
    return connection;
  })().catch((error) => {
    // Let the next request retry instead of caching a failed setup
    ready = undefined;
    throw error;
  });

  return ready;
};
