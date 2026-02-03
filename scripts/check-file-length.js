const fs = require('fs');
const path = require('path');

const MAX_LINES = 500;
const ROOT_DIR = process.cwd();

// List of files to ignore (relative to root)
// These files currently exceed the limit and should be refactored.
const ALLOW_LIST = new Set([]);

const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.turbo',
  'dist',
  'build',
  'coverage',
  '.git',
  '.husky',
  '.vscode',
  '.idea',
  'storybook-static',
]);

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

function countLines(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  return content.split('\n').length;
}

function scanDirectory(dir) {
  let hasErrors = false;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.has(file)) {
        if (scanDirectory(fullPath)) {
          hasErrors = true;
        }
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file);
      if (EXTENSIONS.has(ext)) {
        const relativePath = path.relative(ROOT_DIR, fullPath);

        if (ALLOW_LIST.has(relativePath)) {
          continue;
        }

        const lines = countLines(fullPath);
        if (lines > MAX_LINES) {
          console.error(
            `\x1b[31mError: File ${relativePath} has ${lines} lines (limit: ${MAX_LINES})\x1b[0m`,
          );
          hasErrors = true;
        }
      }
    }
  }

  return hasErrors;
}

console.log(`Scanning for files exceeding ${MAX_LINES} lines...`);
const hasErrors = scanDirectory(path.join(ROOT_DIR, 'apps'));

if (hasErrors) {
  console.error(
    '\x1b[31mCommit failed: Some files exceed the line limit.\x1b[0m',
  );
  console.error('Please refactor these files to be smaller than 500 lines.');
  process.exit(1);
} else {
  console.log('\x1b[32mAll checked files are within limits.\x1b[0m');
  process.exit(0);
}
