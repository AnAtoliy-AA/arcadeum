#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const MarkdownIt = require('markdown-it');

// Root directory of the project
const ROOT_DIR = path.join(__dirname, '..');

// Create a MarkdownIt parser (default config)
const md = new MarkdownIt();

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

// Extract all links from Markdown using markdown-it
function extractLinks(content) {
  const tokens = md.parse(content, {});
  const links = [];

  for (const token of tokens) {
    if (token.type === 'link_open') {
      const href = token.attrGet('href');
      const text = token.children?.[0]?.content || href;
      const line = content.substring(0, token.map[0]).split('\n').length;

      links.push({
        text,
        linkPath: href,
        line,
      });
    }
  }

  return links;
}

// Resolve relative link path against file's directory
function resolveLinkPath(linkPath, mdFilePath) {
  if (linkPath.startsWith('http://') || linkPath.startsWith('https://')) {
    return linkPath; // External URL — we only care if it's unreachable (but we don't check that)
  }

  // Handle anchor links like #section
  if (linkPath.startsWith('#')) {
    return null; // Internal anchor — skip
  }

  // Resolve relative path
  const dir = path.dirname(mdFilePath);
  const resolved = path.resolve(dir, linkPath.split('#')[0]); // Remove anchor if present
  return resolved;
}

// Main check function
function checkLinks() {
  console.log('🔍 Checking for broken links in documentation...\n');

  const mdFiles = findMdFiles(ROOT_DIR);
  let brokenLinks = [];

  for (const mdFile of mdFiles) {
    const content = fs.readFileSync(mdFile, 'utf8');
    const links = extractLinks(content);

    for (const { text, linkPath, line } of links) {
      const resolvedPath = resolveLinkPath(linkPath, mdFile);
      if (!resolvedPath) continue; // Skip anchors or external URLs

      // Check if file exists (only for local files)
      if (
        resolvedPath.startsWith('http://') ||
        resolvedPath.startsWith('https://')
      ) {
        // External links — we don't check if they're reachable (too slow)
        // But we can warn if they look malformed
        if (linkPath.includes('https:/') || linkPath.includes('http:/')) {
          brokenLinks.push({
            file: mdFile,
            line,
            link: linkPath,
            text,
            target: linkPath,
            reason: 'Malformed URL (missing second /)',
          });
        }
        continue;
      }

      // Check if local file exists
      if (!fs.existsSync(resolvedPath)) {
        brokenLinks.push({
          file: mdFile,
          line,
          link: linkPath,
          text,
          target: resolvedPath,
        });
      }
    }
  }

  // Report results
  if (brokenLinks.length > 0) {
    console.log('❌ Broken links found:\n');
    brokenLinks.forEach(({ file, line, link, text, target, reason }) => {
      if (reason) {
        console.log(
          `  ${path.relative(ROOT_DIR, file)}:${line} → [${text}](${link}) → ${reason}`,
        );
      } else {
        console.log(
          `  ${path.relative(ROOT_DIR, file)}:${line} → [${text}](${link}) → ${path.relative(ROOT_DIR, target)} (NOT FOUND)`,
        );
      }
    });
    console.log('\n❌ Fix these links before committing!');
    process.exit(1); // Fail CI
  } else {
    console.log('✅ All links are valid! Great job! 🎉');
    process.exit(0);
  }
}

// Run check
checkLinks();
