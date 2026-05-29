'use client';

import { inviteUser } from '@/server/actions/invitations';
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
import { UserRole } from '@prisma/enums';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface InviteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (user: { id: string; email: string; name: string; role: UserRole }) => void;
}

export function InviteUserDialog({ open, onOpenChange, onSuccess }: InviteUserDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: UserRole.VIEWER as UserRole,
  });
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
        // Pass the new user data to parent for state update
        onSuccess({
          id: result.userId,
          email: formData.email,
          name: formData.name,
          role: formData.role,
        });
      } else {
        toast.error('Failed to invite user');
      }
    });
  };

  const handleClose = () => {
    setFormData({ email: '', name: '', role: UserRole.VIEWER });
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
        return 'Email delivery is disabled in this environment. The user account has been created.';
    }
  }, [emailStatus]);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
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
                  value={formData.role}
                  onValueChange={value => setFormData({ ...formData, role: value as UserRole })}
                >
                  <SelectTrigger id="role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.VIEWER}>Viewer</SelectItem>
                    <SelectItem value={UserRole.EDITOR}>Editor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md bg-muted p-4 text-sm space-y-2">
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
    </>
  );
}
