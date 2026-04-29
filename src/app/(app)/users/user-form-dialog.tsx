'use client';

import { UserRole, UserStatus } from '@/generated/prisma/client';
import { createUser, updateUser } from '@/server/actions/users';
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
import { useEffect, useState, useTransition } from 'react';
import { toast } from 'sonner';

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
  onSuccess: (user: any) => void;
}

export function UserFormDialog({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    email: user?.email || '',
    name: user?.name || '',
    password: '',
    role: user?.role || UserRole.VIEWER,
    organization: user?.organization || '',
    status: user?.status || UserStatus.ACTIVE,
  });

  // Sync form data when user prop changes
  useEffect(() => {
    setFormData({
      email: user?.email || '',
      name: user?.name || '',
      password: '',
      role: user?.role || UserRole.VIEWER,
      organization: user?.organization || '',
      status: user?.status || UserStatus.ACTIVE,
    });
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      const result = user ? await updateUser(user.id, formData) : await createUser(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(user ? 'User updated successfully' : 'User created successfully');
        onSuccess({ ...user, ...formData, id: result.userId || user?.id });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{user ? 'Edit User' : 'Create User'}</DialogTitle>
            <DialogDescription>
              {user ? 'Update user information and permissions' : 'Add a new user to the system'}
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
                disabled={!!user}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">
                Password {user ? '(leave blank to keep current)' : null}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required={!user}
                minLength={8}
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
                  <SelectItem value={UserRole.SUPER_USER}>Super User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="organization">Organization (Optional)</Label>
              <Input
                id="organization"
                value={formData.organization}
                onChange={e => setFormData({ ...formData, organization: e.target.value })}
              />
            </div>

            {user ? (
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={value => setFormData({ ...formData, status: value as UserStatus })}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserStatus.ACTIVE}>Active</SelectItem>
                    <SelectItem value={UserStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={UserStatus.INACTIVE}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : user ? 'Update User' : 'Create User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
