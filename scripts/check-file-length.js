const fs = require('fs');
const path = require('path');

const MAX_LINES = 500;
const ROOT_DIR = process.cwd();

// List of files to ignore (relative to root)
// These files currently exceed the limit and should be refactored.
const ALLOW_LIST = new Set([
    'apps/web/src/app/settings/SettingsContent.tsx',
    'apps/web/src/app/settings/SettingsPage.tsx',
    'apps/web/src/app/history/styles.ts',
    'apps/web/src/app/games/GamesPage.tsx',
    'apps/web/src/features/auth/ui/styles.ts',
    'apps/web/src/shared/i18n/messages/games.ts',
    'apps/web/src/widgets/ExplodingCatsGame/ui/Game.tsx',
    'apps/web/src/widgets/header/ui/Header.tsx',
    'apps/mobile/pages/GamesScreen/gameIntegrations/ExplodingCats/ExplodingCatsRoom.styles.ts',
    'apps/mobile/pages/GamesScreen/GameDetailScreen.styles.ts',
    'apps/be/src/chat/chat.service.ts',
    'apps/be/src/games/games.service.ts',
    'apps/be/src/games/history/game-history.service.ts',
]);

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
                    console.error(`\x1b[31mError: File ${relativePath} has ${lines} lines (limit: ${MAX_LINES})\x1b[0m`);
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
    console.error('\x1b[31mCommit failed: Some files exceed the line limit.\x1b[0m');
    console.error('Please refactor these files to be smaller than 500 lines.');
    process.exit(1);
} else {
    console.log('\x1b[32mAll checked files are within limits.\x1b[0m');
    process.exit(0);
}
