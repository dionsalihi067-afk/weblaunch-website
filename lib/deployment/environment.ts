/**
 * Deployment environment and trusted public origins.
 *
 * Kept free of imports so it can be exercised directly by the test scripts.
 * Origins are derived only from deployment configuration — never from request
 * headers (Host, X-Forwarded-Host) — so a client cannot influence links in emails.
 */

export const PRODUCTION_ORIGIN = 'https://www.weblaunchworks.com';

export type DeploymentEnvironment = 'production' | 'preview' | 'development';

type Env = Record<string, string | undefined>;

export class DeploymentConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeploymentConfigError';
  }
}

/** A single-label Vercel deployment hostname, e.g. `weblaunch-abc123-team.vercel.app`. */
const VERCEL_DEPLOYMENT_HOST = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.vercel\.app$/;

/**
 * Vercel sets VERCEL_ENV on every deployment (Preview builds also run with
 * NODE_ENV=production, so NODE_ENV alone cannot tell them apart). Without
 * VERCEL_ENV, a production build is treated as production.
 */
export function getDeploymentEnvironment(env: Env = process.env): DeploymentEnvironment {
  const vercelEnv = (env.VERCEL_ENV || '').trim();
  if (vercelEnv === 'production' || vercelEnv === 'preview' || vercelEnv === 'development') {
    return vercelEnv;
  }
  if (vercelEnv) {
    throw new DeploymentConfigError('VERCEL_ENV has an unexpected value');
  }
  return env.NODE_ENV === 'production' ? 'production' : 'development';
}

function getLocalOrigin(env: Env): string {
  const raw = (env.APP_URL || env.NEXT_PUBLIC_APP_URL || '').trim();
  if (!raw) return 'http://localhost:3000';

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    throw new DeploymentConfigError('APP_URL is not a valid URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new DeploymentConfigError('APP_URL must use http or https');
  }
  return url.origin;
}

/**
 * Origin for confirmation links:
 * - production: always PRODUCTION_ORIGIN (APP_URL / VERCEL_URL are ignored)
 * - preview: the current deployment's own VERCEL_URL, only if it is a *.vercel.app host
 * - development: APP_URL / NEXT_PUBLIC_APP_URL, default http://localhost:3000
 * Throws DeploymentConfigError for anything unexpected.
 */
export function getConfirmationOrigin(env: Env = process.env): string {
  const deployment = getDeploymentEnvironment(env);

  if (deployment === 'production') return PRODUCTION_ORIGIN;

  if (deployment === 'preview') {
    const host = (env.VERCEL_URL || '').trim().toLowerCase();
    if (!VERCEL_DEPLOYMENT_HOST.test(host)) {
      throw new DeploymentConfigError('VERCEL_URL is missing or not a Vercel deployment hostname');
    }
    return `https://${host}`;
  }

  return getLocalOrigin(env);
}

/** Origin for general website links in emails: the public site, or the local one in development. */
export function getPublicWebsiteOrigin(env: Env = process.env): string {
  try {
    return getDeploymentEnvironment(env) === 'development' ? getLocalOrigin(env) : PRODUCTION_ORIGIN;
  } catch {
    return PRODUCTION_ORIGIN;
  }
}
