'use client';

import { resendInvitation } from '@/server/actions/invitations';
import { deleteUser, updateUserStatus } from '@/server/actions/users';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { Input } from '@/shared/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useDebouncedCallback } from '@/shared/hooks/use-debounced-callback';
import { UserRole, UserStatus } from '@prisma/client';
import { Mail, MoreHorizontal, RefreshCw, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InviteUserDialog } from './invite-user-dialog';
import { UserFormDialog } from './user-form-dialog';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organization: string | null;
  status: UserStatus;
  invitedAt: Date;
  createdAt: Date;
  _count: {
    projects: number;
    favorites: number;
  };
}

const normalizeUserForList = (
  user: Partial<User> & Pick<User, 'id' | 'email' | 'name' | 'role'>
) => {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    organization: user.organization ?? null,
    status: user.status ?? UserStatus.ACTIVE,
    invitedAt: user.invitedAt ?? new Date(),
    createdAt: user.createdAt ?? new Date(),
    _count: user._count ?? {
      projects: 0,
      favorites: 0,
    },
  } satisfies User;
};

interface UsersClientProps {
  users: User[];
}

export function UsersClient({ users: initialUsers }: UsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(initialUsers);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [resendingUserId, setResendingUserId] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(
    useCallback(
      (searchValue: string) => {
        const filtered = users.filter(
          user =>
            user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
            user.email.toLowerCase().includes(searchValue.toLowerCase()) ||
            user.organization?.toLowerCase().includes(searchValue.toLowerCase())
        );
        setFilteredUsers(filtered);
      },
      [users]
    ),
    300
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSearch(value);
  };

  // Update filtered users when users data changes
  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  const handleDelete = async (id: string) => {
    const result = await deleteUser(id);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u.id !== id));
    }
    setDeletingUserId(null);
  };

  const handleStatusChange = async (id: string, status: UserStatus) => {
    const result = await updateUserStatus(id, status);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('User status updated');
      setUsers(users.map(u => (u.id === id ? { ...u, status } : u)));
    }
  };

  const handleResendInvitation = async (id: string) => {
    setResendingUserId(id);

    try {
      const result = await resendInvitation(id);

      if ('error' in result) {
        toast.error(result.error);
      } else if ('success' in result && result.success) {
        toast.success(result.message || 'Invitation resent successfully');

        // In demo environment, show the new credentials
        if (result.demoCredentials) {
          // You could show a dialog with the new credentials here
          // For now, just log them (in production, this would be handled differently)
          console.warn('New demo credentials:', result.demoCredentials);
        }
      } else {
        toast.error('Failed to resend invitation');
      }
    } catch (error) {
      toast.error('An unexpected error occurred while resending invitation');
      console.error('Resend invitation error:', error);
    } finally {
      setResendingUserId(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'SUPER_USER':
        return 'destructive';
      case 'EDITOR':
        return 'default';
      case 'VIEWER':
        return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: UserStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'default';
      case 'PENDING':
        return 'secondary';
      case 'INACTIVE':
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => setIsInviteOpen(true)}>
          <Mail className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.organization || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(user.status)}>{user.status}</Badge>
                  </TableCell>
                  <TableCell>{user._count.projects}</TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setEditingUser(user)}>
                          Edit User
                        </DropdownMenuItem>
                        {user.status === UserStatus.PENDING && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleResendInvitation(user.id)}
                              disabled={resendingUserId === user.id}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              {resendingUserId === user.id ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  Resending...
                                </>
                              ) : (
                                'Resend Invitation'
                              )}
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(user.id, UserStatus.ACTIVE)}
                        >
                          Set Active
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(user.id, UserStatus.INACTIVE)}
                        >
                          Set Inactive
                        </DropdownMenuItem>
                        {user.role !== 'SUPER_USER' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingUserId(user.id)}
                              className="text-destructive"
                            >
                              Delete User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingUser ? (
        <UserFormDialog
          open={!!editingUser}
          onOpenChange={(open: boolean) => !open && setEditingUser(null)}
          user={editingUser}
          onSuccess={(updatedUser: User) => {
            setUsers(users.map(u => (u.id === updatedUser.id ? updatedUser : u)));
            setEditingUser(null);
          }}
        />
      ) : null}

      <InviteUserDialog
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
        onSuccess={newUser => {
          setUsers([normalizeUserForList(newUser), ...users]);
          setIsInviteOpen(false);
        }}
      />

      <AlertDialog open={!!deletingUserId} onOpenChange={() => setDeletingUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user account and remove
              all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUserId && handleDelete(deletingUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
