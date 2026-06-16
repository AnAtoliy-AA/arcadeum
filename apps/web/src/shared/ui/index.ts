// Shared UI Components
// These are dumb, presentational building blocks without business logic
//
// NOTE: The wildcard re-export pulls the entire @arcadeum/ui package into
// any consumer's chunk. This hurts tree-shaking but is kept for backward
// compatibility with the ~50 files that import from '@/shared/ui'. New
// code should import directly from '@arcadeum/ui' or a specific sub-path
// (e.g. '@/shared/ui/PlayerAvatar') to enable better code splitting.
export * from '@arcadeum/ui';

// Any web-specific logic that couldn't be migrated or needs to stay here
export { DownloadButtons } from './DownloadButtons/DownloadButtons';
export type { DownloadButtonsProps } from './DownloadButtons/DownloadButtons';
export * from './OptionCard/OptionCard';
export { Page } from './Page/Page';
