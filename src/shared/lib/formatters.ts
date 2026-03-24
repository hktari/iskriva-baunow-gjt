export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(
  value: number,
  options?: {
    decimals?: boolean;
    thousandSeparators?: boolean;
  }
): string {
  const { decimals = false, thousandSeparators = true } = options || {};
  
  if (!thousandSeparators) {
    return decimals ? value.toFixed(2) : value.toString();
  }
  
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(value);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatDateRange(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): string {
  const start = formatDate(startDate);
  const end = endDate ? formatDate(endDate) : 'Ongoing';
  
  return `${start} - ${end}`;
}

export function calculateKpiProgress(achieved: number, target: number): number {
  if (target === 0) return 0;
  return Math.round((achieved / target) * 100);
}

export function getKpiProgressColor(percentage: number): string {
  if (percentage >= 100) return 'text-green-600';
  if (percentage >= 80) return 'text-blue-600';
  return 'text-red-600';
}

export function getKpiProgressBgColor(percentage: number): string {
  if (percentage >= 100) return 'bg-green-500';
  if (percentage >= 80) return 'bg-blue-500';
  return 'bg-red-500';
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PLANNING':
      return 'outline';
    case 'IN_PROGRESS':
      return 'default';
    case 'COMPLETED':
      return 'secondary';
    case 'ON_HOLD':
      return 'destructive';
    default:
      return 'default';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'PLANNING':
      return 'Planning';
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
      return 'Completed';
    case 'ON_HOLD':
      return 'On Hold';
    default:
      return status;
  }
}
