import { getModuleDef, type Row } from "./modules";

const read = (name: string) => process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];

const baseUrl = () => read("PAYLOAD_URL")?.replace(/\/+$/, "");

const get = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${baseUrl()}${path}`, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) throw new Error(`Payload ${path} -> ${response.status}`);
  return (await response.json()) as T;
};

const pick = (doc: Record<string, unknown>, fieldNames: string[]): Row =>
  Object.fromEntries(fieldNames.filter((name) => doc[name] != null).map((name) => [name, doc[name] as string | number | boolean]));

// Empty values (e.g. images that only exist as bundled Astro assets) keep the built-in default
const withDefaults = (row: Row, fallback: Row | undefined): Row => {
  const merged: Row = { ...(fallback ?? {}) };
  for (const [key, value] of Object.entries(row)) if (value !== "") merged[key] = value;
  return merged;
};

export const isPayloadEnabled = () => Boolean(baseUrl());

export const payloadList = async (key: string) => {
  const moduleDef = getModuleDef(key);
  if (!moduleDef) throw new Error(`Unknown CMS module: ${key}`);
  const names = moduleDef.fields.map((field) => field.name);
  const defaults = moduleDef.defaults as Row[];

  const [list, header] = await Promise.all([
    get<{ docs: Record<string, unknown>[] }>(`/api/${key}?limit=200&sort=order&depth=0`),
    moduleDef.headerFields
      ? get<Record<string, unknown>>(`/api/globals/${key}-header`)
      : Promise.resolve({} as Record<string, unknown>),
  ]);

  const headerNames = (moduleDef.headerFields ?? []).map((field) => field.name);
  return {
    items: list.docs.map((doc, index) => withDefaults(pick(doc, names), defaults[index])),
    header: withDefaults(pick(header, headerNames), moduleDef.headerDefaults),
  };
};

export const payloadSingle = async (key: string): Promise<Row> => {
  const moduleDef = getModuleDef(key);
  if (!moduleDef) throw new Error(`Unknown CMS module: ${key}`);
  const doc = await get<Record<string, unknown>>(`/api/globals/${key}`);
  return withDefaults(pick(doc, moduleDef.fields.map((field) => field.name)), moduleDef.defaults as Row);
};
