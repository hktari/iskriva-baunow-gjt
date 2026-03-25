'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { ProjectFilters } from './project-filters';

interface ProjectListClientProps {
  configurableFields: {
    PROJECT_TYPE?: string[];
    INVESTMENT_TYPE?: string[];
    ORGANIZATION?: string[];
  };
  isAuthenticated: boolean;
}

export function ProjectListClient({ configurableFields, isAuthenticated }: ProjectListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = {
    search: searchParams.get('search') || '',
    country: searchParams.get('country') || '',
    projectType: searchParams.get('projectType') || '',
    investmentType: searchParams.get('investmentType') || '',
    status: searchParams.get('status') || '',
    organization: searchParams.get('organization') || '',
    minValue: searchParams.get('minValue') || '',
    maxValue: searchParams.get('maxValue') || '',
    favoritesOnly: searchParams.get('favoritesOnly') === 'true',
  };

  const onFilterChange = useCallback(
    (key: string, value: string | boolean) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value === '' || value === false) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }

      // Reset to page 1 when filters change
      params.delete('page');

      const newUrl = params.toString() ? `/?${params.toString()}` : '/';
      router.push(newUrl as any, { scroll: false });
    },
    [router, searchParams]
  );

  const onClearFilters = useCallback(() => {
    router.push('/', { scroll: false });
  }, [router]);

  return (
    <ProjectFilters
      filters={filters}
      onFilterChange={onFilterChange}
      onClearFilters={onClearFilters}
      configurableFields={configurableFields}
      isAuthenticated={isAuthenticated}
    />
  );
}
