'use strict';

const fs = require('fs');

/** True when the kill flag file exists or STREAM_KILL_SWITCH is truthy. */
function isKilled({ killFile, killEnv }, exists = fs.existsSync) {
  if (killEnv) return true;
  if (!killFile) return false;
  try {
    return exists(killFile);
  } catch {
    return false;
  }
}

module.exports = { isKilled };
