/**
 * Shared state for confirmation tokens, rate limits and duplicate detection.
 *
 * Production requires a Redis REST store (Vercel KV / Upstash): serverless
 * instances do not share memory, so a process-local fallback would silently
 * weaken single-use tokens and abuse protection. Outside production an
 * in-memory store is used so local development works without KV.
 *
 * Only hashed keys and small markers are stored — never submission content.
 * Keys are namespaced per deployment environment so Preview can never touch
 * Production rate limits, duplicate locks or confirmation markers, even if both
 * are (mis)configured with the same database.
 */

import { DeploymentConfigError, getDeploymentEnvironment } from '@/lib/deployment/environment';

export class StateStoreError extends Error {
  constructor(
    public readonly reason: 'not_configured' | 'unavailable',
    message: string
  ) {
    super(message);
    this.name = 'StateStoreError';
  }
}

export type KvCommand = (string | number)[];

/** Builds an environment-scoped key, e.g. `wl:preview:rl:<hash>`. */
export function stateKey(...parts: string[]): string {
  try {
    return ['wl', getDeploymentEnvironment(), ...parts].join(':');
  } catch (error) {
    if (error instanceof DeploymentConfigError) {
      throw new StateStoreError('not_configured', error.message);
    }
    throw error;
  }
}

const REQUEST_TIMEOUT_MS = 5000;

function getKvConfig(): { url: string; token: string } | null {
  const url = (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '').trim();
  const token = (process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '').trim();
  if (!url || !token) return null;
  return { url: url.replace(/\/+$/, ''), token };
}

export function isDurableStateRequired(): boolean {
  return process.env.NODE_ENV === 'production';
}

async function restCommand(cfg: { url: string; token: string }, command: KvCommand): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(cfg.url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(command),
      cache: 'no-store',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    throw new StateStoreError(
      'unavailable',
      `KV request failed (${String(command[0])}): ${err instanceof Error ? err.name : 'unknown'}`
    );
  }

  let data: { result?: unknown; error?: string } = {};
  try {
    data = (await res.json()) as typeof data;
  } catch {
    // handled below
  }

  if (!res.ok || data.error) {
    throw new StateStoreError(
      'unavailable',
      `KV command ${String(command[0])} failed with HTTP ${res.status}`
    );
  }
  return data.result ?? null;
}

/* ---------- Development-only in-memory store (same command semantics) ---------- */

const memory = new Map<string, { value: string; expiresAt: number | null }>();
let warnedMemory = false;

function memoryGet(key: string) {
  const entry = memory.get(key);
  if (!entry) return null;
  if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
    memory.delete(key);
    return null;
  }
  return entry;
}

function memoryCommand(command: KvCommand): unknown {
  const [name, key, ...args] = command.map(String);
  const upper = name.toUpperCase();

  if (upper === 'GET') return memoryGet(key)?.value ?? null;
  if (upper === 'DEL') return memory.delete(key) ? 1 : 0;
  if (upper === 'INCR') {
    const entry = memoryGet(key);
    const next = (entry ? parseInt(entry.value, 10) || 0 : 0) + 1;
    memory.set(key, { value: String(next), expiresAt: entry?.expiresAt ?? null });
    return next;
  }
  if (upper === 'SET') {
    const [value, ...opts] = args;
    const flags = opts.map((o) => o.toUpperCase());
    const pxIndex = flags.indexOf('PX');
    const ttl = pxIndex >= 0 ? parseInt(opts[pxIndex + 1], 10) : null;
    if (flags.includes('NX') && memoryGet(key)) return null;
    memory.set(key, { value, expiresAt: ttl ? Date.now() + ttl : null });
    return 'OK';
  }
  throw new StateStoreError('unavailable', `Unsupported memory command ${upper}`);
}

/**
 * Runs a Redis command against the shared store.
 * Throws StateStoreError when the store is missing (in production) or unreachable.
 */
export async function kv(command: KvCommand): Promise<unknown> {
  const cfg = getKvConfig();
  if (cfg) return restCommand(cfg, command);

  if (isDurableStateRequired()) {
    throw new StateStoreError(
      'not_configured',
      'KV_REST_API_URL and KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL/TOKEN) must be set in production'
    );
  }

  if (!warnedMemory) {
    warnedMemory = true;
    console.warn('[state] KV not configured — using in-memory state (development only)');
  }
  return memoryCommand(command);
}
