export const PROJECT_COUNTRIES = [
  'Albania',
  'Andorra',
  'Armenia',
  'Austria',
  'Azerbaijan',
  'Belarus',
  'Belgium',
  'Bosnia and Herzegovina',
  'Bulgaria',
  'Croatia',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Estonia',
  'Finland',
  'France',
  'Georgia',
  'Germany',
  'Greece',
  'Hungary',
  'Iceland',
  'Ireland',
  'Italy',
  'Kazakhstan',
  'Latvia',
  'Liechtenstein',
  'Lithuania',
  'Luxembourg',
  'Malta',
  'Moldova',
  'Monaco',
  'Montenegro',
  'Netherlands',
  'North Macedonia',
  'Norway',
  'Poland',
  'Portugal',
  'Romania',
  'Russia',
  'San Marino',
  'Serbia',
  'Slovakia',
  'Slovenia',
  'Spain',
  'Sweden',
  'Switzerland',
  'Turkey',
  'Ukraine',
  'United Kingdom',
  'Vatican City',
] as const;

export const PROJECT_STATUSES = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' },
] as const;

export const PROGRAMS = ['Interreg', 'Horizon', 'LIFE', 'Nacionalni', 'Regionalni'] as const;

export const TARGET_GROUPS = [
  'Municipalities',
  'SMEs',
  'Citizens',
  'Public authorities',
  'Industry',
] as const;

export const IMPACT_AREAS = [
  'Decarbonisation',
  'Energy transition',
  'Smart Energy (Energy systems)',
  'Climate adaptation',
  'Just transition',
] as const;

export const KPI_INDICATORS = [
  'Amount of subsidies',
  'Financial savings per year',
  'Renewable energy produced per year',
  'Energy saved per year',
  'Percentage energy saved per year',
  'CO2eq reduction per year',
  'Percentage CO2eq reduction per year',
  'Number of educated persons',
  'Number of beneficiaries',
  'Number of jobs created',
  'Restored or Protected natural area',
  'Reduction in energy consumption',
  'Infrastructure length (km)',
  'Water saved per year',
  'Waste reduction per year',
  'Fulfilment of contractual obligations',
  'Timeliness of project implementation',
  'Sustainability of project results',
  'Financial implementation rate',
  'Number of organizations included',
  'Population reach',
  'Number of adopted solutions',
] as const;

export const KPI_INDICATOR_METADATA: Record<
  string,
  { formula?: string; target?: string; description?: string }
> = {
  'Fulfilment of contractual obligations': {
    formula: '(Completed milestones / Total milestones) × 100',
    target: '≥ 95%',
    description: 'Measures the percentage of contractual obligations met on time',
  },
  'Timeliness of project implementation': {
    formula: '(On-time deliverables / Total deliverables) × 100',
    target: '≥ 90%',
    description: 'Tracks adherence to project timeline and delivery schedules',
  },
  'Sustainability of project results': {
    formula: 'Qualitative assessment score (1-100)',
    target: '≥ 80',
    description: 'Evaluates long-term viability and impact of project outcomes',
  },
  'Financial implementation rate': {
    formula: '(Actual spending / Budgeted amount) × 100',
    target: '85-100%',
    description: 'Monitors budget utilization and financial execution',
  },
};
