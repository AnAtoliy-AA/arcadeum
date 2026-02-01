import { translations } from "../i18n/translations";
import type { Paths, PathValue, StringPaths } from "./translation-paths";
import type { TranslationKey } from "./useTranslation";

/**
 * Type testing file for translation type utilities
 * 
 * This file tests the type system to ensure:
 * 1. Paths are correctly generated from translation structure
 * 2. StringPaths filters to only string values
 * 3. PathValue correctly extracts value types
 * 4. TranslationKey matches StringPaths
 */

// ============================================================================
// Test 1: Paths generation
// ============================================================================
// This should generate all possible paths through the translation object
type TestPaths = Paths<typeof translations.en>;
// Expected: Union of all paths like "common" | "common.actions" | "common.actions.login" | ...

// ============================================================================
// Test 2: StringPaths filtering
// ============================================================================
// This should only include paths that lead to string values (leaf nodes)
type TestStringPaths = StringPaths<typeof translations.en>;
// Expected: Union of paths to strings like "common.actions.login" | "chat.send" | ...

// ============================================================================
// Test 3: PathValue extraction
// ============================================================================
// Test extracting value types at specific paths
type TestPathValue1 = PathValue<typeof translations.en, "common.actions.login">;
// Expected: string

type TestPathValue2 = PathValue<typeof translations.en, "chat.send">;
// Expected: string

type TestPathValue3 = PathValue<typeof translations.en, "common.actions">;
// Expected: object (not a string, so won't be in StringPaths)

// ============================================================================
// Test 4: TranslationKey compatibility
// ============================================================================
// Verify that TranslationKey matches StringPaths
type TestTranslationKey = TranslationKey;
// Expected: Should be the same as TestStringPaths

// ============================================================================
// Test 5: Edge cases - Deep nesting
// ============================================================================
// Test that deep paths work correctly
type TestDeepPath = PathValue<
  typeof translations.en,
  "games.lounge.filters.status.lobby"
>;
// Expected: string

type TestDeepPath2 = PathValue<
  typeof translations.en,
  "auth.statusCard.details.provider"
>;
// Expected: string

// ============================================================================
// Test 6: Optional properties
// ============================================================================
// Test that optional properties are handled correctly
type TestOptional = PathValue<typeof translations.en, "common.labels.email">;
// Expected: string | undefined (but StringPaths should still include it)

// ============================================================================
// Test 7: Nested objects
// ============================================================================
// Test paths to nested objects (should not be in StringPaths)
type TestNestedObject = PathValue<typeof translations.en, "common.actions">;
// Expected: object type (not string)

// ============================================================================
// Test 8: Array handling
// ============================================================================
// Arrays should be treated as leaf nodes (just the key, not key.index)
// This is handled in the Paths type definition

// ============================================================================
// Export types for IDE inspection
// ============================================================================
export type {
  TestPaths,
  TestStringPaths,
  TestPathValue1,
  TestPathValue2,
  TestPathValue3,
  TestTranslationKey,
  TestDeepPath,
  TestDeepPath2,
  TestOptional,
  TestNestedObject,
};

// ============================================================================
// Runtime validation helpers (for development)
// ============================================================================
/**
 * Validates that a translation key exists in the structure
 * This is a runtime check, but TypeScript should prevent invalid keys at compile time
 */
export function validateTranslationKey(key: TranslationKey): boolean {
  const keys = key.split(".");
  let value: unknown = translations.en;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return false;
    }
  }

  return typeof value === "string";
}

/**
 * Gets all valid translation keys (for testing/debugging)
 */
export function getAllTranslationKeys(): TranslationKey[] {
  const keys: string[] = [];

  function traverse(obj: unknown, prefix = ""): void {
    if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === "string") {
          keys.push(fullKey);
        } else if (typeof value === "object" && value !== null) {
          traverse(value, fullKey);
        }
      }
    }
  }

  traverse(translations.en);
  return keys as TranslationKey[];
}
