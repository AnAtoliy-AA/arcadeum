'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');

/** Mutable status snapshot exposed as JSON (file and/or localhost HTTP). */
class Health {
  constructor({
    now = Date.now,
    writeFile = fs.writeFileSync,
    mkdir = fs.mkdirSync,
    statusFile = '',
  } = {}) {
    this.now = now;
    this.writeFile = writeFile;
    this.mkdir = mkdir;
    this.statusFile = statusFile;
    this.startedAt = now();
    this.state = {
      state: 'starting',
      currentGame: null,
      gamesPlayed: 0,
      lastRestartReason: null,
      lastRestartAt: null,
      ffmpegFps: 0,
      ffmpegFrames: 0,
      ffmpegRestarts: 0,
      dryRun: true,
      killed: false,
    };
  }

  update(patch) {
    Object.assign(this.state, patch);
    this.flush();
  }

  snapshot() {
    return {
      ...this.state,
      uptimeSec: Math.round((this.now() - this.startedAt) / 1000),
      updatedAt: new Date(this.now()).toISOString(),
    };
  }

  flush() {
    if (!this.statusFile) return;
    try {
      this.mkdir(path.dirname(this.statusFile), { recursive: true });
      this.writeFile(this.statusFile, JSON.stringify(this.snapshot()));
    } catch {
      // status is best effort
    }
  }

  /** Tiny localhost-only HTTP endpoint. Returns the server (or null). */
  serve(port) {
    if (!port) return null;
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(this.snapshot()));
    });
    server.listen(port, '127.0.0.1');
    server.unref();
    return server;
  }
}

module.exports = { Health };
