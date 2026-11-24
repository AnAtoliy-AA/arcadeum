'use strict';

const http = require('http');

/**
 * Local stand-in for the BE routes the director uses AND the web scenes
 * (/{locale}/stream/{roomId}, /{locale}/stream/idle). Lets the whole
 * pipeline run without the real apps. Games "finish" after `gameSeconds`.
 */
function page(title, body) {
  return `<!doctype html><meta charset="utf-8"><title>${title}</title>
<body style="margin:0;background:#101830;color:#fff;font:48px sans-serif;display:grid;place-items:center;height:100vh">
<div style="text-align:center"><div>${title}</div><div style="font-size:28px;opacity:.7">${body}</div>
<div id="t" style="font-size:80px;margin-top:24px"></div></div>
<script>setInterval(()=>{document.getElementById('t').textContent=new Date().toISOString().slice(11,23)},50)</script>`;
}

function startStub({
  log,
  gameSeconds = Number(process.env.STUB_GAME_SECONDS || 20),
  port = 0,
} = {}) {
  const rooms = new Map();
  let n = 0;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://x');
    const json = (obj, status = 200) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(obj));
    };
    let body = '';
    req.on('data', (d) => (body += d));
    req.on('end', () => {
      const data = body ? JSON.parse(body) : {};
      if (req.method === 'POST' && url.pathname === '/auth/login')
        return json({ accessToken: 'stub-token' });
      if (req.method === 'POST' && url.pathname === '/games/ai-vs-ai') {
        const id = `stub${++n}`;
        rooms.set(id, {
          gameId: data.gameId,
          startedAt: Date.now(),
          deleted: false,
        });
        return json({ room: { id, status: 'in_progress' } });
      }
      if (req.method === 'POST' && url.pathname === '/games/room-info') {
        const r = rooms.get(data.roomId);
        if (!r || r.deleted) return json({ message: 'not found' }, 404);
        const done = Date.now() - r.startedAt >= gameSeconds * 1000;
        const status = done ? 'completed' : 'in_progress';
        return json({
          room: { id: data.roomId, status },
          session: {
            status,
            updatedAt: String(Math.floor((Date.now() - r.startedAt) / 2000)),
          },
        });
      }
      if (req.method === 'POST' && url.pathname === '/games/rooms/delete') {
        const r = rooms.get(data.roomId);
        if (r) r.deleted = true;
        return json({ ok: true });
      }
      const m = /^\/[a-z]{2}\/stream\/([^/]+)$/.exec(url.pathname);
      if (req.method === 'GET' && m) {
        res.writeHead(200, { 'content-type': 'text/html' });
        return res.end(
          m[1] === 'idle'
            ? page(
                'Next up',
                `next=${url.searchParams.get('next')} last=${url.searchParams.get('last') || '-'} (${url.searchParams.get('result') || ''})`,
              )
            : page('STUB broadcast scene', `room ${m[1]}`),
        );
      }
      json({ message: 'not found' }, 404);
    });
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const url = `http://127.0.0.1:${server.address().port}`;
      log?.info('stub server listening', { url });
      resolve({ url, close: () => new Promise((r) => server.close(r)) });
    });
  });
}

module.exports = { startStub };
