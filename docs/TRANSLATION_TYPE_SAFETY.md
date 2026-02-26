# Translation Type Safety

This document provides a comprehensive guide to the type-safe translation system implemented in both the web and mobile applications to prevent runtime errors from using non-existent translation keys.

## Overview

Both web and mobile apps use **TypeScript** to enforce compile-time type checking on translation keys. This means:

- ✅ **Autocomplete** - Your IDE will suggest valid translation keys
- ✅ **Type errors** - Invalid keys cause TypeScript compilation errors
- ✅ **Refactoring safety** - Renaming translations is safer with find-all-references
- ✅ **No runtime errors** - Catch translation key typos before deployment

## Implementation Status

### Status: ✅ COMPLETE

Both **web** and **mobile** applications now have fully functional type-safe translation systems that prevent using non-existent translation keys.

### What Was Added/Fixed

#### 1. Fixed Type Safety Issue ✅

**File:** `apps/web/src/app/chat/ChatPage.tsx:360`

**Before:**

```typescript
aria-label={t("chat.send.ariaLabel") || "Send message"}
```

**After:**

```typescript
aria-label={t("chat.send") || "Send message"}
```

**Why:** `chat.send` is a string, not an object with `ariaLabel` property. The fix prevents potential runtime errors and demonstrates how type checking catches mistakes.

#### 2. Added Mobile Type Safety Examples ✅

**File:** `apps/mobile/lib/i18n/__examples__/translation-type-safety.example.ts`

**Purpose:**

- Demonstrates valid translation key usage
- Shows examples of invalid keys (commented out)
- Provides component usage examples
- Mirrors the web app's example structure

**Usage:**

```bash
# View the examples
cat apps/mobile/lib/i18n/__examples__/translation-type-safety.example.ts

# Test by uncommenting invalid keys and running:
cd apps/mobile && npm run build
```

#### 3. Added Type Check Script for Web ✅

**File:** `apps/web/package.json`

**Added script:**

```json
{
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

**Usage:**

```bash
cd apps/web && npm run type-check
```

**Note:** Mobile already had this as the `build` script.

### Verification Checklist

- ✅ Web app has type-safe translation system
- ✅ Mobile app has type-safe translation system
- ✅ Web app has example file
- ✅ Mobile app has example file
- ✅ Both apps use `TranslationKey` type
- ✅ Invalid keys cause TypeScript errors
- ✅ IDE autocomplete works for translation keys
- ✅ Fixed incorrect key usage in ChatPage
- ✅ Added comprehensive documentation
- ✅ Added type-check script to web app
- ✅ All translation keys in codebase are valid

## Web App (`apps/web`)

### Architecture

The web app uses a custom type system to generate type-safe translation paths:

```typescript
// apps/web/src/shared/i18n/types.ts - Translation structure types
export type TranslationBundle = {
  common?: CommonMessages;
  home?: HomeMessages;
  settings?: SettingsMessages;
  // ... other sections
};

// apps/web/src/shared/lib/translation-paths.ts - Type utilities
export type StringPaths<T> = {
  [K in Paths<T>]: IsStringPath<T, K>;
}[Paths<T>];

// apps/web/src/shared/lib/useTranslation.ts - Type-safe hook
export type TranslationKey = StringPaths<typeof translations.en>;
```

### How It Works

1. **Define translations** in `apps/web/src/shared/i18n/translations.ts`
2. **Type utilities** recursively build all valid dot-separated paths through the translation object
3. **TranslationKey type** is automatically derived from the English translation structure
4. **useTranslation hook** enforces the TranslationKey type

### Usage Example

```tsx
import { useTranslation } from '@/shared/lib/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  // ✅ Valid - TypeScript autocompletes and validates
  const loginText = t('common.actions.login');

  // ❌ Invalid - TypeScript error at compile time
  // const invalid = t("common.nonexistent.key");
  //                    ~~~~~~~~~~~~~~~~~~~~~~
  //                    Type error: Property 'nonexistent' does not exist

  return <button>{loginText}</button>;
}
```

### File Structure

```
apps/web/src/shared/
├── i18n/
│   ├── translations.ts          # Translation bundles (en, es, fr)
│   └── types.ts                 # TypeScript type definitions
└── lib/
    ├── useTranslation.ts        # Type-safe translation hook
    ├── translation-paths.ts     # Type utility functions
    └── __examples__/
        └── translation-type-safety.example.ts  # Usage examples
