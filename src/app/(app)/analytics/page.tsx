import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Card, CardContent } from '@/shared/components/ui/card';
import { GeneralAnalyticsClient } from './general-analytics-client';
import { OrganizationAnalyticsClient } from './organization-analytics-client';
import { auth } from '@/server/auth';
import { getOrganizationList } from '@/server/queries/analytics';
import { getGeneralAnalytics, getOrganizationAnalytics } from '@/server/actions/analytics';
import { AlertCircle } from 'lucide-react';

export const metadata = {
  title: 'Analytics | EU Project Manager',
  description: 'Analytics dashboards for project performance and KPI tracking',
};

export default async function AnalyticsPage() {
  const session = await auth();
  const organizations = await getOrganizationList();

  // Pre-fetch initial data to prevent refetch on tab switch
  const [generalAnalytics, organizationAnalytics] = await Promise.all([
    getGeneralAnalytics({}, session?.user?.id),
    session?.user?.organization ? getOrganizationAnalytics(session.user.organization) : null,
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into project performance, KPIs, and environmental impact
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General Analytics</TabsTrigger>
          <TabsTrigger value="organization">Organization Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Suspense fallback={<AnalyticsLoadingSkeleton />}>
            <GeneralAnalyticsClient userId={session?.user?.id} initialData={generalAnalytics} />
          </Suspense>
        </TabsContent>

        <TabsContent value="organization" className="space-y-6">
          {session ? (
            <Suspense fallback={<AnalyticsLoadingSkeleton />}>
              <OrganizationAnalyticsClient
                userOrganization={session.user.organization || undefined}
                organizations={organizations}
                initialData={organizationAnalytics}
              />
            </Suspense>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Please log in to access Organization Analytics and view performance metrics for
                  specific organizations.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-20 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-64 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
