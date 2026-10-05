import { promises as fs } from "node:fs";
import path from "node:path";
import { del, get, list, put } from "@vercel/blob";

// 로컬 개발에서 Blob 토큰이 없으면 .data/ 폴더에 저장
const LOCAL = !process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV !== "production";
const LOCAL_DIR = path.join(process.cwd(), ".data");
const localFile = (key: string) => path.join(LOCAL_DIR, key.replace(/\//g, "__"));

export async function writeJson(key: string, value: unknown) {
  if (LOCAL) {
    await fs.mkdir(LOCAL_DIR, { recursive: true });
    await fs.writeFile(localFile(key), JSON.stringify(value));
    return;
  }
  await put(key, JSON.stringify(value), {
    access: "private",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function readJson<T>(key: string): Promise<T | null> {
  if (LOCAL) {
    try {
      return JSON.parse(await fs.readFile(localFile(key), "utf8")) as T;
    } catch {
      return null;
    }
  }
  const res = await get(key, { access: "private", useCache: false });
  if (!res || res.statusCode !== 200 || !res.stream) return null;
  try {
    return JSON.parse(await new Response(res.stream).text()) as T;
  } catch {
    return null;
  }
}

export async function removeJson(key: string) {
  if (LOCAL) await fs.rm(localFile(key), { force: true });
  else await del(key);
}

export async function listJson<T>(prefix: string): Promise<T[]> {
  let keys: string[] = [];
  if (LOCAL) {
    const files = await fs.readdir(LOCAL_DIR).catch(() => [] as string[]);
    keys = files.map((f) => f.replace(/__/g, "/")).filter((k) => k.startsWith(prefix));
  } else {
    let cursor: string | undefined;
    do {
      const page = await list({ prefix, cursor, limit: 1000 });
      keys.push(...page.blobs.map((b) => b.pathname));
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
  }
  const out: T[] = [];
  for (let i = 0; i < keys.length; i += 20) {
    const chunk = await Promise.all(keys.slice(i, i + 20).map((k) => readJson<T>(k)));
    for (const v of chunk) if (v) out.push(v);
  }
  return out;
}
