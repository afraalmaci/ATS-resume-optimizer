/**
 * Parses TRUST_PROXY: the number of reverse proxies in front of the app.
 * Behind one proxy (most hosts) set it to 1, so rate limits see the real
 * client IP instead of the proxy's. Only whole numbers are accepted: "true"
 * would trust any X-Forwarded-For header, letting clients fake their IP and
 * get around the rate limit.
 */
export function parseTrustProxy(value: string | undefined): number | false {
  const trimmed = value?.trim() ?? '';
  if (!/^\d+$/.test(trimmed)) return false;
  const hops = Number(trimmed);
  return hops >= 1 ? hops : false;
}
