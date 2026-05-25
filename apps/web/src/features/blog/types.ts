import type { Locale } from '@/shared/i18n';

export type BlogBlock =
  | { type: 'heading'; level: 2 | 3; text: string; id?: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'cta'; href: string; text: string; description?: string };

export interface BlogPost {
  /** URL-safe slug, identical across locales (English by convention). */
  slug: string;
  locale: Locale;
  title: string;
  /** Short summary used for listing cards, OG description, and JSON-LD. */
  excerpt: string;
  /** ISO date of original publication. Stable across edits. */
  publishedAt: string;
  /** ISO date of the last meaningful content update. Optional. */
  updatedAt?: string;
  /** Display name of the author (used in BlogPosting JSON-LD). */
  author: string;
  /** SEO tags — also rendered as visible chips on the post page. */
  tags: string[];
  /**
   * Reading time in minutes. Rendered on the post page and emitted as
   * `timeRequired` (ISO 8601 duration) in BlogPosting JSON-LD so SERPs
   * can show "5 min read" snippets.
   */
  readingTimeMinutes: number;
  /**
   * Body of the post as structured blocks. Avoids HTML strings (no
   * XSS surface) and renders identically in Server Components. Internal
   * links to game landings or other pages should use the `cta` block —
   * the renderer turns them into a styled call-to-action card so the
   * link signal lands on a real anchor with descriptive text.
   */
  body: BlogBlock[];
  /**
   * Optional HowTo schema payload. When present, the post emits a
   * Schema.org `HowTo` node next to `BlogPosting` so Google can show
   * step-by-step rich results in SERPs. The steps must mirror visible
   * content on the page (Google's rich-result guideline) — by
   * convention these are the same items the article's TL;DR list
   * surfaces.
   */
  howTo?: {
    /** Optional override of the recipe name. Defaults to the post title. */
    name?: string;
    /** ISO 8601 duration (e.g. `PT20M`). Optional but rich-result-friendly. */
    totalTime?: string;
    steps: Array<{
      name: string;
      text: string;
      /** Optional `url` for the step — typically `#section-id` on the post. */
      url?: string;
    }>;
  };
}
