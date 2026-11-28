import type { StreamSettings } from './stream-settings.model';
import type { StreamCommandType } from './dto/stream-command.dto';

export interface StreamSettingsView {
  version: number;
  settings: StreamSettings;
  updatedAt: string | null;
  updatedByLabel: string | null;
}

/** Response of GET /stream/config. Contains no secrets by construction. */
export interface StreamConfigView {
  version: number;
  config: StreamSettings;
}

export interface StreamAuditView {
  id: string;
  kind: 'settings' | 'command';
  version: number;
  adminLabel: string;
  changedAt: string;
  changes: { path: string; from: unknown; to: unknown }[];
}

export interface StreamCommandView {
  id: string;
  type: StreamCommandType;
  graceful: boolean;
  status: string;
  createdAt: string;
}

export interface StreamStatusView {
  /** True when the director reported within the last 45 s. */
  online: boolean;
  lastReportAt: string | null;
  state: string | null;
  currentGame: {
    id: string;
    roomId?: string;
    theme?: string;
    startedAt?: string;
  } | null;
  uptimeSec: number | null;
  ffmpegFps: number | null;
  ffmpegRestarts: number | null;
  gamesPlayed: number | null;
  dryRun: boolean | null;
  lastRestartReason: string | null;
  lastRestartAt: string | null;
  recentErrors: string[];
  appliedConfigVersion: number | null;
  /** Latest saved settings version, to compare with appliedConfigVersion. */
  currentConfigVersion: number;
  pendingCommands: number;
}
