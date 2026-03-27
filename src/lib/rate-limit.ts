const requests = new Map<string, number[]>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const timestamps = (requests.get(key) || []).filter((t) => t > windowStart);

  if (timestamps.length >= limit) {
    return { success: false, remaining: 0 };
  }

  timestamps.push(now);
  requests.set(key, timestamps);
  return { success: true, remaining: limit - timestamps.length };
}
