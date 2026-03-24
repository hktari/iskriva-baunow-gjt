import { auth } from '@/server/auth';
import { AppHeader } from '@/shared/components/layout/app-header';
import { AppFooter } from '@/shared/components/layout/app-footer';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader user={session.user} />
      <main className="flex-1">{children}</main>
      <AppFooter />
    </div>
  );
}
