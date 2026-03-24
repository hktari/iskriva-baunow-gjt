'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { toast } from 'sonner';

const DEMO_ACCOUNTS = [
  { email: 'viewer@example.com', password: 'demo123', role: 'Viewer', description: 'Read-only access' },
  { email: 'editor@example.com', password: 'demo123', role: 'Editor', description: 'Can create and edit projects' },
  { email: 'admin@example.com', password: 'demo123', role: 'Super User', description: 'Full system access' },
];

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          toast.error('Invalid credentials');
        } else {
          toast.success('Login successful');
          router.push('/');
          router.refresh();
        }
      } catch {
        toast.error('An error occurred during login');
      }
    });
  };

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    startTransition(async () => {
      try {
        const result = await signIn('credentials', {
          email: demoEmail,
          password: demoPassword,
          redirect: false,
        });

        if (result?.error) {
          toast.error('Demo login failed');
        } else {
          toast.success('Logged in as demo user');
          await new Promise(resolve => setTimeout(resolve, 100));
          router.push('/');
          router.refresh();
        }
      } catch {
        toast.error('An error occurred during demo login');
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or use demo account
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.email}
                type="button"
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleDemoLogin(account.email, account.password)}
                disabled={isPending}
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-semibold">{account.role}</span>
                  <span className="text-xs text-muted-foreground">{account.description}</span>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
