'use client';

import { Button } from '@/shared/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/news/refresh', { method: 'GET' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? 'Refresh failed');
        return;
      }
      toast.success(`Feed refreshed — ${data.upserted} articles updated`);
      router.refresh();
    } catch {
      toast.error('Refresh failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
      <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Refreshing…' : 'Refresh feed'}
    </Button>
  );
}
