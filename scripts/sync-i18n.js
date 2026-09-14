#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function parseFileToObjectKeys(filePath, visited = new Set()) {
  if (!fs.existsSync(filePath) || visited.has(filePath)) return {};
  visited.add(filePath);

  const source = fs.readFileSync(filePath, 'utf8');
  const sf = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
  );
  const dir = path.dirname(filePath);

  const importMap = {};
  ts.forEachChild(sf, (node) => {
    if (
      ts.isImportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const importPath = node.moduleSpecifier.text;
      if (importPath.startsWith('.')) {
        let resolvedPath = path.resolve(dir, importPath);
        if (
          !fs.existsSync(resolvedPath) &&
          fs.existsSync(resolvedPath + '.ts')
        ) {
          resolvedPath += '.ts';
        } else if (fs.existsSync(path.join(resolvedPath, 'index.ts'))) {
          resolvedPath = path.join(resolvedPath, 'index.ts');
        }
        if (
          node.importClause &&
          node.importClause.namedBindings &&
          ts.isNamedImports(node.importClause.namedBindings)
        ) {
          for (const spec of node.importClause.namedBindings.elements) {
            const importedName = spec.propertyName
              ? spec.propertyName.text
              : spec.name.text;
            const localName = spec.name.text;
            importMap[localName] = {
              filePath: resolvedPath,
              exportName: importedName,
            };
          }
        }
      }
    }
  });

  function extractNode(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const obj = {};
      for (const prop of node.properties) {
        if (
          ts.isPropertyAssignment(prop) ||
          ts.isShorthandPropertyAssignment(prop)
        ) {
          let propName = '';
          if (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) {
            propName = prop.name.text;
          }
          if (propName) {
            if (ts.isPropertyAssignment(prop)) {
              obj[propName] = extractNode(prop.initializer);
            } else {
              obj[propName] = true;
            }
          }
        }
      }
      return obj;
    }
    if (ts.isIdentifier(node)) {
      const localName = node.text;
      if (importMap[localName]) {
        const target = parseFileToObjectKeys(
          importMap[localName].filePath,
          visited,
        );
        return target[importMap[localName].exportName] || target;
      }
    }
    return true;
  }

  const result = {};
  ts.forEachChild(sf, (node) => {
    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name) && decl.initializer) {
          result[decl.name.text] = extractNode(decl.initializer);
        }
      }
    } else if (ts.isExportAssignment(node) && node.expression) {
      result['default'] = extractNode(node.expression);
    }
  });
  return result;
}

