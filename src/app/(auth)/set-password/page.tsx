import { Metadata } from 'next';
import { SetPasswordForm } from './set-password-form';

export const metadata: Metadata = {
  title: 'Set Password | Baunow GJT',
  description: 'Set your password to access the Baunow GJT Platform',
};

export default function SetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Baunow GJT</h1>
        </div>

        <SetPasswordForm token={token} />
      </div>
    </div>
  );
}
