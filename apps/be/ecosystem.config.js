const path = require('path');

const cpuCount = require('os').cpus().length;
const totalMemMb = require('os').totalmem() / 1024 / 1024;

// Reserve RAM for non-backend services (Postiz, Temporal, Elasticsearch,
// MongoDB, OS). On the main server (~19 GB) this is ~6 GB; on the worker
// (~4 GB) it's proportionally less.
const RESERVED_MB = Math.min(6144, Math.floor(totalMemMb * 0.3));

const availableForBackendMb = totalMemMb - RESERVED_MB;
const MAX_INSTANCES = Math.min(cpuCount, 4);
const WORKER_MB = Math.floor(availableForBackendMb / MAX_INSTANCES);

// Safety caps: no single worker should exceed 2 GB, and each must have
// at least 512 MB to function.
const CAPPED_MB = Math.min(WORKER_MB, 2048);
const SAFE_MB = Math.max(CAPPED_MB, 512);

module.exports = {
  apps: [
    {
      name: 'arcadeum-be',
      script: path.join(__dirname, 'dist/src/main.js'),
      cwd: __dirname,
      instances: MAX_INSTANCES,
      exec_mode: 'cluster',
      autorestart: true,
      max_memory_restart: `${SAFE_MB}M`,
      node_args: `--max-old-space-size=${SAFE_MB}`,
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: true,
    },
  ],
};
