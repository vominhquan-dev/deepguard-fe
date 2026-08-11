const DEFAULT_CACHE_TTL_MS = 60_000;

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

type CacheOptions = {
  force?: boolean;
  ttlMs?: number;
};

// Keep admin responses in memory only. A separate bucket per access token
// prevents a newly signed-in account from seeing a previous account's cache.
const responseCache = new Map<string, Map<string, CacheEntry<unknown>>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function getBucket(accessToken: string) {
  let bucket = responseCache.get(accessToken);
  if (!bucket) {
    bucket = new Map<string, CacheEntry<unknown>>();
    responseCache.set(accessToken, bucket);
  }
  return bucket;
}

export function createAdminCacheKey(
  resource: string,
  params: Record<string, unknown> = {},
) {
  const normalizedParams = Object.fromEntries(
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== "")
      .sort(([left], [right]) => left.localeCompare(right)),
  );
  return `${resource}:${JSON.stringify(normalizedParams)}`;
}

export async function getCachedAdminData<T>(
  accessToken: string,
  key: string,
  request: () => Promise<T>,
  { force = false, ttlMs = DEFAULT_CACHE_TTL_MS }: CacheOptions = {},
): Promise<T> {
  const bucket = getBucket(accessToken);
  const cached = bucket.get(key) as CacheEntry<T> | undefined;
  if (!force && cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const requestKey = `${accessToken}:${key}`;
  const pending = inFlightRequests.get(requestKey) as Promise<T> | undefined;
  if (pending) return pending;

  const pendingRequest = request()
    .then((data) => {
      bucket.set(key, { data, expiresAt: Date.now() + ttlMs });
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(requestKey);
    });

  inFlightRequests.set(requestKey, pendingRequest);
  return pendingRequest;
}

export function hasFreshAdminCache(accessToken: string, key: string) {
  const cached = responseCache.get(accessToken)?.get(key);
  return Boolean(cached && cached.expiresAt > Date.now());
}

export function invalidateAdminCache(accessToken: string, keyPrefix?: string) {
  const bucket = responseCache.get(accessToken);
  if (!bucket) return;

  if (!keyPrefix) {
    bucket.clear();
    return;
  }

  for (const key of bucket.keys()) {
    if (key.startsWith(keyPrefix)) bucket.delete(key);
  }
}
