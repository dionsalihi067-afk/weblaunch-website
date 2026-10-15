import http from 'node:http';

/**
 * Minimal Upstash/Vercel KV REST mock for automated tests (single shared
 * in-memory store). Commands are applied one at a time, matching Redis'
 * atomic per-command semantics. Set `state.down = true` to simulate an outage.
 */
export function startMockKv(token = 'mock-kv-token') {
  const store = new Map();
  const state = { down: false, commands: [] };

  const live = (key) => {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== null && entry.expiresAt <= Date.now()) {
      store.delete(key);
      return null;
    }
    return entry;
  };

  function run([name, key, ...args]) {
    const cmd = String(name).toUpperCase();
    state.commands.push(cmd);
    if (cmd === 'GET') return live(key)?.value ?? null;
    if (cmd === 'DEL') return store.delete(key) ? 1 : 0;
    if (cmd === 'INCR') {
      const entry = live(key);
      const next = (entry ? parseInt(entry.value, 10) || 0 : 0) + 1;
      store.set(key, { value: String(next), expiresAt: entry?.expiresAt ?? null });
      return next;
    }
    if (cmd === 'SET') {
      const [value, ...opts] = args.map(String);
      const flags = opts.map((o) => o.toUpperCase());
      const px = flags.indexOf('PX');
      const ttl = px >= 0 ? parseInt(opts[px + 1], 10) : null;
      if (flags.includes('NX') && live(key)) return null;
      store.set(key, { value, expiresAt: ttl ? Date.now() + ttl : null });
      return 'OK';
    }
    throw new Error(`ERR unknown command '${cmd}'`);
  }

  const server = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      const send = (status, payload) => {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(payload));
      };
      if (state.down) return send(503, { error: 'service unavailable' });
      if (req.headers.authorization !== `Bearer ${token}`) return send(401, { error: 'unauthorized' });
      try {
        send(200, { result: run(JSON.parse(body)) });
      } catch (err) {
        send(400, { error: err.message });
      }
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({
        url: `http://127.0.0.1:${server.address().port}`,
        token,
        state,
        keys: () => [...store.keys()],
        dump: () => JSON.stringify([...store.entries()]),
        close: () => new Promise((r) => server.close(() => r())),
      });
    });
  });
}
