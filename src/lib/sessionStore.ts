// DEV: In-memory (per process). PROD: thay bằng Redis/Upstash.
export type Sid = string;

export interface TokenBundle {
  access: string;
  refresh: string;
  expAt: number; // epoch ms
  id_token: string | null;
}

// --- GIỮ MAP TOÀN CỤC, SỐNG QUA HMR ---
declare global {
  var __SESSION_MEM__: Map<Sid, TokenBundle> | undefined;
}
const mem: Map<Sid, TokenBundle> =
  globalThis.__SESSION_MEM__ ?? (globalThis.__SESSION_MEM__ = new Map());

export async function saveTokens(sid: Sid, tokens: TokenBundle) {
  mem.set(sid, tokens);
}

export async function loadTokens(sid: Sid) {
  return mem.get(sid) ?? null;
}

export async function updateTokens(sid: Sid, tokens: Partial<TokenBundle>) {
  const cur = mem.get(sid);
  if (!cur) return;
  mem.set(sid, { ...cur, ...tokens });
}

export async function deleteSession(sid: Sid) {
  mem.delete(sid);
}

export function dumpSessionKeys() {
  return Array.from(mem.keys());
}

// Optional: Redis skeleton (cài ioredis hoặc Upstash)
// import Redis from 'ioredis';
// const redis = new Redis(process.env.REDIS_URL!);
// export async function saveTokens(sid: Sid, t: TokenBundle) { await redis.setex(`sess:${sid}`, 60*60*24*30, JSON.stringify(t)); }
// export async function loadTokens(sid: Sid) { const s = await redis.get(`sess:${sid}`); return s ? JSON.parse(s) as TokenBundle : null; }
// export async function updateTokens(sid: Sid, t: Partial<TokenBundle>) { const cur = await loadTokens(sid); if (cur) await saveTokens(sid, { ...cur, ...t }); }
// export async function deleteSession(sid: Sid) { await redis.del(`sess:${sid}`); }
