import { captureError } from '@/shared/lib/capture-error';
import { useEffect, useState } from 'react';

const BANNER_COLLAPSED_KEY = 'homepage_banner_collapsed';

export function useBannerCollapsed() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BANNER_COLLAPSED_KEY);
      setIsCollapsed(stored === 'true');
    } catch (error) {
      captureError(error, {
        component: 'useBannerCollapsed',
        action: 'read_localstorage',
        errorType: 'localStorage_read_error',
      });
    }
  }, []);

  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    try {
      localStorage.setItem(BANNER_COLLAPSED_KEY, newState.toString());
      // Dispatch storage event for cross-component sync
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: BANNER_COLLAPSED_KEY,
          newValue: newState.toString(),
          storageArea: localStorage,
        })
      );
    } catch (error) {
      captureError(error, {
        component: 'useBannerCollapsed',
        action: 'write_localstorage',
        errorType: 'localStorage_write_error',
      });
    }
  };

  // Listen for storage changes from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === BANNER_COLLAPSED_KEY && e.newValue !== null) {
        setIsCollapsed(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { isCollapsed, toggleCollapsed };
}
