# Type-Safe Translation System

## Overview

The translation system provides **compile-time type safety** for all translation keys. TypeScript will catch typos and non-existent keys before your code runs.

## How It Works

### 1. Type Generation

The `translation-paths.ts` utility recursively generates all possible paths through the `TranslationBundle` type:

```typescript
type TranslationKey =
  | "common.actions.login"
  | "common.actions.register"
  | "chat.status.connected"
  | "games.lounge.activeTitle"
  // ... all other valid paths
```

### 2. Type-Safe Hook

The `useTranslation()` hook only accepts valid `TranslationKey` values:

```typescript
const { t } = useTranslation();

// ✅ Valid - TypeScript accepts this
const text = t("common.actions.login");

// ❌ Invalid - TypeScript error at compile time
const invalid = t("common.invalid.key");
//                  ~~~~~~~~~~~~~~~~~~~~
// Argument of type '"common.invalid.key"' is not assignable to parameter of type 'TranslationKey'
```

## Benefits

### 1. **Catch Errors Early**
Typos and missing translations are caught at compile time, not runtime:

```typescript
// TypeScript will error immediately
t("games.loung.activeTitle")  // ❌ Typo: "loung" should be "lounge"
```

### 2. **Autocomplete**
Your IDE will suggest all available translation keys:

```typescript
t("games.|")  // IDE shows: lounge, rooms, detail, common, create
```

### 3. **Refactor Safety**
When you rename or remove translation keys, TypeScript will show all places that need updates:

```typescript
// If you remove "chat.send" from translations.ts
t("chat.send")  // ❌ TypeScript error - must be fixed
```

### 4. **Documentation**
The type system serves as living documentation of all available translations.

## Usage Examples

### Basic Usage

```typescript
import { useTranslation } from "@/shared/lib/useTranslation";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("games.lounge.activeTitle")}</h1>
      <button>{t("common.actions.login")}</button>
      <p>{t("payments.errors.invalidAmount")}</p>
    </div>
  );
}
```

### With Parameters

```typescript
const { t } = useTranslation();

// For keys with placeholders like "Welcome, {username}!"
const message = t("welcome.message", { username: "Alice" });
```

### Type-Safe Arrays

```typescript
import type { TranslationKey } from "@/shared/lib/useTranslation";

const menuItems: TranslationKey[] = [
  "navigation.chatsTab",
  "navigation.gamesTab",
  "navigation.historyTab",
];
```

## Adding New Translations

1. **Add to Type Definition** (`apps/web/src/shared/i18n/types.ts`):

```typescript
export type MyFeatureMessages = {
  title?: string;
  description?: string;
};

export type TranslationBundle = {
  // ... existing
  myFeature?: MyFeatureMessages;
};
```

2. **Add Translations** (`apps/web/src/shared/i18n/translations.ts`):

```typescript
const enTranslations: TranslationBundle = {
  // ... existing
  myFeature: {
    title: "My Feature",
    description: "Feature description",
  },
};
```

3. **Use Type-Safe Keys**:

```typescript
const { t } = useTranslation();
t("myFeature.title");  // ✅ Autocompletes and type-checks
```

## Testing Type Safety

Run TypeScript compiler to check for errors:

```bash
cd apps/web
npx tsc --noEmit
```

See `translation-type-safety.example.ts` for more examples.

## Implementation Details

### Core Types

- **`Paths<T>`**: Recursively generates all dot-separated paths through an object type
- **`PathValue<T, P>`**: Gets the value type at a specific path
- **`StringPaths<T>`**: Filters paths to only include those leading to string values
- **`TranslationKey`**: Union of all valid translation keys

### Type Safety Levels

1. **Compile Time**: TypeScript catches invalid keys during development
2. **IDE Support**: Autocomplete and inline documentation
3. **Build Time**: CI/CD pipeline fails on type errors
4. **Runtime**: Falls back to key if translation not found (defensive)

## Troubleshooting

### "Type instantiation is excessively deep"

If you get this error, the translation object might be too deeply nested. Consider flattening the structure or splitting into multiple bundles.

### Slow Type Checking

Deep recursive types can slow down TypeScript. If this becomes an issue:
1. Split large translation bundles into smaller modules
2. Use type caching (`@ts-ignore` with caution)
3. Upgrade to the latest TypeScript version

### Keys Not Autocompleting

1. Restart your TypeScript server (VS Code: Cmd+Shift+P → "Restart TS Server")
2. Check that all types are properly exported
3. Ensure `TranslationBundle` includes your new message types
