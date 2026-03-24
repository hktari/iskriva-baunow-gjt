import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star } from 'lucide-react';
import { auth } from '@/server/auth';
import { getProject, getConfigurableFields } from '@/server/queries/projects';
import { Button } from '@/shared/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { FavoriteButton } from '@/shared/components/projects/favorite-button';
import { KpiCard } from '@/shared/components/projects/kpi-card';
import { AddKpiDialog } from '@/shared/components/projects/add-kpi-dialog';
import { ProjectDetailView } from './project-detail-view';
import { getStatusLabel, getStatusColor } from '@/shared/lib/formatters';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const canEdit = session?.user?.role === 'EDITOR' || session?.user?.role === 'SUPER_USER';

  const [project, configurableFields] = await Promise.all([
    getProject(params.id, userId),
    getConfigurableFields(),
  ]);

  if (!project) {
    notFound();
  }

  const isFavorite = userId && project.favorites && project.favorites.length > 0;

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground mt-1">
                {project.country}
                {project.organization && ` • ${project.organization}`}
                {` • ${project.projectType}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {userId && <FavoriteButton projectId={project.id} isFavorite={!!isFavorite} />}
              <Badge variant={getStatusColor(project.status) as any}>
                {getStatusLabel(project.status)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">
            KPIs ({project.kpis.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectDetailView
            project={project}
            configurableFields={configurableFields}
            canEdit={canEdit}
            isAuthenticated={!!session}
          />
        </TabsContent>

        <TabsContent value="kpis" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Key Performance Indicators</h2>
              {session && (
                <p className="text-sm text-muted-foreground mt-1">
                  <Star className="inline h-3 w-3 mr-1" />
                  Click the star to set a KPI as primary
                </p>
              )}
            </div>
            {canEdit && (
              <AddKpiDialog
                projectId={project.id}
                configurableFields={configurableFields}
              />
            )}
          </div>

          {project.kpis.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-lg font-medium text-muted-foreground mb-2">
                  No KPIs added yet
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start tracking project performance by adding your first KPI
                </p>
                {canEdit && (
                  <AddKpiDialog
                    projectId={project.id}
                    configurableFields={configurableFields}
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {project.kpis.map((kpi: any) => (
                <KpiCard
                  key={kpi.id}
                  kpi={kpi}
                  projectId={project.id}
                  canEdit={canEdit}
                  isAuthenticated={!!session}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </main>
  );
}
