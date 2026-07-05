export interface ProxyUrlInput {
  hostname: string;
  search?: string;
  savedProxyUrl?: string | null;
  envProxyUrl?: string;
}

export function resolveInitialProxyUrl(input: ProxyUrlInput): string {
  const queryProxy = getQueryProxyUrl(input.search ?? '');
  if (queryProxy) return queryProxy;

  const envProxyUrl = normalizeProxyUrl(input.envProxyUrl ?? '');
  if (envProxyUrl) return envProxyUrl;

  const savedProxyUrl = normalizeProxyUrl(input.savedProxyUrl ?? '');
  if (savedProxyUrl) return savedProxyUrl;

  if (isStaticOrLocalHost(input.hostname)) {
    return '';
  }

  return '/api/deepseek';
}

export function normalizeProxyUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;

  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' || url.protocol === 'http:' ? trimmed : '';
  } catch {
    return '';
  }
}

function getQueryProxyUrl(search: string): string {
  const params = new URLSearchParams(search);
  return normalizeProxyUrl(params.get('deepseekProxy') ?? params.get('proxy') ?? '');
}

function isStaticOrLocalHost(hostname: string): boolean {
  return hostname.endsWith('github.io') || hostname === 'localhost' || hostname === '127.0.0.1';
}
