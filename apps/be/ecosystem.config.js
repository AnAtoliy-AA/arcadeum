const path = require('path');

module.exports = {
  apps: [
    {
      name: 'arcadeum-be',
      script: path.join(__dirname, 'dist/src/main.js'),
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '1G',
    },
  ],
};
