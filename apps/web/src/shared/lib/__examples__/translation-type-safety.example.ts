/**
 * Examples demonstrating type-safe translation keys
 *
 * This file showcases how TypeScript catches translation key errors at compile time.
 * Run `tsc --noEmit` to see type checking in action.
 */

import type { TranslationKey } from "../useTranslation";

// ✅ VALID KEYS - These will compile successfully
const _validKeys: TranslationKey[] = [
  // Common
  "common.actions.login",
  "common.actions.register",
  "common.labels.email",
  "common.labels.password",

  // Navigation
  "navigation.chatsTab",
  "navigation.gamesTab",
  "navigation.historyTab",

  // Chat
  "chat.notFound",
  "chat.status.connected",
  "chat.status.connecting",
  "chat.input.placeholder",
  "chat.send",

  // Chat List
  "chatList.search.placeholder",
  "chatList.empty.noChats",
  "chatList.empty.unauthenticated",

  // Games
  "games.lounge.activeTitle",
  "games.lounge.filters.statusLabel",
  "games.lounge.filters.status.all",
  "games.lounge.filters.status.lobby",
  "games.lounge.filters.participation.hosting",
  "games.common.createRoom",
  "games.create.title",
  "games.create.fieldName",
  "games.rooms.status.lobby",

  // History
  "history.list.emptyNoEntries",
  "history.status.completed",

  // Payments
  "payments.title",
  "payments.amountLabel",
  "payments.errors.invalidAmount",
  "payments.errors.amountTooLarge",
  "payments.status.success",

  // Settings
  "settings.title",
  "settings.appearanceTitle",
  "settings.themeOptions.dark.label",

  // Auth
  "auth.title",
  "auth.badge",
  "auth.oauth.loginButton",
  "auth.statusCard.heading",
];

// ❌ INVALID KEYS - Uncomment to see TypeScript errors

/*
const invalidKeys: TranslationKey[] = [
  "common.invalid.key",           // Error: Property 'invalid' does not exist
  "chat.typo",                     // Error: Property 'typo' does not exist
  "games.lounge.filters.wrong",   // Error: Property 'wrong' does not exist
  "payments.notExisting",          // Error: Property 'notExisting' does not exist
  "randomKey",                     // Error: Type '"randomKey"' is not assignable
];
*/

// ✅ Usage in a component (type-safe)
function _ExampleComponent() {
  // This would work in a real component with useTranslation()
  // const { t } = useTranslation();

  // ✅ These will autocomplete and type-check
  // const loginLabel = t("common.actions.login");
  // const errorMsg = t("payments.errors.invalidAmount");

  // ❌ This will show TypeScript error
  // const invalid = t("common.notExisting.key");
}

// ✅ Type-safe helper function
function translateMultiple(_keys: TranslationKey[]): void {
  // All keys are guaranteed to exist in TranslationBundle
}

translateMultiple([
  "common.actions.login",
  "games.lounge.activeTitle",
  "payments.title",
]);

// ❌ This will error at compile time
// translateMultiple(["invalid.key.path"]);

export {};
