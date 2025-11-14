/**
 * Examples demonstrating type-safe translation keys for mobile
 *
 * This file showcases how TypeScript catches translation key errors at compile time.
 * Run `tsc --noEmit` to see type checking in action.
 */

import type { TranslationKey } from '../messages';

// ✅ VALID KEYS - These will compile successfully
const validKeys: TranslationKey[] = [
  // Common
  'common.actions.login',
  'common.actions.register',
  'common.labels.email',
  'common.labels.password',

  // Navigation
  'navigation.chatsTab',
  'navigation.gamesTab',
  'navigation.historyTab',

  // Chat
  'chat.notFound',
  'chat.status.connected',
  'chat.status.connecting',

  // Chat List
  'chatList.search.placeholder',
  'chatList.empty.noChats',
  'chatList.empty.unauthenticated',

  // Games
  'games.lounge.activeTitle',
  'games.lounge.filters.statusLabel',
  'games.lounge.filters.status.all',
  'games.lounge.filters.status.lobby',
  'games.lounge.filters.participation.hosting',
  'games.common.createRoom',
  'games.create.title',
  'games.create.fieldName',
  'games.rooms.status.lobby',

  // History
  'history.list.emptyNoEntries',
  'history.status.completed',

  // API Messages
  'api.generic.unknownError',
  'api.generic.validationError',
  'api.payments.invalidAmount',
  'api.games.userIdRequired',
];

// ❌ INVALID KEYS - Uncomment to see TypeScript errors

/*
const invalidKeys: TranslationKey[] = [
  "common.invalid.key",           // Error: Property 'invalid' does not exist
  "chat.typo",                     // Error: Property 'typo' does not exist
  "games.lounge.filters.wrong",   // Error: Property 'wrong' does not exist
  "api.notExisting",               // Error: Property 'notExisting' does not exist
  "randomKey",                     // Error: Type '"randomKey"' is not assignable
];
*/

// ✅ Usage in a component (type-safe)
function ExampleComponent() {
  // This would work in a real component with useTranslation()
  // const { t } = useTranslation();

  // ✅ These will autocomplete and type-check
  // const loginLabel = t("common.actions.login");
  // const errorMsg = t("api.generic.unknownError");

  // ❌ This will show TypeScript error
  // const invalid = t("common.notExisting.key");
}

// ✅ Type-safe helper function
function translateMultiple(keys: TranslationKey[]): void {
  // All keys are guaranteed to exist in translation dictionary
  console.log('Valid keys:', keys);
}

translateMultiple([
  'common.actions.login',
  'games.lounge.activeTitle',
  'api.generic.unknownError',
]);

// ❌ This will error at compile time
// translateMultiple(["invalid.key.path"]);

export {};
