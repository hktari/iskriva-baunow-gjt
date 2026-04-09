import { auth } from '@/server/auth';
import { redirect } from 'next/navigation';
import { ChangePasswordForm } from './change-password-form';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base">{session.user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-base">{session.user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p className="text-base capitalize">
                  {session.user.role.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
