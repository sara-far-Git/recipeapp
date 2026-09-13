import { afterEach, expect, it, vi } from 'vitest';
import { loadSitemapRecipes } from './sitemapRecipes';
afterEach(() => vi.unstubAllGlobals());
it('retries a failed API request without dropping recipes', async () => {
  const fetcher = vi.fn().mockRejectedValueOnce(new Error('timeout')).mockResolvedValue({ ok: true, json: async () => [{ id: 1 }] });
  vi.stubGlobal('fetch', fetcher);
  expect(await loadSitemapRecipes()).toEqual([{ id: 1 }]);
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it('fails instead of returning a partial sitemap when later pages fail', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce({ ok: true, json: async () => Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })) }).mockRejectedValue(new Error('offline'));
  vi.stubGlobal('fetch', fetcher);
  await expect(loadSitemapRecipes()).rejects.toThrow('offset 100');
});
it('accepts a genuinely empty catalog', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
  expect(await loadSitemapRecipes()).toEqual([]);
});
