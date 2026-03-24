import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before imports
vi.mock('@/server/actions/kpis', () => ({
  updateKpi: vi.fn(),
  deleteKpi: vi.fn(),
  setPrimaryKpi: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { updateKpi, deleteKpi, setPrimaryKpi } from '@/server/actions/kpis';
import { KpiCard } from './kpi-card';

const _mockUpdateKpi = updateKpi as ReturnType<typeof vi.fn>;
const mockDeleteKpi = deleteKpi as ReturnType<typeof vi.fn>;
const mockSetPrimaryKpi = setPrimaryKpi as ReturnType<typeof vi.fn>;

const mockKpi = {
  id: 'kpi-1',
  indicatorName: 'Beneficiaries',
  targetValue: 1000,
  valueAchieved: 750,
  unit: 'people',
  decimals: false,
  thousandSeparators: true,
  isPrimary: true,
  updated: null,
};

describe('KpiCard', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders KPI information', () => {
    render(<KpiCard kpi={mockKpi} projectId="proj-1" canEdit={false} isAuthenticated={false} />);
    expect(screen.getByText('Beneficiaries')).toBeInTheDocument();
  });

  it('displays progress percentage', () => {
    render(<KpiCard kpi={mockKpi} projectId="proj-1" canEdit={false} isAuthenticated={false} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows primary KPI indicator when authenticated', () => {
    render(<KpiCard kpi={mockKpi} projectId="proj-1" canEdit={false} isAuthenticated={true} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('hides primary KPI indicator when not authenticated', () => {
    render(<KpiCard kpi={mockKpi} projectId="proj-1" canEdit={false} isAuthenticated={false} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows edit and delete buttons when canEdit is true', () => {
    render(<KpiCard kpi={mockKpi} projectId="proj-1" canEdit={true} isAuthenticated={false} />);
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('calls deleteKpi when delete confirmed', async () => {
    mockDeleteKpi.mockResolvedValue({ success: true });
    window.confirm = vi.fn(() => true);
    render(<KpiCard kpi={mockKpi} projectId="proj-1" canEdit={true} isAuthenticated={false} />);
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[buttons.length - 1]); // Last button is delete
    expect(mockDeleteKpi).toHaveBeenCalled();
  });

  it('calls setPrimaryKpi when star clicked', async () => {
    mockSetPrimaryKpi.mockResolvedValue({ success: true, isPrimary: true });
    render(<KpiCard kpi={mockKpi} projectId="proj-1" canEdit={false} isAuthenticated={true} />);
    await user.click(screen.getByRole('button'));
    expect(mockSetPrimaryKpi).toHaveBeenCalledWith('kpi-1', 'proj-1');
  });
});
