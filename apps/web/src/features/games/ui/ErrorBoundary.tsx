'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '@arcadeum/ui';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Fallback UI when an error occurs. */
  fallback?: ReactNode;
  /** Called when an error is caught. */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches JavaScript errors anywhere in the child component tree, logs them,
 * and renders a fallback UI instead of crashing the whole page.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-8 text-center backdrop-blur-xl">
          <span className="text-5xl">⚠️</span>
          <h2 className="text-xl font-bold text-white">Something went wrong</h2>
          <p className="max-w-md text-sm text-slate-400">
            {this.state.error?.message ||
              'An unexpected error occurred while loading this content.'}
          </p>
          <Button
            variant="primary"
            size="md"
            onClick={this.handleRetry}
            data-testid="error-boundary-retry"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
