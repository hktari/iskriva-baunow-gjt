'use client';

import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { setPasswordWithToken, validatePasswordResetToken } from '@/server/actions/invitations';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface SetPasswordFormProps {
  token: string | undefined;
}

export function SetPasswordForm({ token }: SetPasswordFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setIsValidating(false);
      setError('No invitation token provided. Please check your email link.');
      return;
    }

    // Validate token on load
    startTransition(async () => {
      try {
        const result = await validatePasswordResetToken(token);
        if (result.valid) {
          setIsValid(true);
          setUserEmail(result.email || '');
        } else {
          setError(result.error || 'Invalid invitation link');
        }
      } catch {
        setError('Failed to validate invitation. Please try again or contact support.');
      } finally {
        setIsValidating(false);
      }
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Please enter and confirm your password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (!token) {
      toast.error('Invalid token');
      return;
    }

    startTransition(async () => {
      try {
        const result = await setPasswordWithToken(token, password);

        if (result.error) {
          toast.error(result.error);
        } else if (result.success) {
          toast.success(result.message);

          // Auto-login after successful password set
          const loginResult = await signIn('credentials', {
            email: userEmail,
            password,
            redirect: false,
          });

          if (loginResult?.error) {
            // If auto-login fails, redirect to login page
            toast.info('Please log in with your new password');
            router.push('/login');
          } else {
            toast.success('Welcome! Redirecting to dashboard...');
            router.push('/');
            router.refresh();
          }
        }
      } catch {
        toast.error('An error occurred while setting your password');
      }
    });
  };

  if (isValidating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Validating Invitation</CardTitle>
          <CardDescription>Please wait while we verify your invitation link...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error || !isValid) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid Invitation</CardTitle>
          <CardDescription>We could not verify your invitation link.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700 text-sm">
              {error || 'The invitation link is invalid or has expired.'}
            </p>
          </div>
          <Button onClick={() => router.push('/login')} className="w-full">
            Go to Login
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Set Your Password</CardTitle>
        <CardDescription>
          Welcome! Create a password to complete your account setup.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={userEmail} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isPending}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              disabled={isPending}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Setting password...' : 'Set Password & Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
