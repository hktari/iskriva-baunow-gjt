import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

// Mock the favorite button to avoid next-auth import issues
vi.mock('./favorite-button', () => ({
  FavoriteButton: () => <button>Favorite</button>,
}));

import { ProjectCard } from './project-card';

const mockProject = {
  id: 'proj-1',
  name: 'Test Project',
  country: 'Germany',
  organization: 'Test Org',
  projectType: 'Research',
  status: 'IN_PROGRESS',
  description: 'A test project description',
  projectValue: 1000000,
  investmentCosts: 500000,
  investmentType: 'Grant',
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31'),
  kpis: [
    {
      id: 'kpi-1',
      indicatorName: 'Beneficiaries',
      targetValue: 1000,
      valueAchieved: 500,
      unit: 'people',
      decimals: false,
      thousandSeparators: true,
      isPrimary: true,
    },
  ],
  favorites: [],
};

describe('ProjectCard', () => {
  it('renders project name and country', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByText('Germany')).toBeInTheDocument();
  });

  it('renders organization when present', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Test Org')).toBeInTheDocument();
  });

  it('renders view details link', () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', '/project/proj-1');
  });

  it('renders primary KPI section', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText(/primary kpi:/i)).toBeInTheDocument();
    expect(screen.getByText(/Beneficiaries/)).toBeInTheDocument();
  });

  it('shows no primary KPI message when kpis empty', () => {
    const projectNoKpi = { ...mockProject, kpis: [] };
    render(<ProjectCard project={projectNoKpi} />);
    expect(screen.getByText(/no primary kpi selected/i)).toBeInTheDocument();
  });

  it('shows favorite button when userId provided', () => {
    render(<ProjectCard project={mockProject} userId="user-1" />);
    expect(screen.getByRole('button', { name: /favorite/i })).toBeInTheDocument();
  });

  it('renders project type', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('Research')).toBeInTheDocument();
  });

  it('renders status badge', () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });
});
