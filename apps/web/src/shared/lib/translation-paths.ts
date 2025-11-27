/**
 * Type utilities for type-safe translation keys
 * 
 * This module provides recursive type utilities that generate type-safe string paths
 * through nested translation objects. The types work together to:
 * 
 * 1. Generate all possible dot-separated paths (Paths<T>)
 * 2. Extract value types at specific paths (PathValue<T, P>)
 * 3. Filter to only paths leading to string values (StringPaths<T>)
 * 
 * Performance Note: These recursive types can be computationally expensive for very
 * deep structures (5+ levels). If you encounter "Type instantiation is excessively
 * deep" errors, consider flattening your translation structure or splitting into
 * multiple bundles.
 * 
 * @example
 * ```typescript
 * type Translations = {
 *   common: {
 *     actions: {
 *       login: string;
 *       logout: string;
 *     };
 *   };
 * };
 * 
 * // Paths<Translations> = "common" | "common.actions" | "common.actions.login" | "common.actions.logout"
 * // StringPaths<Translations> = "common.actions.login" | "common.actions.logout"
 * ```
 */

/**
 * Removes optional modifiers from all properties
 * 
 * This is a helper type that makes all properties required.
 * Used internally to simplify recursive type operations.
 * 
 * @example
 * ```typescript
 * type T = { a?: string; b?: number };
 * type R = Required<T>; // { a: string; b: number }
 * ```
 */
type Required<T> = {
  [K in keyof T]-?: T[K];
};

/**
 * Recursively removes optional modifiers and undefined from nested objects
 * 
 * This type recursively traverses an object structure and makes all properties
 * required at every level. This is necessary because optional properties and
 * undefined values complicate path generation.
 * 
 * @example
 * ```typescript
 * type T = {
 *   a?: {
 *     b?: string;
 *   };
 * };
 * type R = DeepRequired<T>; // { a: { b: string } }
 * ```
 */
type DeepRequired<T> = T extends object
  ? {
      [K in keyof T]-?: NonNullable<T[K]> extends object
        ? DeepRequired<NonNullable<T[K]>>
        : NonNullable<T[K]>;
    }
  : T;

/**
 * Recursively builds all possible dot-separated paths through an object type
 * 
 * This type generates a union of all possible paths through a nested object.
 * It handles:
 * - Nested objects (recursively generates paths)
 * - Arrays (treats as leaf nodes, doesn't generate index paths)
 * - Optional properties (handled via DeepRequired)
 * 
 * How it works:
 * 1. For each key in the object, it generates the key itself
 * 2. If the value is an object (not an array), it recursively generates paths
 *    and prepends the current key with a dot
 * 3. Combines all paths into a union type
 * 
 * @example
 * ```typescript
 * type T = {
 *   user: { name: string; age: number };
 *   settings: string[];
 * };
 * 
 * // Paths<T> = "user" | "user.name" | "user.age" | "settings"
 * ```
 * 
 * Note: Arrays are treated as leaf nodes. If you need array index paths,
 * you would need a different approach.
 */
export type Paths<T> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NonNullable<T[K]> extends Array<unknown>
          ? K // Arrays are leaf nodes
        : K | `${K}.${Paths<DeepRequired<NonNullable<T[K]>>>}` // Recursive path generation
        : K; // Primitive values are leaf nodes
    }[keyof T & string]
  : never;

/**
 * Gets the value type at a specific path in an object
 * 
 * This type extracts the type of a value at a given dot-separated path.
 * It recursively navigates through the object structure using template literal
 * types to split the path and traverse the object.
 * 
 * How it works:
 * 1. Splits the path into the first key and the rest
 * 2. Checks if the key exists in the object
 * 3. Recursively processes the rest of the path on the nested value
 * 4. Returns the final value type (with undefined removed)
 * 
 * @example
 * ```typescript
 * type T = {
 *   user: {
 *     name: string;
 *     age: number;
 *   };
 * };
 * 
 * // PathValue<T, "user.name"> = string
 * // PathValue<T, "user"> = { name: string; age: number }
 * // PathValue<T, "invalid.path"> = never
 * ```
 */
export type PathValue<T, P extends string> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? PathValue<DeepRequired<NonNullable<T[Key]>>, Rest>
    : never
  : P extends keyof T
  ? NonNullable<T[P]>
  : never;

/**
 * Checks if a path leads to a string value (leaf node)
 * 
 * This type filters paths to only include those that resolve to string values.
 * It's used internally by StringPaths to ensure we only generate paths to
 * actual translatable strings, not intermediate objects.
 * 
 * How it works:
 * 1. Uses PathValue to get the type at the path
 * 2. Checks if it extends string (or string | undefined)
 * 3. Returns the path if it's a string, never otherwise
 * 
 * @example
 * ```typescript
 * type T = {
 *   user: { name: string; age: number };
 *   title: string;
 * };
 * 
 * // IsStringPath<T, "user.name"> = "user.name" (string)
 * // IsStringPath<T, "user"> = never (object, not string)
 * // IsStringPath<T, "title"> = "title" (string)
 * ```
 */
export type IsStringPath<T, P extends Paths<T>> = PathValue<T, P> extends string
  ? P
  : PathValue<T, P> extends string | undefined
  ? P
  : never;

/**
 * Filters paths to only include those that lead to string values
 * 
 * This is the main utility type used to generate type-safe translation keys.
 * It combines Paths (all paths) with IsStringPath (string filter) to create
 * a union of only valid translation key paths.
 * 
 * How it works:
 * 1. Generates all paths using Paths<T>
 * 2. Maps each path through IsStringPath to filter to strings
 * 3. Extracts the union of valid string paths
 * 
 * @example
 * ```typescript
 * type T = {
 *   common: {
 *     actions: {
 *       login: string;
 *       logout: string;
 *     };
 *     config: {
 *       theme: string;
 *     };
 *   };
 * };
 * 
 * // StringPaths<T> = "common.actions.login" | "common.actions.logout" | "common.config.theme"
 * // Note: "common" and "common.actions" are NOT included (they're objects, not strings)
 * ```
 * 
 * This type is used to generate the TranslationKey type, ensuring compile-time
 * type safety for all translation key usage.
 */
export type StringPaths<T> = {
  [K in Paths<T>]: IsStringPath<T, K>;
}[Paths<T>];
