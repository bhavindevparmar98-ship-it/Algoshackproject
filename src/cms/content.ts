import { db } from "./db";
import { getModuleDef, type Field, type ModuleDef, type Row } from "./modules";
import { isPayloadEnabled, payloadList, payloadSingle } from "./payload";

export interface Item {
  id: number;
  position: number;
  data: Row;
}

const HEADER = (key: string) => `${key}:header`;

const parse = (value: unknown): Row => {
  try {
    return JSON.parse(String(value)) as Row;
  } catch {
    return {};
  }
};

/* ---------- seeding: the first read copies the built-in defaults into the database ---------- */

const seed = async (moduleDef: ModuleDef) => {
  const connection = await db();
  const claim = await connection.execute({
    sql: "INSERT OR IGNORE INTO meta (key, value) VALUES (?, '1')",
    args: [`seeded:${moduleDef.key}`],
  });
  if (claim.rowsAffected === 0) return;

  const statements: { sql: string; args: (string | number)[] }[] = [];
  const insert = (module: string, position: number, row: Row) =>
    statements.push({
      sql: "INSERT INTO content (module, position, data, updated_by) VALUES (?, ?, ?, 'system')",
      args: [module, position, JSON.stringify(row)],
    });

  if (moduleDef.kind === "single") insert(moduleDef.key, 0, moduleDef.defaults as Row);
  else (moduleDef.defaults as Row[]).forEach((row, index) => insert(moduleDef.key, index, row));
  if (moduleDef.headerDefaults) insert(HEADER(moduleDef.key), 0, moduleDef.headerDefaults);

  await connection.batch(statements, "write");
};

const rows = async (module: string): Promise<Item[]> => {
  const connection = await db();
  const result = await connection.execute({
    sql: "SELECT id, position, data FROM content WHERE module = ? ORDER BY position, id",
    args: [module],
  });
  return result.rows.map((row) => ({ id: Number(row.id), position: Number(row.position), data: parse(row.data) }));
};

const requireDef = (key: string) => {
  const moduleDef = getModuleDef(key);
  if (!moduleDef) throw new Error(`Unknown CMS module: ${key}`);
  return moduleDef;
};

/* ---------- reads (admin) ---------- */

export const getItems = async (key: string): Promise<Item[]> => {
  await seed(requireDef(key));
  return rows(key);
};

export const getItem = async (key: string, id: number): Promise<Item | null> =>
  (await getItems(key)).find((item) => item.id === id) ?? null;

export const getSingle = async (key: string): Promise<Row> => {
  const moduleDef = requireDef(key);
  await seed(moduleDef);
  return (await rows(key))[0]?.data ?? (moduleDef.defaults as Row);
};

export const getHeader = async (key: string): Promise<Row> => {
  const moduleDef = requireDef(key);
  await seed(moduleDef);
  return (await rows(HEADER(key)))[0]?.data ?? moduleDef.headerDefaults ?? {};
};

/* ---------- reads (public site): never throw, fall back to the built-in defaults ---------- */

export const loadList = async (key: string) => {
  const moduleDef = requireDef(key);
  if (isPayloadEnabled()) {
    try {
      return await payloadList(key);
    } catch (error) {
      console.error(`[cms] Payload unavailable for "${key}", using local CMS`, error);
    }
  }
  try {
    const [items, header] = await Promise.all([getItems(key), moduleDef.headerFields ? getHeader(key) : Promise.resolve({})]);
    return { items: items.map((item) => item.data), header: { ...moduleDef.headerDefaults, ...header } as Row };
  } catch (error) {
    console.error(`[cms] falling back to defaults for "${key}"`, error);
    return { items: moduleDef.defaults as Row[], header: (moduleDef.headerDefaults ?? {}) as Row };
  }
};

export const loadSingle = async (key: string): Promise<Row> => {
  const moduleDef = requireDef(key);
  if (isPayloadEnabled()) {
    try {
      return await payloadSingle(key);
    } catch (error) {
      console.error(`[cms] Payload unavailable for "${key}", using local CMS`, error);
    }
  }
  try {
    return { ...(moduleDef.defaults as Row), ...(await getSingle(key)) };
  } catch (error) {
    console.error(`[cms] falling back to defaults for "${key}"`, error);
    return moduleDef.defaults as Row;
  }
};

/* ---------- writes ---------- */

export const createItem = async (key: string, data: Row, author: string) => {
  const moduleDef = requireDef(key);
  await seed(moduleDef);
  const connection = await db();
  await connection.execute({
    sql: `INSERT INTO content (module, position, data, updated_by)
          VALUES (?, COALESCE((SELECT MAX(position) + 1 FROM content WHERE module = ?), 0), ?, ?)`,
    args: [key, key, JSON.stringify(data), author],
  });
};

