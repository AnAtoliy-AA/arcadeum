/**
 * Auth feature public API
 * Following FSD architecture - only export what's needed by other layers
 */

// Main page component and its wrapper
export { AuthPageWrapper } from './ui/AuthPageWrapper';

// Types
export type {
  SessionDetailItem,
  SessionDetailLabels,
  ProviderCopy,
} from './types';
