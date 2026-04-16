'use client';

import { Input } from '@/shared/components/ui/input';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export function NewsSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') ?? '');

  useEffect(() => {
    setValue(searchParams.get('search') ?? '');
  }, [searchParams]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setValue(next);

      const params = new URLSearchParams(searchParams.toString());
      if (next) {
        params.set('search', next);
      } else {
        params.delete('search');
      }
      params.delete('page');
      router.push(`/news?${params.toString()}` as any);
    },
    [router, searchParams]
  );

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Search articles…"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
