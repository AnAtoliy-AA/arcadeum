import * as http from 'http';
import type { Logger } from './types';

/**
 * Local stand-in for the BE routes the director uses AND the web scenes
 * (/{locale}/stream/{roomId}, /{locale}/stream/idle). Lets the whole
 * pipeline run without the real apps. Games "finish" after `gameSeconds`.
 */
export interface StubServer {
  url: string;
  close(): Promise<void>;
}

interface StubRoom {
  gameId: string;
  startedAt: number;
  deleted: boolean;
}

interface StubBody {
  gameId?: string;
  roomId?: string;
}

function page(title: string, body: string): string {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="margin:0;background:#101830;color:#fff;font:48px sans-serif;display:grid;place-items:center;height:100vh">
<div style="text-align:center"><div>${title}</div><div style="font-size:28px;opacity:.7">${body}</div>
<div id="t" style="font-size:80px;margin-top:24px"></div></div>
<script>setInterval(()=>{document.getElementById('t').textContent=new Date().toISOString().slice(11,23)},50)</script>`;
}

const esc = (s: string): string =>
  s.replace(/[&<>"]/g, (c) => `&#${c.charCodeAt(0)};`);

export function startStub({
  log,
  gameSeconds = Number(process.env.STUB_GAME_SECONDS ?? 20),
  port = 0,
}: {
  log?: Logger;
  gameSeconds?: number;
  port?: number;
} = {}): Promise<StubServer> {
  const rooms = new Map<string, StubRoom>();
  let n = 0;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://x');
    const json = (obj: unknown, status = 200): void => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(obj));
    };
    let body = '';
    req.on('data', (d: Buffer) => (body += d.toString()));
    req.on('end', () => {
      const data = (body ? JSON.parse(body) : {}) as StubBody;
      if (req.method === 'POST' && url.pathname === '/auth/login') {
        return json({ accessToken: 'stub-token' });
      }
      if (req.method === 'POST' && url.pathname === '/games/ai-vs-ai') {
        const id = `stub${++n}`;
        rooms.set(id, {
          gameId: data.gameId ?? '',
          startedAt: Date.now(),
          deleted: false,
        });
        return json({ room: { id, status: 'in_progress' } });
      }
      if (req.method === 'POST' && url.pathname === '/games/room-info') {
        const r = rooms.get(data.roomId ?? '');
        if (!r || r.deleted) return json({ message: 'not found' }, 404);
        const age = Date.now() - r.startedAt;
        const status = age >= gameSeconds * 1000 ? 'completed' : 'in_progress';
        return json({
          room: { id: data.roomId, status },
          session: { status, updatedAt: String(Math.floor(age / 2000)) },
        });
      }
      if (req.method === 'POST' && url.pathname === '/games/rooms/delete') {
        const r = rooms.get(data.roomId ?? '');
        if (r) r.deleted = true;
        return json({ ok: true });
      }
      const m = /^\/[a-z]{2}\/stream\/([^/]+)$/.exec(url.pathname);
      if (req.method === 'GET' && m) {
        res.writeHead(200, { 'content-type': 'text/html' });
        const q = (k: string): string => esc(url.searchParams.get(k) ?? '-');
        return void res.end(
          m[1] === 'idle'
            ? page(
                'Next up',
                `next=${q('next')} last=${q('last')} (${q('result')})`,
              )
            : page('STUB broadcast scene', `room ${esc(m[1])}`),
        );
      }
      json({ message: 'not found' }, 404);
    });
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      const url = `http://127.0.0.1:${addr.port}`;
      log?.info('stub server listening', { url });
      resolve({
        url,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}
