import { Suspense } from 'react';
import { getAllFields, getFieldStats } from '@/server/queries/fields';
import { FieldsClient } from './fields-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Settings, Database } from 'lucide-react';
import { FieldCategory } from '@prisma/client';

async function FieldStatsCards() {
  const stats = await getFieldStats();
  const total = stats.reduce((sum, s) => sum + s.count, 0);

  const categoryLabels: Record<FieldCategory, string> = {
    PROJECT_TYPE: 'Project Types',
    INVESTMENT_TYPE: 'Investment Types',
    ORGANIZATION: 'Organizations',
    KPI_UNIT: 'KPI Units',
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Fields</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
        </CardContent>
      </Card>
      {stats.map(stat => (
        <Card key={stat.category}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{categoryLabels[stat.category]}</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.count}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function FieldsList() {
  const fields = await getAllFields();

  return <FieldsClient fields={fields} />;
}

export default function FieldsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Field Configuration</h1>
        <p className="text-muted-foreground">
          Manage configurable field values for dropdowns and selections
        </p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <FieldStatsCards />
      </Suspense>

      <Suspense fallback={<div>Loading fields...</div>}>
        <FieldsList />
      </Suspense>
    </div>
  );
}
