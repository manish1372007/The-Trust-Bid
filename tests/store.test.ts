import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { afterEach, describe, expect, test, vi } from 'vitest';

const originalSupabaseUrl = process.env.SUPABASE_URL;
const originalServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const originalAnonKey = process.env.SUPABASE_ANON_KEY;

afterEach(() => {
  if (originalSupabaseUrl === undefined) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalSupabaseUrl;
  if (originalServiceKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = originalServiceKey;
  if (originalAnonKey === undefined) delete process.env.SUPABASE_ANON_KEY;
  else process.env.SUPABASE_ANON_KEY = originalAnonKey;
  vi.resetModules();
});

async function loadLocalStore() {
  delete process.env.SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_ANON_KEY;
  vi.resetModules();
  return import('../lib/store');
}

describe('local JSON store', () => {
  test('returns an empty collection only when its file is missing', async () => {
    const { readAll } = await loadLocalStore();

    await expect(readAll(`missing-${randomUUID()}`)).resolves.toEqual([]);
  });

  test('surfaces malformed data and does not overwrite it during upsert', async () => {
    const collection = `corrupt-${randomUUID()}`;
    const filePath = path.join(process.cwd(), '.data', `${collection}.json`);
    const malformed = '{not valid json';
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, malformed);

    try {
      const { readAll, upsert } = await loadLocalStore();
      await expect(readAll(collection)).rejects.toThrow('invalid JSON');
      await expect(upsert(collection, 'id', { id: 'new' })).rejects.toThrow('invalid JSON');
      await expect(fs.readFile(filePath, 'utf8')).resolves.toBe(malformed);
    } finally {
      await fs.unlink(filePath);
    }
  });

  test('rejects JSON collections that are not arrays', async () => {
    const collection = `wrong-shape-${randomUUID()}`;
    const filePath = path.join(process.cwd(), '.data', `${collection}.json`);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ id: 'unexpected' }));

    try {
      const { readAll } = await loadLocalStore();
      await expect(readAll(collection)).rejects.toThrow('expected a JSON array');
    } finally {
      await fs.unlink(filePath);
    }
  });
});
