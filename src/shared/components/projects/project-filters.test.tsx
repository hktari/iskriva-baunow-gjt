import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectFilters } from './project-filters';

const mockFilters = {
  search: '',
  country: '',
  projectType: '',
  investmentType: '',
  status: '',
  organization: '',
  minValue: '',
  maxValue: '',
  favoritesOnly: false,
};

const mockOnFilterChange = vi.fn();
const mockOnClearFilters = vi.fn();

const defaultProps = {
  filters: mockFilters,
  onFilterChange: mockOnFilterChange,
  onClearFilters: mockOnClearFilters,
  configurableFields: {
    PROJECT_TYPE: ['Research', 'Development'],
    INVESTMENT_TYPE: ['Grant', 'Loan'],
    ORGANIZATION: ['Org A', 'Org B'],
  },
  isAuthenticated: true,
};

describe('ProjectFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(<ProjectFilters {...defaultProps} />);
    expect(screen.getByPlaceholderText(/search projects/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when search changes', async () => {
    const user = userEvent.setup();
    render(<ProjectFilters {...defaultProps} />);
    const searchInput = screen.getByPlaceholderText(/search projects/i);
    await user.type(searchInput, 'test');
    expect(mockOnFilterChange).toHaveBeenCalled();
  });

  it('shows favorites checkbox when authenticated', () => {
    render(<ProjectFilters {...defaultProps} />);
    expect(screen.getByRole('checkbox', { name: /favorites only/i })).toBeInTheDocument();
  });

  it('hides favorites checkbox when not authenticated', () => {
    render(<ProjectFilters {...defaultProps} isAuthenticated={false} />);
    expect(screen.queryByRole('checkbox', { name: /favorites only/i })).not.toBeInTheDocument();
  });

  it('renders advanced filters accordion', () => {
    render(<ProjectFilters {...defaultProps} />);
    expect(screen.getByText(/advanced filters/i)).toBeInTheDocument();
  });

  it('displays current filter values', () => {
    const filtersWithValues = {
      ...mockFilters,
      search: 'existing search',
      country: 'Germany',
    };

    render(<ProjectFilters {...defaultProps} filters={filtersWithValues} />);

    const searchInput = screen.getByPlaceholderText(/search projects/i);
    expect(searchInput).toHaveValue('existing search');
  });
});
