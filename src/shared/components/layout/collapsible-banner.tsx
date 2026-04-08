'use client';

import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { useBannerCollapsed } from '@/shared/hooks/use-banner-collapsed';
import { cn } from '@/shared/lib/utils';
import { ChevronUp, Info } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface BannerContentProps {
  _onClose?: () => void;
  isModal?: boolean;
}

function BannerContent({ _onClose, isModal }: BannerContentProps) {
  return (
    <div className={cn('space-y-4', isModal && 'pt-2')}>
      <div className="flex items-center gap-3">
        <Info className="h-5 w-5 text-blue-600 shrink-0" />
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          Green and Just Transition Dashboard
        </h1>
      </div>
      <p className="text-lg md:text-xl text-slate-700">
        European project management & analytics platform
      </p>
      <div className="space-y-3">
        <p className="text-slate-600 leading-relaxed text-justify">
          The <strong>Green and Just Transition Dashboard</strong> is a simple web tool that enables
          municipalities and other stakeholders{' '}
          <strong>to plan, monitor, and analyze their sustainable and energy projects</strong> in
          one place. It provides a clear <strong>view and easy comparisons</strong> of project
          portfolios, <strong>tracks key indicators</strong> such as costs, energy use, and
          emissions, offers{' '}
          <strong>advanced data visualization to support better decision-making.</strong>
        </p>
        <p className="text-slate-600 leading-relaxed text-justify">
          Municipalities use it to simplify complex project management, connect methodology with
          up-to-date content and legislation, and gain a comprehensive overview that helps them plan
          effectively, track impact, and achieve their green transition goals.
        </p>
      </div>
      {/* Hero image below text */}
      <div className="pt-4 relative w-full h-48 md:h-120">
        <Image
          src="/images/hero.jpg"
          alt="Green and Just Transition"
          fill
          className="object-cover rounded-lg"
          priority
        />
      </div>
    </div>
  );
}

export function CollapsibleBannerTrigger({ className }: { className?: string }) {
  const { toggleCollapsed } = useBannerCollapsed();
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={isMobile ? handleOpen : toggleCollapsed}
        className={cn(
          'text-slate-700 hover:bg-slate-200/50 hover:text-slate-900 h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm rounded-full',
          className
        )}
      >
        <Info className="h-5 w-5 text-blue-600" />
        <span className="sr-only">Expand banner</span>
      </Button>

      {/* Mobile Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Green and Just Transition Dashboard</DialogTitle>
          </DialogHeader>
          <BannerContent _onClose={handleClose} isModal />
        </DialogContent>
      </Dialog>
    </>
  );
}

export function CollapsibleBanner() {
  const { isCollapsed, toggleCollapsed } = useBannerCollapsed();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // On mobile with collapsed state, don't render anything (trigger is in header)
  if (isMobile) {
    return null;
  }

  // Desktop collapsed state - don't render (trigger is in header)
  if (isCollapsed) {
    return null;
  }

  // Desktop expanded state - render inline
  return (
    <div className="relative overflow-hidden rounded-lg transition-all duration-300">
      {/* Absolute positioned toggle button in top right corner */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="text-slate-700 hover:bg-slate-200/50 hover:text-slate-900 h-8 w-8 bg-white/80 backdrop-blur-sm shadow-sm rounded-full"
        >
          <ChevronUp className="h-4 w-4" />
          <span className="sr-only">Collapse banner</span>
        </Button>
      </div>

      <div className="bg-slate-50 p-6">
        <div className="flex-1 animate-in fade-in duration-300 pr-12">
          <BannerContent _onClose={toggleCollapsed} />
        </div>
      </div>
    </div>
  );
}
