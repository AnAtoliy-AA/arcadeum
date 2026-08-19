'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorState } from '@arcadeum/ui';
import { useTranslation } from '@/shared/lib/useTranslation';

export interface GameWidgetErrorBoundaryProps {
  children: ReactNode;
  /**
   * Changing this key resets a captured error (e.g. the active game type or
   * room id), so a new game doesn't stay stuck on a stale crash screen.
   */
  resetKey?: string;
  /** Optional custom fallback instead of the default ErrorState. */
  fallback?: ReactNode;
  /** Optional side-effect hook (e.g. report to analytics). */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface GameWidgetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface InnerProps {
  children: ReactNode;
  resetKey?: string;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  title: string;
  message: string;
  retryLabel: string;
}

class GameWidgetErrorBoundaryInner extends Component<
  InnerProps,
  GameWidgetErrorBoundaryState
> {
  state: GameWidgetErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): GameWidgetErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(prevProps: InnerProps): void {
    if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
      this.reset();
    }
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    const { children, fallback, title, message, retryLabel } = this.props;
    if (!this.state.hasError) return children;

    if (fallback) return fallback;

    return (
      <ErrorState
        title={title}
        message={message}
        retryLabel={retryLabel}
        onRetry={this.reset}
        data-testid="game-widget-error"
      />
    );
  }
}

/**
 * Error boundary for a single game widget. Catches render/lifecycle errors so
 * one crashing game can never blank the whole room page, and offers a retry
 * that re-renders the widget without a full reload.
 */
export function GameWidgetErrorBoundary({
  children,
  resetKey,
  fallback,
  onError,
}: GameWidgetErrorBoundaryProps) {
  const { t } = useTranslation();
  return (
    <GameWidgetErrorBoundaryInner
      resetKey={resetKey}
      fallback={fallback}
      onError={onError}
      title={t('games.widgetError.title') || 'Something went wrong'}
      message={
        t('games.widgetError.message') ||
        'This game hit an unexpected error. Try again to keep playing.'
      }
      retryLabel={t('games.widgetError.retry') || 'Try again'}
    >
      {children}
    </GameWidgetErrorBoundaryInner>
  );
}
