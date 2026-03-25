import { auth } from '@/server/auth';
import { getConfigurableFields } from '@/server/queries/projects';
import { ProjectForm } from '@/shared/components/projects/project-form';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';

export default async function NewProjectPage() {
  const session = await auth();
  const canEdit = session && session.user.role !== 'VIEWER';

  if (!canEdit) {
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

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {!session
                ? 'Please log in with an Editor or Super User account to create new projects.'
                : 'Your account does not have permission to create projects. Please contact an administrator.'}
            </p>
            {!session && (
              <Button asChild>
                <Link href="/login">Log In</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    );
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

      <ProjectForm configurableFields={configurableFields} isAuthenticated />
    </main>
  );
}
