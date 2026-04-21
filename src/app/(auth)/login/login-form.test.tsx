import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './login-form';

const { mockPush, mockRefresh, mockSignIn, mockToastError, mockToastSuccess } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockRefresh: vi.fn(),
  mockSignIn: vi.fn(),
  mockToastError: vi.fn(),
  mockToastSuccess: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  signIn: mockSignIn,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: mockToastError,
    success: mockToastSuccess,
  },
}));

describe('LoginForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email and password inputs', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls signIn with credentials on submit', async () => {
    mockSignIn.mockResolvedValue({ error: undefined });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });
  });

  it('shows error toast on failed login', async () => {
    mockSignIn.mockResolvedValue({ error: 'Invalid credentials' });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Invalid credentials');
    });
  });

  it('shows success toast and redirects on successful login', async () => {
    mockSignIn.mockResolvedValue({ error: undefined });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Login successful');
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('disables inputs while pending', async () => {
    mockSignIn.mockImplementation(() => new Promise(() => {}));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });
  });
});
