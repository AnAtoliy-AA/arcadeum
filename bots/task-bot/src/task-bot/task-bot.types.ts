import { Injectable, Logger } from '@nestjs/common';

type Engine = 'opencode' | 'mimo';
type Priority = 'low' | 'normal' | 'high' | 'urgent';

interface ParsedTask {
  arc: string | null;
  title: string;
  requirements: string[];
  scope: string[];
  engine: Engine;
  priority: Priority;
}

interface PendingRetry {
  jobType: 'implement' | 'fix' | 'ci-fix';
  targetNum: string;
  engine: Engine;
  chatId: number;
  worktreePath?: string;
  retryCount?: number;
  jobData?: Record<string, unknown>;
  expiresAt: number;
}

const SCOPE_KEYWORDS: Record<string, string[]> = {
  backend: [
    'api', 'server', 'database', 'auth', 'endpoint', 'service', 'gateway', 'socket', 'websocket',
  ],
  web: [
    'page', 'ui', 'component', 'button', 'form', 'modal', 'dashboard', 'layout', 'css', 'style',
  ],
  mobile: ['app', 'screen', 'ios', 'android', 'expo', 'react native'],
  game: ['game', 'engine', 'bot', 'ai', 'match', 'session', 'turn'],
};

export { SCOPE_KEYWORDS };
export type { ParsedTask, PendingRetry, Engine, Priority };