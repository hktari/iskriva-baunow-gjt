import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/server/auth';
import { getConfigurableFields } from '@/server/queries/projects';
import { Button } from '@/shared/components/ui/button';
import { ProjectForm } from '@/shared/components/projects/project-form';

export default async function NewProjectPage() {
  const session = await auth();

  if (!session || session.user.role === 'VIEWER') {
    redirect('/');
  }

  const configurableFields = await getConfigurableFields();

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Create New Project</h1>
      </div>

      <ProjectForm
        configurableFields={configurableFields}
        isAuthenticated={true}
      />
    </main>
  );
}