function flattenKeys(obj, prefix = '') {
  const keys = [];
  if (!obj || typeof obj !== 'object') return keys;
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (
      typeof v === 'object' &&
      v !== null &&
      !Array.isArray(v) &&
      Object.keys(v).length > 0
    ) {
      keys.push(...flattenKeys(v, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

function auditDomain(domainName, getEnFile, getLocFile) {
  const enFile = getEnFile();
  if (!fs.existsSync(enFile)) return null;

  const enParsed = parseFileToObjectKeys(enFile);
  const enExportKey =
    Object.keys(enParsed).find(
      (k) => k.endsWith('Messages') || k === 'en' || k === 'messages',
    ) || Object.keys(enParsed)[0];
  const enRoot = enParsed[enExportKey] || enParsed;
  const enKeys = flattenKeys(enRoot);

  const locales = ['ru', 'es', 'fr', 'by'];
  const localeResults = {};

  for (const loc of locales) {
    const locFile = getLocFile(loc);
    if (!fs.existsSync(locFile)) {
      localeResults[loc] = {
        exists: false,
        total: 0,
        missing: enKeys,
      };
      continue;
    }
    const locParsed = parseFileToObjectKeys(locFile);
    const locExportKey =
      Object.keys(locParsed).find(
        (k) =>
          k.endsWith('Messages') ||
          k === loc ||
          k === `${loc}Messages` ||
          k === 'messages',
      ) || Object.keys(locParsed)[0];
    const locRoot = locParsed[locExportKey] || locParsed;
    const locKeysSet = new Set(flattenKeys(locRoot));
    const missing = enKeys.filter((k) => !locKeysSet.has(k));

    localeResults[loc] = {
      exists: true,
      total: locKeysSet.size,
      missing,
    };
  }

  return {
    domain: domainName,
    enTotal: enKeys.length,
    locales: localeResults,
  };
}

function runAudit() {
  const rootDir = process.cwd();
  const messagesDir = path.join(rootDir, 'apps/web/src/shared/i18n/messages');
  const gamesDir = path.join(messagesDir, 'games');

  const domains = [];

  if (fs.existsSync(gamesDir)) {
    const gameEntries = fs
      .readdirSync(gamesDir)
      .filter((f) => fs.statSync(path.join(gamesDir, f)).isDirectory());

    for (const game of gameEntries) {
      const res = auditDomain(
        `games/${game}`,
        () => path.join(gamesDir, game, 'en.ts'),
        (loc) => path.join(gamesDir, game, `${loc}.ts`),
      );
      if (res) domains.push(res);
    }
  }

  const pagesRes = auditDomain(
    'pages',
    () => path.join(messagesDir, 'pages', 'en.ts'),
    (loc) => path.join(messagesDir, 'pages', `${loc}.ts`),
  );
  if (pagesRes) domains.push(pagesRes);

  const legalRes = auditDomain(
    'legal',
    () => path.join(messagesDir, 'legal', 'en.ts'),
    (loc) => path.join(messagesDir, 'legal', `${loc}.ts`),
  );
  if (legalRes) domains.push(legalRes);

  return domains;
}

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const results = runAudit();

let totalMissingAll = 0;
const summary = [];

for (const res of results) {
  let domainMissing = 0;
  const missingByLoc = {};

  for (const [loc, data] of Object.entries(res.locales)) {
    if (data.missing.length > 0) {
      domainMissing += data.missing.length;
      missingByLoc[loc] = data.missing;
    }
  }

  totalMissingAll += domainMissing;
  summary.push({
    domain: res.domain,
    enTotal: res.enTotal,
    missingCount: domainMissing,
    missingByLoc,
    status: domainMissing === 0 ? 'PASS' : 'FAIL',
  });
}

if (jsonMode) {
  console.log(
    JSON.stringify(
      {
        totalDomains: results.length,
        totalMissing: totalMissingAll,
        passed: totalMissingAll === 0,
        domains: summary,
      },
      null,
      2,
    ),
  );
  process.exit(totalMissingAll === 0 ? 0 : 1);
}

console.log('\n🌐 Arcadeum Games i18n Coverage & Sync Auditor (Agent 5)');
console.log('='.repeat(96));
console.log(
  `${'Domain'.padEnd(24)} ${'EN Keys'.padEnd(10)} ${'Status'.padEnd(10)} ${'Missing Details'}`,
);
console.log('-'.repeat(96));

for (const s of summary) {
  const statusIcon = s.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
  let details = 'In sync';
  if (s.missingCount > 0) {
    const parts = Object.entries(s.missingByLoc).map(
      ([loc, list]) => `${loc}: -${list.length}`,
    );
    details = parts.join(', ');
  }
  console.log(
    `${s.domain.padEnd(24)} ${String(s.enTotal).padEnd(10)} ${statusIcon.padEnd(10)} ${details}`,
  );
}

console.log('='.repeat(96));

if (totalMissingAll > 0) {
  console.log(
    `\n❌ Found ${totalMissingAll} missing translation keys across ${results.length} domains.`,
  );
  process.exit(1);
} else {
  console.log(
    `\n✅ All ${results.length} i18n domains 100% in sync across ru, es, fr, and by locales!`,
  );
  process.exit(0);
}
