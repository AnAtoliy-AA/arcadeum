type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[];
  id?: string;
};

/**
 * Renders a Schema.org JSON-LD `<script>` block.
 *
 * `JSON.stringify` does not escape `<`, so a value containing `</script>`
 * would prematurely terminate the script tag and allow HTML/script
 * injection. All `<` are replaced with `\u003c`, which is valid JSON but
 * safe to embed inside a `<script>` element.
 */
export function JsonLd({ data, id = 'json-ld' }: JsonLdProps) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
