export const QUERY_CONFIG = {
  STALE_TIME: {
    SHORT: 1000 * 30, // 30 seconds
    MEDIUM: 1000 * 60 * 5, // 5 minutes
    LONG: 1000 * 60 * 60, // 1 hour
  },
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
} as const;

export const DEBOUNCE = {
  SEARCH_DELAY: 300,
  DEFAULT_DELAY: 500,
} as const;

export const OAUTH = {
  DISCOVERY_CACHE_TIME: 1000 * 60 * 10, // 10 minutes
  VERIFIER_LENGTH: 128,
  STATE_LENGTH: 24,
} as const;
