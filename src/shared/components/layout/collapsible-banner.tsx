'use client';

import { Button } from '@/shared/components/ui/button';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

const BANNER_COLLAPSED_KEY = 'homepage_banner_collapsed';

export function CollapsibleBanner() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(BANNER_COLLAPSED_KEY);
      if (stored === 'true') {
        setIsCollapsed(true);
      }
    } catch (error) {
      console.error('Failed to read banner state from localStorage:', error);
    }
  }, []);

  const toggleBanner = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);

    try {
      localStorage.setItem(BANNER_COLLAPSED_KEY, newState.toString());
    } catch (error) {
      console.error('Failed to save banner state to localStorage:', error);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white transition-all duration-300">
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <Info className="h-5 w-5 text-blue-100" />
              <h1 className="text-2xl md:text-3xl font-bold">
                Green and Just Transition Dashboard
              </h1>
            </div>
            {!isCollapsed && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-lg md:text-xl text-blue-50">
                  European project management & analytics platform
                </p>
                <div className="space-y-3">
                  <p className="text-blue-50 leading-relaxed">
                    The <strong>Green and Just Transition Dashboard</strong> is a simple web tool
                    that enables municipalities and other stakeholders{' '}
                    <strong>
                      to plan, monitor, and analyze their sustainable and energy projects
                    </strong>{' '}
                    in one place. It provides a clear <strong>view and easy comparisons</strong> of
                    project portfolios, <strong>tracks key indicators</strong> such as costs, energy
                    use, and emissions, offers{' '}
                    <strong>advanced data visualization to support better decision-making.</strong>
                  </p>
                  <p className="text-blue-50 leading-relaxed">
                    Municipalities use it to simplify complex project management, connect
                    methodology with up-to-date content and legislation, and gain a comprehensive
                    overview that helps them plan effectively, track impact, and achieve their green
                    transition goals.
                  </p>
                </div>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleBanner}
            className="text-white hover:bg-white/20 hover:text-white ml-4 shrink-0"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            <span className="sr-only">{isCollapsed ? 'Expand banner' : 'Collapse banner'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
