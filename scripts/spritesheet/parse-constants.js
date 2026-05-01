const fs = require('fs');

function extractObjectFromSource(filePath, name) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(
    new RegExp(`const ${name}(?:[:\\s\\w<>,[\\]]+)? = {([\\s\\S]*?)}`, 'm'),
  );
  if (!match) {
    throw new Error(`Could not find "${name}" in ${filePath}`);
  }

  const body = match[1];
  const result = {};

  body.split('\n').forEach((line) => {
    const parts = line.trim().match(/^(\w+):\s*['"]?([\w-]+)['"]?,?/);
    if (parts) {
      const value = /^\d+$/.test(parts[2]) ? parseInt(parts[2]) : parts[2];
      result[parts[1]] = value;
    }
  });

  return result;
}

module.exports = { extractObjectFromSource };