```

## Mobile App (`apps/mobile`)

### Architecture

The mobile app uses a similar but slightly different type system:

```typescript
// apps/mobile/lib/i18n/types.ts - Type utilities
export type TranslationLeafPaths<T, Prefix extends string = ''> = {
  [K in Extract<keyof T, string>]: T[K] extends string
    ? `${Prefix}${K}`
    : `${Prefix}${K}` | TranslationLeafPaths<T[K], `${Prefix}${K}.`>;
}[Extract<keyof T, string>];

// apps/mobile/lib/i18n/messages.ts - Translation key type
export type TranslationKey = TranslationLeafPaths<TranslationDictionary>;

// apps/mobile/lib/i18n.ts - Type-safe translation function
export function translate(
  locale: LanguagePreference,
  key: TranslationKey,  // <-- Type-checked!
  replacements?: Replacements,
): string { ... }
```

### How It Works

1. **Define translations** in `apps/mobile/lib/i18n/messages.ts`
2. **TranslationLeafPaths** recursively generates all valid dot-separated paths
3. **TranslationKey type** is derived from the English translation dictionary
4. **translate function** and **useTranslation hook** enforce the TranslationKey type

### Usage Example

```tsx
import { useTranslation } from '@/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();

  // ✅ Valid - TypeScript autocompletes and validates
  const loginText = t('common.actions.login');

  // ✅ Valid with replacements
  const greeting = t('common.greeting', { name: 'John' });

  // ❌ Invalid - TypeScript error at compile time
  // const invalid = t('common.nonexistent.key');
  //                    ~~~~~~~~~~~~~~~~~~~~~~
  //                    Type error: Property 'nonexistent' does not exist

  return <Button title={loginText} />;
}
```

### File Structure

```
apps/mobile/lib/
├── i18n/
│   ├── messages.ts              # Translation dictionaries
│   ├── types.ts                 # TypeScript type utilities
│   └── __examples__/
│       └── translation-type-safety.example.ts  # Usage examples
└── i18n.ts                      # Translation hook and utilities
```

## Benefits

### 1. **Catch Errors Early**

```typescript
// ❌ This error is caught at compile time, not in production
const text = t('chat.send.ariaLabel');
//              ~~~~~~~~~~~~~~~~~~~~~
//              Property 'ariaLabel' does not exist on type 'string'
```

### 2. **IDE Autocomplete**

Your IDE will provide autocomplete suggestions for all valid translation keys:

- Type `t("` and get suggestions
- Navigate through nested structures with dot notation
- See the full path as you type

### 3. **Safe Refactoring**

When renaming or restructuring translations:

1. Update the translation structure
2. TypeScript will show errors at all usage sites
3. Use "Find All References" to update all usages
4. Compile to verify all keys are fixed

### 4. **Documentation**

The type system serves as living documentation:

```typescript
// Hover over a translation key to see its full type path
const label = t('games.create.fieldName');
//               ~~~~~~~~~~~~~~~~~~~~~~
//               type: "games.create.fieldName"
```

## Testing Type Safety

Both apps include example files demonstrating type safety:

**Web:**

```bash
# View examples with valid and invalid keys (commented)
cat apps/web/src/shared/lib/__examples__/translation-type-safety.example.ts
```

**Mobile:**

```bash
# View examples with valid and invalid keys (commented)
cat apps/mobile/lib/i18n/__examples__/translation-type-safety.example.ts
```

To test type checking:

1. Uncomment invalid key examples
2. Run TypeScript compiler: `tsc --noEmit`
3. Observe type errors for invalid keys

## Adding New Translations

### Web App

1. **Add type definition** to `apps/web/src/shared/i18n/types.ts`:

```typescript
export type MyNewMessages = {
  title?: string;
  subtitle?: string;
  actions?: {
    save?: string;
    cancel?: string;
  };
};

export type TranslationBundle = {
  // ... existing types
  myNew?: MyNewMessages;
};
```

2. **Add translations** to `apps/web/src/shared/i18n/translations.ts`:

```typescript
const enTranslations: TranslationBundle = {
  // ... existing translations
  myNew: {
    title: 'My New Section',
    subtitle: 'This is a subtitle',
    actions: {
      save: 'Save',
      cancel: 'Cancel',
    },
  },
};
```

3. **Use in components**:

```typescript
const title = t('myNew.title'); // ✅ Type-safe!
```

### Mobile App

1. **Add translations** to `apps/mobile/lib/i18n/messages.ts`:

```typescript
const MY_NEW_MESSAGES_EN = {
  title: 'My New Section',
  subtitle: 'This is a subtitle',
  actions: {
    save: 'Save',
    cancel: 'Cancel',
  },
};

export const translations: TranslationMap = {
  en: {
    // ... existing translations
    myNew: MY_NEW_MESSAGES_EN,
  },
  // ... other locales
};
```

2. **Use in components**:

```typescript
const title = t('myNew.title'); // ✅ Type-safe!
```

## Best Practices

### 1. Always Use the Translation Hook

```typescript
// ✅ Good - Type-safe
const { t } = useTranslation();
const text = t('common.actions.login');

// ❌ Bad - No type safety
const text = translations.en.common?.actions?.login;
```

### 2. Provide Fallbacks

```typescript
// The translation hook returns the key if translation is missing
// But you can provide additional fallback text for better UX
const text = t('common.actions.login') || 'Login';
```

### 3. Use Proper Structure

```typescript
// ✅ Good - Hierarchical structure
common: {
  actions: {
    login: "Login",
    logout: "Logout",
  }
}

// ❌ Bad - Flat structure loses organization
common: {
  actionsLogin: "Login",
  actionsLogout: "Logout",
}
```

### 4. Keep Keys Semantic

```typescript
// ✅ Good - Semantic key names
t('auth.errors.invalidCredentials');

// ❌ Bad - Generic or unclear names
t('auth.error1');
```

## Common Issues

### Issue 1: Type Not Updating After Adding Translation

**Solution:** Restart your TypeScript server in your IDE:

- VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"
- Or restart your IDE

### Issue 2: Deep Nesting Causing Long Type Names

**Solution:** This is expected. TypeScript handles deep paths well. If it becomes an issue, consider flattening your translation structure.

### Issue 3: Optional Chaining in Types

The translation types use optional properties (`?`) because:

- Not all locales may have all translations
- Graceful fallback to English or the key itself
- This doesn't affect type safety for keys - only for values

## Migration Guide

If you have existing code using string literals for translation keys:

1. **Find all usage** of translation functions:

   ```bash
   # Web
   grep -r "t(" apps/web/src --include="*.tsx" --include="*.ts"

   # Mobile
   grep -r "t(" apps/mobile/lib --include="*.tsx" --include="*.ts"
   ```

2. **Fix invalid keys** - TypeScript will show errors for non-existent keys

3. **Run type check**:

   ```bash
   # Web
   cd apps/web && npm run type-check

   # Mobile
   cd apps/mobile && npm run type-check
   ```

## Conclusion

Type-safe translations provide:

- **Developer Experience** - Autocomplete and instant feedback
- **Code Quality** - Catch errors before runtime
- **Maintainability** - Safe refactoring and clear structure
- **Confidence** - Deploy knowing translation keys are valid

Both web and mobile apps are fully equipped with type-safe translation systems!

**Implementation Date:** 2025-11-14
**Status:** ✅ Complete and Production-Ready
