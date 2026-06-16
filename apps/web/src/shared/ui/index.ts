// Web-specific UI components that depend on Next.js, business logic, or
// web-only hooks. All shared/presentational components live in @arcadeum/ui.
//
// Import pattern:
//   import { Button, Card, Modal } from '@arcadeum/ui';        // shared
//   import { DownloadButtons } from '@/shared/ui/DownloadButtons'; // web-local
//   import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar'; // web-local

export { DownloadButtons } from './DownloadButtons/DownloadButtons';
export type { DownloadButtonsProps } from './DownloadButtons/DownloadButtons';
export * from './OptionCard/OptionCard';
export { Page } from './Page/Page';
