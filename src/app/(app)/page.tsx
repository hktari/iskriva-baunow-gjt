import { auth } from '@/server/auth';
import {
  getConfigurableFields,
  getProjects,
  type ProjectFilters as ProjectFilterParams,
} from '@/server/queries/projects';
import {
  CollapsibleBanner,
  CollapsibleBannerTrigger,
} from '@/shared/components/layout/collapsible-banner';
import { ProjectCard } from '@/shared/components/projects/project-card';
import { ProjectListClient } from '@/shared/components/projects/project-list-client';
import { Button } from '@/shared/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface HomePageProps {
  searchParams: Promise<{
    search?: string;
    country?: string;
    projectType?: string;
    investmentType?: string;
    status?: string;
    organization?: string;
    minValue?: string;
    maxValue?: string;
    favoritesOnly?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const canEdit = session?.user?.role === 'EDITOR' || session?.user?.role === 'SUPER_USER';

  const params = await searchParams;
  const filters: ProjectFilterParams = {
    search: params.search,
    country: params.country,
    projectType: params.projectType,
    investmentType: params.investmentType,
    status: params.status,
    organization: params.organization,
    minValue: params.minValue ? parseInt(params.minValue) : undefined,
    maxValue: params.maxValue ? parseInt(params.maxValue) : undefined,
    favoritesOnly: params.favoritesOnly === 'true',
    userId,
  };

  const [projects, configurableFields] = await Promise.all([
    getProjects(filters),
    getConfigurableFields(),
  ]);

  const hasActiveFilters = Object.values(filters).some(
    v => v !== undefined && v !== '' && v !== false
  );

  return (
    <main className="container mx-auto px-4 py-8 space-y-6 relative">
      <CollapsibleBanner />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} found
          </p>
        </div>
        <div className="flex items-center gap-4">
          <CollapsibleBannerTrigger />
          {canEdit ? (
            <Button asChild>
              <Link href="/project/new">
                <Plus className="h-4 w-4 mr-2" />
                Add New Project
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <ProjectListClient configurableFields={configurableFields} isAuthenticated={!!session} />

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            {hasActiveFilters ? 'No projects match your filters' : 'No projects yet'}
          </p>
          {canEdit && !hasActiveFilters ? (
            <Button asChild className="mt-4">
              <Link href="/project/new">Create your first project</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} userId={userId} canEdit={canEdit} />
          ))}
        </div>
      )}
    </main>
  );
}
