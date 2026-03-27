'use client';

import { AlertCircle } from 'lucide-react';
import React, { Component, ReactNode } from 'react';
import { Button } from './ui/button';

interface SectionErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Lightweight Error Boundary for UI sections
 * Use this for smaller sections of the UI where you want to prevent
 * the entire page from crashing if a component fails.
 *
 * Usage:
 * ```tsx
 * <SectionErrorBoundary sectionName="Project List">
 *   <ProjectList />
 * </SectionErrorBoundary>
 * ```
 */
export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): SectionErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in section "${this.props.sectionName ?? 'Unknown'}":`, error);
    }

    this.props.onError?.(error, errorInfo);

    // Capture to Sentry with section context
    if (typeof window !== 'undefined') {
      import('@sentry/nextjs').then(Sentry => {
        Sentry.withScope(scope => {
          scope.setTag('error_boundary', 'section');
          scope.setTag('component', 'SectionErrorBoundary');
          if (this.props.sectionName) {
            scope.setTag('section_name', this.props.sectionName);
          }
          scope.setContext('react_error_info', {
            componentStack: errorInfo.componentStack,
            sectionName: this.props.sectionName,
          });
          scope.setLevel('error');
          Sentry.captureException(error);
        });
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError === true) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-destructive">
                {this.props.sectionName
                  ? `Error loading ${this.props.sectionName}`
                  : 'Error loading this section'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error ? (
                <p className="text-xs font-mono text-muted-foreground">
                  {this.state.error.message}
                </p>
              ) : null}
              <Button
                size="sm"
                variant="outline"
                onClick={this.handleReset}
                className="h-7 text-xs"
              >
                Retry
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
