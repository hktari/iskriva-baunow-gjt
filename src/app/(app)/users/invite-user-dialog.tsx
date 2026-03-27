'use client';

import { inviteUser } from '@/server/actions/invitations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { UserRole } from '@prisma/client';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: UserRole.VIEWER as UserRole,
  });
  const [demoCredentials, setDemoCredentials] = useState<{
    email: string;
    tempPassword: string;
  } | null>(null);
  const [emailStatus, setEmailStatus] = useState<'sent' | 'failed' | 'skipped' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = await inviteUser(formData.email, formData.name, formData.role);

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      if ('success' in result && result.success) {
        toast.success(result.message || 'User invited successfully');
        setEmailStatus(result.emailStatus);
        setDemoCredentials(result.demoCredentials || null);
        onSuccess();
      } else {
        toast.error('Failed to invite user');
      }
    });
  };

  const handleClose = () => {
    setFormData({ email: '', name: '', role: UserRole.VIEWER });
    setDemoCredentials(null);
    setEmailStatus(null);
    onOpenChange(false);
  };

  const emailStatusLabel = useMemo(() => {
    if (!emailStatus) return null;
    switch (emailStatus) {
      case 'sent':
        return 'An invitation email was sent via Resend.';
      case 'failed':
        return 'The user was created, but the email could not be delivered automatically.';
      case 'skipped':
        return 'Email delivery is disabled in this environment. Share the credentials manually.';
    }
  }, [emailStatus]);

  return (
    <>
      <Dialog open={open ? !demoCredentials : undefined} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Invite User</DialogTitle>
              <DialogDescription>
                Send an invitation to a new user to join the system
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role as string}
                  onValueChange={value => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
                    <SelectItem value={UserRole.EDITOR}>Editor</SelectItem>
                    <SelectItem value={UserRole.SUPER_USER}>Super User</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md bg-muted p-4 text-sm space-y-2">
                <p className="font-medium">Delivery</p>
                <p className="text-muted-foreground">
                  Invitations send an email via Resend in production environments. In local/demo
                  environments, credentials will be shown after sending.
                </p>
                {emailStatusLabel ? (
                  <p className="text-sm text-foreground">{emailStatusLabel}</p>
                ) : null}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!demoCredentials} onOpenChange={() => setDemoCredentials(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invitation Sent Successfully</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>
                  The user has been invited. Share the temporary credentials below. In production,
                  this dialog is hidden because the user receives an email directly.
                </p>
                <div className="rounded-md bg-muted p-4">
                  <p className="font-medium mb-2">Demo Information:</p>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Email:</span>{' '}
                      <code className="bg-background px-1 py-0.5 rounded">
                        {demoCredentials?.email}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium">Temporary Password:</span>{' '}
                      <code className="bg-background px-1 py-0.5 rounded">
                        {demoCredentials?.tempPassword}
                      </code>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    The user should change this password on first login.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClose}>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
