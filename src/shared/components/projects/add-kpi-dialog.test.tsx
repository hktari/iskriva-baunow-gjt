import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before imports
vi.mock('@/server/actions/kpis', () => ({
  createKpi: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

import { createKpi } from '@/server/actions/kpis';
import { AddKpiDialog } from './add-kpi-dialog';

const mockCreateKpi = createKpi as ReturnType<typeof vi.fn>;

const mockConfigurableFields = {
  KPI_UNIT: ['people', 'projects', 'EUR'],
};

describe('AddKpiDialog', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders add KPI button', () => {
    render(<AddKpiDialog projectId="project-id" configurableFields={mockConfigurableFields} />);
    expect(screen.getByRole('button', { name: /add kpi/i })).toBeInTheDocument();
  });

  it('opens dialog when button clicked', async () => {
    render(<AddKpiDialog projectId="project-id" configurableFields={mockConfigurableFields} />);
    await user.click(screen.getByRole('button', { name: /add kpi/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('calls createKpi on form submit', async () => {
    mockCreateKpi.mockResolvedValue({ success: true, kpiId: 'new-kpi-id' });
    render(<AddKpiDialog projectId="project-id" configurableFields={mockConfigurableFields} />);
    await user.click(screen.getByRole('button', { name: /add kpi/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
