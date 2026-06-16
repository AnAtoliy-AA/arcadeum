type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
};

/**
 * Renders a Schema.org JSON-LD `<script>` block. The `data` object is
 * serialized via `JSON.stringify` — this is safe because:
 * 1. JSON-LD script blocks are not executed as JavaScript.
 * 2. `JSON.stringify` escapes `</script>` sequences inside string values.
 * 3. All callers pass server-controlled, static data (no raw user input).
 *
 * Never pass user-supplied strings directly as `data` values without
 * server-side sanitization.
 */
export function JsonLd({ data, id = 'json-ld' }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