export const updateItem = async (key: string, id: number, data: Row, author: string) => {
  const connection = await db();
  await connection.execute({
    sql: "UPDATE content SET data = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND module = ?",
    args: [JSON.stringify(data), author, id, key],
  });
};

export const saveSingle = async (key: string, data: Row, author: string) => {
  const items = await rows(key);
  if (items[0]) await updateItem(key, items[0].id, data, author);
  else await createItem(key, data, author);
};

export const saveHeader = async (key: string, data: Row, author: string) => {
  await getHeader(key);
  const items = await rows(HEADER(key));
  const connection = await db();
  if (items[0]) {
    await connection.execute({
      sql: "UPDATE content SET data = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      args: [JSON.stringify(data), author, items[0].id],
    });
  } else {
    await connection.execute({
      sql: "INSERT INTO content (module, position, data, updated_by) VALUES (?, 0, ?, ?)",
      args: [HEADER(key), JSON.stringify(data), author],
    });
  }
};

export const deleteItem = async (key: string, id: number) => {
  const connection = await db();
  await connection.execute({ sql: "DELETE FROM content WHERE id = ? AND module = ?", args: [id, key] });
};

export const moveItem = async (key: string, id: number, direction: "up" | "down") => {
  const items = await getItems(key);
  const index = items.findIndex((item) => item.id === id);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= items.length) return;

  const reordered = [...items];
  [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
  const connection = await db();
  await connection.batch(
    reordered.map((item, position) => ({ sql: "UPDATE content SET position = ? WHERE id = ?", args: [position, item.id] })),
    "write"
  );
};

/* ---------- form input -> safe row ---------- */

// Only web links, mail/phone links, anchors and site-relative paths are kept (blocks javascript: URLs)
export const safeUrl = (value: string) => {
  const url = value.trim();
  if (!url) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) return url;
  if (url.startsWith("#") || (url.startsWith("/") && !url.startsWith("//"))) return url;
  return "";
};

export interface FormResult {
  data: Row;
  errors: string[];
}

export const readFields = (
  fields: Field[],
  form: FormData,
  existing: Row = {},
  uploads: Record<string, string> = {}
): FormResult => {
  const data: Row = {};
  const errors: string[] = [];

  for (const field of fields) {
    const raw = form.get(field.name);
    const text = typeof raw === "string" ? raw.replace(/\r\n/g, "\n").trim() : "";
    let value: string | number | boolean;

    switch (field.type) {
      case "checkbox":
        value = form.has(field.name);
        break;
      case "number": {
        const number = Number(text);
        value = text && Number.isFinite(number) ? number : 0;
        break;
      }
      case "url":
        value = safeUrl(text);
        if (text && !value) errors.push(`${field.label}: enter a full http(s) link, a /path or an #anchor.`);
        break;
      case "image":
        value = uploads[field.name] ?? safeUrl(text);
        if (!uploads[field.name] && text && !value) errors.push(`${field.label}: invalid image URL.`);
        break;
      case "select":
        value = field.options?.includes(text) ? text : String(field.options?.[0] ?? "");
        break;
      case "textarea":
        value = text.slice(0, 8000);
        break;
      default:
        value = text.slice(0, 1000);
    }

    if (field.required && (value === "" || value === undefined)) errors.push(`${field.label} is required.`);
    data[field.name] = value;
  }

  return { data, errors };
};

/* ---------- helpers for rendering ---------- */

const SVG_TAGS = new Set(["path", "rect", "circle", "ellipse", "line", "polyline", "polygon"]);
const SVG_ATTRS = new Set(["d", "x", "y", "width", "height", "rx", "ry", "cx", "cy", "r", "x1", "x2", "y1", "y2", "points"]);

// Icon markup is rendered with set:html, so only plain SVG shapes with safe attributes are allowed through
export const sanitizeSvgShapes = (markup: string) =>
  [...markup.matchAll(/<([a-z]+)\s+([^<>]*?)\/?>/gi)]
    .filter(([, tag]) => SVG_TAGS.has(tag.toLowerCase()))
    .map(([, tag, attributes]) => {
      const safe = [...attributes.matchAll(/([a-z0-9]+)="([^"<>]*)"/gi)]
        .filter(([, name, value]) => SVG_ATTRS.has(name.toLowerCase()) && /^[\w\s.,+\-]*$/.test(value))
        .map(([, name, value]) => `${name}="${value}"`)
        .join(" ");
      return `<${tag.toLowerCase()} ${safe}/>`;
    })
    .join("");
