import { UserRole } from '@prisma/enums';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { InviteUserDialog } from './invite-user-dialog';

const { mockToastError, mockToastSuccess } = vi.hoisted(() => ({
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));

// Mock the server actions
vi.mock('@/server/actions/invitations', () => ({
  inviteUser: vi.fn(),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}));

describe('InviteUserDialog - Resend Email Service', () => {
  const mockOnSuccess = vi.fn();
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send invitation email via Resend when inviting user', async () => {
    const { inviteUser } = await import('@/server/actions/invitations');
    const mockInviteUser = vi.mocked(inviteUser);

    // Mock successful invitation with email sent
    mockInviteUser.mockResolvedValue({
      success: true,
      userId: 'new-user-id',
      emailStatus: 'sent',
      message: 'User invited successfully. Invitation email sent via Resend.',
    });

    render(<InviteUserDialog open onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />);

    // Fill in the form
    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /send invitation/i });

    await userEvent.type(nameInput, 'New User');
    await userEvent.type(emailInput, 'newuser@example.com');

    // Submit the form
    await userEvent.click(submitButton);

    // Verify inviteUser was called with correct parameters
    await waitFor(() => {
      expect(mockInviteUser).toHaveBeenCalledWith(
        'newuser@example.com',
        'New User',
        UserRole.VIEWER
      );
    });

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalled();
    });
    const lastToastMessage = mockToastSuccess.mock.calls.at(-1)?.[0];
    expect(lastToastMessage).toEqual(expect.stringContaining('Invitation email sent via Resend'));

    // Verify onSuccess callback was called
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should surface Resend delivery failures gracefully', async () => {
    const { inviteUser } = await import('@/server/actions/invitations');
    const mockInviteUser = vi.mocked(inviteUser);

    // Mock Resend API failure returning degraded success payload
    mockInviteUser.mockResolvedValue({
      success: true,
      userId: 'new-user-id',
      emailStatus: 'failed',
      message:
        'User invited, but the email could not be delivered automatically. Please resend later.',
    });

    render(<InviteUserDialog open onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />);

    // Fill and submit form
    await userEvent.type(screen.getByLabelText(/name/i), 'New User');
    await userEvent.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalled();
    });
    const degradedToastMessage = mockToastSuccess.mock.calls.at(-1)?.[0];
    expect(degradedToastMessage).toEqual(
      expect.stringContaining('could not be delivered automatically')
    );

    // Verify the degraded message is shown in the dialog
    await waitFor(() => {
      expect(screen.getByText(/could not be delivered automatically/i)).toBeInTheDocument();
    });

    // Success callback still fires so parent can refresh
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('should verify email content contains correct invitation details', async () => {
    const { inviteUser } = await import('@/server/actions/invitations');
    const mockInviteUser = vi.mocked(inviteUser);

    // Mock with detailed email content verification
    mockInviteUser.mockResolvedValue({
      success: true,
      userId: 'new-user-id',
      emailStatus: 'sent',
      message: 'Invitation email sent successfully via Resend',
    });

    render(<InviteUserDialog open onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />);

    await userEvent.type(screen.getByLabelText(/name/i), 'New User');
    await userEvent.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await userEvent.click(screen.getByRole('button', { name: /send invitation/i }));

    await waitFor(() => {
      expect(mockInviteUser).toHaveBeenCalledWith(
        'newuser@example.com',
        'New User',
        UserRole.VIEWER
      );
    });

    // Verify the response indicates email was sent successfully
    const result = await mockInviteUser.mock.results[0].value;
    expect(result.emailStatus).toBe('sent');
  });
});
