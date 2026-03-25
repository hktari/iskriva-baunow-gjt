'use client';

import { useState, useMemo } from 'react';
import { ProjectCard } from '@/shared/components/projects/project-card';
import { ProjectFilters } from '@/shared/components/projects/project-filters';

interface ProjectsClientProps {
  projects: any[];
  configurableFields: {
    PROJECT_TYPE?: string[];
    INVESTMENT_TYPE?: string[];
    ORGANIZATION?: string[];
  };
  userId?: string;
  isAuthenticated: boolean;
}

export function ProjectsClient({
  projects,
  configurableFields,
  userId,
  isAuthenticated,
}: ProjectsClientProps) {
  const [filters, setFilters] = useState({
    search: '',
    country: '',
    projectType: '',
    investmentType: '',
    status: '',
    organization: '',
    minValue: '',
    maxValue: '',
    favoritesOnly: false,
  });

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      country: '',
      projectType: '',
      investmentType: '',
      status: '',
      organization: '',
      minValue: '',
      maxValue: '',
      favoritesOnly: false,
    });
  };

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      if (filters.search && !project.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      if (filters.country && project.country !== filters.country) {
        return false;
      }

      if (filters.projectType && project.projectType !== filters.projectType) {
        return false;
      }

      if (filters.investmentType && project.investmentType !== filters.investmentType) {
        return false;
      }

      if (filters.status && project.status !== filters.status) {
        return false;
      }

      if (filters.organization && project.organization !== filters.organization) {
        return false;
      }

      if (filters.minValue && project.projectValue < parseFloat(filters.minValue)) {
        return false;
      }

      if (filters.maxValue && project.projectValue > parseFloat(filters.maxValue)) {
        return false;
      }

      if (filters.favoritesOnly && (!project.favorites || project.favorites.length === 0)) {
        return false;
      }

      return true;
    });
  }, [projects, filters]);

  return (
    <div className="space-y-6">
      <ProjectFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        configurableFields={configurableFields}
        isAuthenticated={isAuthenticated}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredProjects.length} of {projects.length} projects
        </p>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-muted-foreground mb-2">
            No projects found matching your filters
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your search criteria or clearing filters
          </p>
          {filters.search ||
          Object.entries(filters).some(
            ([k, v]) => k !== 'search' && k !== 'favoritesOnly' && v !== '' && v !== false
          ) ? (
            <button onClick={handleClearFilters} className="text-sm text-primary hover:underline">
              Clear all filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} userId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}
