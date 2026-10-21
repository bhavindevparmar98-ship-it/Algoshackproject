import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHmac } from "node:crypto";
import { promisify } from "node:util";
import { db, type Role } from "./db";

const scrypt = promisify(scryptCallback) as (password: string, salt: Buffer, length: number) => Promise<Buffer>;

const read = (name: string) => process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];

export const SESSION_COOKIE = "algoshack_session";
const SESSION_SECONDS = 60 * 60 * 8;

export interface CmsUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  modules: string[];
}

export const roleLabel: Record<Role, string> = {
  master_admin: "Master Admin",
  admin: "Admin",
  user: "User",
};

/* ---------- passwords ---------- */

export const hashPassword = async (password: string) => {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
};

export const verifyPassword = async (password: string, stored: string) => {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(password, Buffer.from(saltHex, "hex"), expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
};

export const passwordError = (password: string) =>
  password.length < 8 ? "Password must be at least 8 characters." : null;

/* ---------- signed session cookie ---------- */

const secret = () => {
  const value = read("SESSION_SECRET");
  if (value && value.length >= 16) return value;
  if (import.meta.env.DEV) return "dev-only-secret-change-me";
  throw new Error("SESSION_SECRET (min 16 chars) is required in production.");
};

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

export const createSessionToken = (userId: number) => {
  const payload = Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + SESSION_SECONDS * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
};

export const sessionMaxAge = SESSION_SECONDS;

const readSessionToken = (token: string | undefined): number | null => {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = Buffer.from(sign(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof data.uid === "number" && data.exp > Date.now() ? data.uid : null;
  } catch {
    return null;
  }
};

/* ---------- users ---------- */

const toUser = (row: Record<string, unknown>): CmsUser => ({
  id: Number(row.id),
  email: String(row.email),
  name: String(row.name),
  role: row.role as Role,
  modules: String(row.modules ?? "").split(",").filter(Boolean),
});

// The first master admin comes from env; set MASTER_ADMIN_EMAIL / MASTER_ADMIN_PASSWORD
const ensureMasterAdmin = async () => {
  const connection = await db();
  const count = await connection.execute("SELECT COUNT(*) AS total FROM users");
  if (Number(count.rows[0].total) > 0) return;

  const email = read("MASTER_ADMIN_EMAIL") ?? (import.meta.env.DEV ? "master@algoshack.local" : undefined);
  const password = read("MASTER_ADMIN_PASSWORD") ?? (import.meta.env.DEV ? "ChangeMe@123" : undefined);
  if (!email || !password) return;

  await connection.execute({
    sql: "INSERT OR IGNORE INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'master_admin')",
    args: [email.toLowerCase(), "Master Admin", await hashPassword(password)],
  });
};

export const getUserFromCookie = async (token: string | undefined): Promise<CmsUser | null> => {
  const id = readSessionToken(token);
  if (id === null) return null;
  const connection = await db();
  const result = await connection.execute({ sql: "SELECT * FROM users WHERE id = ?", args: [id] });
  return result.rows[0] ? toUser(result.rows[0]) : null;
};

export const authenticate = async (email: string, password: string): Promise<CmsUser | null> => {
  await ensureMasterAdmin();
  const connection = await db();
  const result = await connection.execute({ sql: "SELECT * FROM users WHERE email = ?", args: [email.toLowerCase()] });
  const row = result.rows[0];
  // Always run a hash comparison so timing does not reveal whether the email exists
  const valid = await verifyPassword(password, row ? String(row.password_hash) : "scrypt$00$00");
  return row && valid ? toUser(row) : null;
};

export const listUsers = async (): Promise<CmsUser[]> => {
  const connection = await db();
  const result = await connection.execute("SELECT * FROM users ORDER BY id");
  return result.rows.map(toUser);
};

/* ---------- permissions ---------- */

export const can = {
  view: (user: CmsUser, moduleKey: string) => user.role !== "user" || user.modules.includes(moduleKey),
  edit: (user: CmsUser, moduleKey: string) => user.role !== "user" || user.modules.includes(moduleKey),
  add: (user: CmsUser, moduleKey: string) => user.role !== "user" && can.view(user, moduleKey),
  remove: (user: CmsUser, moduleKey: string) => user.role !== "user" && can.view(user, moduleKey),
  viewUsers: (user: CmsUser) => user.role === "master_admin" || user.role === "admin",
  manageUsers: (user: CmsUser) => user.role === "master_admin",
};

/* ---------- login throttling (per server instance) ---------- */

const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

export const isLocked = (key: string) => (attempts.get(key)?.until ?? 0) > Date.now();

export const recordFailure = (key: string) => {
  const current = attempts.get(key);
  const count = (current && current.until === 0 ? current.count : 0) + 1;
  attempts.set(key, { count, until: count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0 });
};

export const clearFailures = (key: string) => attempts.delete(key);
