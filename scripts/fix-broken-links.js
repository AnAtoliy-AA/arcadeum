#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Root directory of the project
const ROOT_DIR = path.join(__dirname, '..');

// Find all .md files recursively
function findMdFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules, .git, .next, .turbo, etc.
      if (
        [
          'node_modules',
          '.git',
          '.next',
          '.turbo',
          'playwright-report',
          'dist',
          'ios/Pods',
        ].includes(item)
      )
        continue;
      files.push(...findMdFiles(fullPath));
    } else if (item.endsWith('.md')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Fix malformed URLs: https:/ → https://, https:/// → https://, http:/ → http://, http:/// → http://
function fixBrokenLinks(content) {
  const fixedContent = content
    .replace(/https:\/{1,3}/g, 'https://') // Matches 1, 2, or 3 slashes after https:
    .replace(/http:\/{1,3}/g, 'http://'); // Matches 1, 2, or 3 slashes after http:

  return fixedContent;
}

// Main function
function main() {
  console.log(
    '🔍 Fixing malformed URLs (https:/, https:///, http:/, http:/// → https://, http://)...\n',
  );

  const mdFiles = findMdFiles(ROOT_DIR);
  let fixedCount = 0;

  for (const mdFile of mdFiles) {
    const content = fs.readFileSync(mdFile, 'utf8');
    const fixedContent = fixBrokenLinks(content);

    if (content !== fixedContent) {
      fs.writeFileSync(mdFile, fixedContent, 'utf8');
      console.log(`✅ Fixed: ${path.relative(ROOT_DIR, mdFile)}`);
      fixedCount++;
    }
  }

  console.log(`\n✅ Fixed ${fixedCount} files.`);
  console.log('🎉 All broken links have been repaired!');
}

// Run
main();
