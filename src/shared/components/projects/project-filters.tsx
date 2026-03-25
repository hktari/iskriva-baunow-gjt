'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { PROJECT_COUNTRIES, PROJECT_STATUSES } from '@/shared/lib/constants';
import { Heart, Search, SlidersHorizontal, X } from 'lucide-react';

interface ProjectFiltersProps {
  filters: {
    search: string;
    country: string;
    projectType: string;
    investmentType: string;
    status: string;
    organization: string;
    minValue: string;
    maxValue: string;
    favoritesOnly: boolean;
  };
  onFilterChange: (key: string, value: string | boolean) => void;
  onClearFilters: () => void;
  configurableFields: {
    PROJECT_TYPE?: string[];
    INVESTMENT_TYPE?: string[];
    ORGANIZATION?: string[];
  };
  isAuthenticated: boolean;
}

export function ProjectFilters({
  filters,
  onFilterChange,
  onClearFilters,
  configurableFields,
  isAuthenticated,
}: ProjectFiltersProps) {
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'search' || key === 'favoritesOnly') return false;
    return value !== '' && value !== false;
  }).length;

  const hasActiveFilters = activeFilterCount > 0 || filters.search || filters.favoritesOnly;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name..."
            value={filters.search}
            onChange={e => onFilterChange('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Checkbox
              id="favorites-only"
              checked={filters.favoritesOnly}
              onCheckedChange={(checked: boolean) =>
                onFilterChange('favoritesOnly', checked === true)
              }
            />
            <label
              htmlFor="favorites-only"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2 cursor-pointer"
            >
              <Heart className={`h-4 w-4 ${filters.favoritesOnly ? 'fill-current' : ''}`} />
              Favorites Only
            </label>
          </div>
        ) : null}
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="filters" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Advanced Filters</span>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select
                  value={filters.country || 'all'}
                  onValueChange={value => onFilterChange('country', value === 'all' ? '' : value)}
                >
                  <SelectTrigger aria-label="Country">
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All countries</SelectItem>
                    {PROJECT_COUNTRIES.map(country => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Project Type</Label>
                <Select
                  value={filters.projectType || 'all'}
                  onValueChange={value =>
                    onFilterChange('projectType', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger aria-label="Project Type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {(configurableFields.PROJECT_TYPE || []).map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Investment Type</Label>
                <Select
                  value={filters.investmentType || 'all'}
                  onValueChange={value =>
                    onFilterChange('investmentType', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger aria-label="Investment Type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {(configurableFields.INVESTMENT_TYPE || []).map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={filters.status || 'all'}
                  onValueChange={value => onFilterChange('status', value === 'all' ? '' : value)}
                >
                  <SelectTrigger aria-label="Status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {PROJECT_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Organization</Label>
                <Select
                  value={filters.organization || 'all'}
                  onValueChange={value =>
                    onFilterChange('organization', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger aria-label="Organization">
                    <SelectValue placeholder="All organizations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All organizations</SelectItem>
                    {(configurableFields.ORGANIZATION || []).map(org => (
                      <SelectItem key={org} value={org}>
                        {org}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Project Value Range (EUR)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minValue}
                    onChange={e => onFilterChange('minValue', e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxValue}
                    onChange={e => onFilterChange('maxValue', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {hasActiveFilters === true ? (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" onClick={onClearFilters} className="gap-2">
                  <X className="h-4 w-4" />
                  Clear all filters
                </Button>
              </div>
            ) : null}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {filters.favoritesOnly ? (
        <Badge variant="secondary" className="gap-2">
          <Heart className="h-3 w-3 fill-current" />
          Favorites only
        </Badge>
      ) : null}
    </div>
  );
}
