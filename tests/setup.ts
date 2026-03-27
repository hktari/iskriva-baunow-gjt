import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Mock DOM APIs for Radix UI Select in jsdom
if (typeof window !== 'undefined') {
  Element.prototype.hasPointerCapture = function () {
    return false;
  };

  Element.prototype.scrollIntoView = function () {
    // Mock implementation
  };

  Element.prototype.setPointerCapture = function () {
    // Mock implementation
  };

  Element.prototype.releasePointerCapture = function () {
    // Mock implementation
  };
}

afterEach(() => {
  cleanup();
});
