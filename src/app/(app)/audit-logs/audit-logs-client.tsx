'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { useDebouncedCallback } from '@/shared/hooks/use-debounced-callback';
import { ChevronDown, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userId: string | null;
  userEmail: string | null;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  } | null;
}

interface AuditLogsClientProps {
  logs: AuditLog[];
}

const actionColors: Record<string, string> = {
  USER_CREATED: 'bg-green-500',
  USER_UPDATED: 'bg-blue-500',
  USER_DELETED: 'bg-red-500',
  USER_STATUS_CHANGED: 'bg-yellow-500',
  FIELD_CREATED: 'bg-green-500',
  FIELD_UPDATED: 'bg-blue-500',
  FIELD_DELETED: 'bg-red-500',
  PROJECT_CREATED: 'bg-green-500',
  PROJECT_UPDATED: 'bg-blue-500',
  PROJECT_DELETED: 'bg-red-500',
};

export function AuditLogsClient({ logs: initialLogs }: AuditLogsClientProps) {
  const [logs] = useState(initialLogs);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [filteredLogs, setFilteredLogs] = useState(initialLogs);

  const uniqueActions = Array.from(new Set(logs.map(l => l.action))).sort();
  const uniqueEntities = Array.from(new Set(logs.map(l => l.entityType))).sort();

  // Debounced search function
  const debouncedSearch = useDebouncedCallback(
    useCallback(
      (searchValue: string) => {
        const filtered = logs.filter(log => {
          const matchesSearch =
            searchValue === '' ||
            log.action.toLowerCase().includes(searchValue.toLowerCase()) ||
            log.userEmail?.toLowerCase().includes(searchValue.toLowerCase()) ||
            log.entityType.toLowerCase().includes(searchValue.toLowerCase());

          const matchesAction = actionFilter === 'all' || log.action === actionFilter;
          const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;

          return matchesSearch && matchesAction && matchesEntity;
        });
        setFilteredLogs(filtered);
      },
      [logs, actionFilter, entityFilter]
    ),
    300
  );

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    debouncedSearch(value);
  };

  // Update filtered logs when filters change
  useEffect(() => {
    const filtered = logs.filter(log => {
      const matchesSearch =
        search === '' ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
        log.entityType.toLowerCase().includes(search.toLowerCase());

      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      const matchesEntity = entityFilter === 'all' || log.entityType === entityFilter;

      return matchesSearch && matchesAction && matchesEntity;
    });
    setFilteredLogs(filtered);
  }, [logs, search, actionFilter, entityFilter]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(new Date(date));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {uniqueActions.map(action => (
              <SelectItem key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Filter by entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Entities</SelectItem>
            {uniqueEntities.map(entity => (
              <SelectItem key={entity} value={entity}>
                {entity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>User</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map(log => (
                <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-mono text-xs">{formatDate(log.createdAt)}</TableCell>
                  <TableCell>
                    <Badge className={actionColors[log.action] || 'bg-gray-500'} variant="default">
                      {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.entityType}</span>
                      {log.entityId ? (
                        <span className="text-xs text-muted-foreground font-mono">
                          {log.entityId.substring(0, 8)}...
                        </span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.user?.name || 'System'}</span>
                      <span className="text-xs text-muted-foreground">{log.userEmail || '-'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{log.ipAddress || '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedLog(log)}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              {selectedLog ? formatDate(selectedLog.createdAt) : null}
            </DialogDescription>
          </DialogHeader>
          {selectedLog ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Action</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedLog.action.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Entity Type</label>
                  <p className="text-sm text-muted-foreground">{selectedLog.entityType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Entity ID</label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedLog.entityId || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">User</label>
                  <p className="text-sm text-muted-foreground">
                    {selectedLog.user?.name || 'System'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">IP Address</label>
                  <p className="text-sm text-muted-foreground font-mono">
                    {selectedLog.ipAddress || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">User Agent</label>
                  <p className="text-sm text-muted-foreground truncate">
                    {selectedLog.userAgent || '-'}
                  </p>
                </div>
              </div>
              {selectedLog.metadata ? (
                <div>
                  <label className="text-sm font-medium">Metadata</label>
                  <pre className="mt-2 p-4 bg-muted rounded-md text-xs overflow-auto max-h-64">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
