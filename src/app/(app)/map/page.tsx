import { auth } from '@/server/auth';
import { getGeneralAnalytics } from '@/server/queries/analytics';
import { ProjectsByCountryMap } from '@/shared/components/analytics/projects-by-country-map';
import { ChartContainer } from '@/shared/components/analytics/chart-container';

export default async function MapPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const analytics = await getGeneralAnalytics(undefined, userId);
  const { projectsByCountry, metrics } = analytics;

  return (
    <main className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Project Map</h1>
        <p className="text-muted-foreground mt-1">
          Geographic distribution of {metrics.totalProjects}{' '}
          {metrics.totalProjects === 1 ? 'project' : 'projects'} across {metrics.totalCountries}{' '}
          {metrics.totalCountries === 1 ? 'country' : 'countries'}
        </p>
      </div>

      <ChartContainer
        title="Projects by Country"
        description="Hover over a country to see the number of projects. Countries with no projects are shown in gray."
      >
        <ProjectsByCountryMap data={projectsByCountry} />
      </ChartContainer>

      {/* Country breakdown table */}
      {projectsByCountry.length > 0 ? (
        <ChartContainer title="Country Breakdown">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {projectsByCountry.map(({ country, count }) => (
              <div
                key={country}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <span className="font-medium truncate mr-2">{country}</span>
                <span className="text-muted-foreground shrink-0 tabular-nums">{count}</span>
              </div>
            ))}
          </div>
        </ChartContainer>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          No project data available yet.
        </div>
      )}
    </main>
  );
}
