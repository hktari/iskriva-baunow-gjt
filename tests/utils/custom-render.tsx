//  eslint-disable no-unused-vars

/**
 * Custom render utilities for testing React components with providers
 */
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  session?: any;
  initialProps?: Record<string, any>;
}

/**
 * Custom render function that wraps components with necessary providers
 * Use this instead of the default render from @testing-library/react
 */
export function renderWithProviders(ui: ReactElement, options?: CustomRenderOptions) {
  const { session, initialProps, ...renderOptions } = options || {};

  function Wrapper({ children }: { children: ReactNode }) {
    // Add providers here as needed (e.g., SessionProvider, QueryClientProvider)
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Re-export everything from testing-library
 */
export * from '@testing-library/react';
export { renderWithProviders as render };
