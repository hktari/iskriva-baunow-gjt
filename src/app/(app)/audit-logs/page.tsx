import { Suspense } from 'react';
import { getAuditLogs, getAuditLogStats } from '@/server/queries/audit-logs';
import { AuditLogsClient } from './audit-logs-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { FileText, Clock, Calendar, Activity } from 'lucide-react';

async function AuditStatsCards() {
  const stats = await getAuditLogStats();

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last 24 Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.last24h}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Last 7 Days</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.last7d}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Action</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-sm font-medium">{stats.topActions[0]?.action || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">
            {stats.topActions[0]?.count || 0} times
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function AuditLogsList() {
  const logs = await getAuditLogs();

  return <AuditLogsClient logs={logs} />;
}

export default function AuditLogsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system activities and user actions</p>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <AuditStatsCards />
      </Suspense>

      <Suspense fallback={<div>Loading audit logs...</div>}>
        <AuditLogsList />
      </Suspense>
    </div>
  );
}
