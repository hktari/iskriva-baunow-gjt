import { UserRole, UserStatus } from '@prisma/client';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { UserFormDialog } from './user-form-dialog';

// Mock the server actions
vi.mock('@/server/actions/users', () => ({
  updateUser: vi.fn(),
  createUser: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('UserFormDialog - Edit User Bug', () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show correct user data when editing different users', async () => {
    const user1 = {
      id: 'user-1',
      email: 'user1@example.com',
      name: 'User One',
      role: UserRole.VIEWER,
      organization: 'Org One',
      status: UserStatus.ACTIVE,
    };

    const user2 = {
      id: 'user-2',
      email: 'user2@example.com',
      name: 'User Two',
      role: UserRole.EDITOR,
      organization: 'Org Two',
      status: UserStatus.PENDING,
    };

    const { rerender } = render(
      <UserFormDialog
        open
        onOpenChange={mockOnOpenChange}
        user={user1}
        onSuccess={mockOnSuccess}
      />
    );

    // Verify first user's data is loaded
    expect(screen.getByDisplayValue('User One')).toBeInTheDocument();
    expect(screen.getByDisplayValue('user1@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Org One')).toBeInTheDocument();

    // Close dialog (simulate user closing)
    rerender(
      <UserFormDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        user={user1}
        onSuccess={mockOnSuccess}
      />
    );

    // Open dialog with different user
    rerender(
      <UserFormDialog
        open
        onOpenChange={mockOnOpenChange}
        user={user2}
        onSuccess={mockOnSuccess}
      />
    );

    // This should show user2's data but currently shows user1's data or empty
    // This test will fail before the fix
    await waitFor(() => {
      expect(screen.getByDisplayValue('User Two')).toBeInTheDocument();
    });
    expect(screen.getByDisplayValue('user2@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Org Two')).toBeInTheDocument();
  });
});
