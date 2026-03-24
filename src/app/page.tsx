import Link from 'next/link';
import { Sparkles, Target, Globe, BarChart3, Plus } from 'lucide-react';
import { auth } from '@/server/auth';
import { getProjects, getConfigurableFields } from '@/server/queries/projects';
import { Button } from '@/shared/components/ui/button';
import { ProjectsClient } from './(app)/projects-client';

export default async function HomePage() {
  const session = await auth();
  const userId = session?.user?.id;
  const canEdit = session?.user?.role === 'EDITOR' || session?.user?.role === 'SUPER_USER';

  const [projects, configurableFields] = await Promise.all([
    getProjects({ userId }),
    getConfigurableFields(),
  ]);

  return (
    <main className="container mx-auto px-4 py-8 space-y-8">
      <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            EU Project Manager
          </h1>
          <p className="text-lg md:text-xl mb-6 text-blue-50">
            European Project Analytics Platform
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Target className="h-4 w-4" />
              <span className="text-sm">KPI tracking & target monitoring</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm">Multi-country portfolio management</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Environmental impact indicators</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-sm">Organisation-level analytics</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Projects</h2>
        {canEdit && (
          <Button asChild>
            <Link href="/project/new">
              <Plus className="h-4 w-4 mr-2" />
              Add New Project
            </Link>
          </Button>
        )}
      </div>

      <ProjectsClient
        projects={projects}
        configurableFields={configurableFields}
        userId={userId}
        isAuthenticated={!!session}
      />
    </main>
  );
}
