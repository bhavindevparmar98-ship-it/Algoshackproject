import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

const read = (name: string) => process.env[name] ?? (import.meta.env as Record<string, string | undefined>)[name];

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};
const MAX_BYTES = 4 * 1024 * 1024;

export const collectUploads = async (fields: { name: string; type: string }[], form: FormData) => {
  const uploads: Record<string, string> = {};
  for (const field of fields) {
    const file = form.get(`${field.name}__file`);
    if (field.type === "image" && file instanceof File && file.size > 0) uploads[field.name] = await saveImage(file);
  }
  return uploads;
};

export const saveImage = async (file: File): Promise<string> => {
  const extension = TYPES[file.type];
  if (!extension) throw new Error("Only JPG, PNG, WebP, GIF or AVIF images are allowed.");
  if (file.size > MAX_BYTES) throw new Error("Image must be smaller than 4 MB.");

  const name = `${randomUUID()}.${extension}`;
  const token = read("BLOB_READ_WRITE_TOKEN");

  if (token) {
    const blob = await put(`cms/${name}`, file, { access: "public", token, contentType: file.type });
    return blob.url;
  }

  if (!import.meta.env.DEV) throw new Error("Image upload needs BLOB_READ_WRITE_TOKEN to be set.");

  const folder = path.join(process.cwd(), "public", "uploads");
  await mkdir(folder, { recursive: true });
  await writeFile(path.join(folder, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
};
