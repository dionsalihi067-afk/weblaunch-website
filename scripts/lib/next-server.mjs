import { spawn } from 'node:child_process';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';

const ROOT = process.cwd();
const SOURCE_DIRS = ['app', 'components', 'lib', 'messages', 'i18n.ts', 'middleware.ts', 'next.config.ts'];

function newestMtime(target) {
  const stat = fs.statSync(target, { throwIfNoEntry: false });
  if (!stat) return 0;
  if (!stat.isDirectory()) return stat.mtimeMs;
  return fs
    .readdirSync(target)
    .reduce((max, entry) => Math.max(max, newestMtime(path.join(target, entry))), stat.mtimeMs);
}

/** Fails when .next is missing or older than the sources, so checks never run against a stale build. */
export function assertFreshBuild() {
  const buildId = path.join(ROOT, '.next', 'BUILD_ID');
  const built = fs.statSync(buildId, { throwIfNoEntry: false });
  if (!built) throw new Error('No production build found. Run `npm run build` first.');
  const newestSource = Math.max(...SOURCE_DIRS.map((d) => newestMtime(path.join(ROOT, d))));
  if (newestSource > built.mtimeMs) {
    throw new Error('Production build is older than the source files. Run `npm run build` first.');
  }
}

export function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

/** Starts `next start` for the current build on a free port; only this child is stopped afterwards. */
export async function startNextServer(env = {}) {
  const port = await getFreePort();
  const nextBin = path.join(ROOT, 'node_modules', 'next', 'dist', 'bin', 'next');
  // Binding with -H 127.0.0.1 makes middleware-routed pages hang on Windows; use the default host.
  const child = spawn(process.execPath, [nextBin, 'start', '-p', String(port)], {
    cwd: ROOT,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let output = '';
  child.stdout.on('data', (chunk) => (output += chunk));
  child.stderr.on('data', (chunk) => (output += chunk));

  const baseUrl = `http://127.0.0.1:${port}`;
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`next start exited early:\n${output}`);
    try {
      const res = await fetch(`${baseUrl}/robots.txt`);
      if (res.ok) break;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  if (Date.now() >= deadline) {
    child.kill();
    throw new Error(`next start did not become ready:\n${output}`);
  }

  return {
    baseUrl,
    getOutput: () => output,
    stop: () =>
      new Promise((resolve) => {
        if (child.exitCode !== null) return resolve();
        child.once('exit', () => resolve());
        child.kill();
      }),
  };
}
