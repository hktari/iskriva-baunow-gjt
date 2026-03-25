'use client';

import { deleteKpi, setPrimaryKpi, updateKpi } from '@/server/actions/kpis';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import {
  calculateKpiProgress,
  formatNumber,
  getKpiProgressBgColor,
  getKpiProgressColor,
} from '@/shared/lib/formatters';
import { Pencil, Star, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

interface KpiCardProps {
  kpi: {
    id: string;
    indicatorName: string;
    targetValue: number;
    valueAchieved: number;
    unit: string;
    updated: string | null;
    decimals: boolean;
    thousandSeparators: boolean;
    isPrimary: boolean;
  };
  projectId: string;
  canEdit: boolean;
  isAuthenticated: boolean;
}

export function KpiCard({ kpi, projectId, canEdit, isAuthenticated }: KpiCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [targetValue, setTargetValue] = useState(kpi.targetValue.toString());
  const [valueAchieved, setValueAchieved] = useState(kpi.valueAchieved.toString());
  const [isPending, startTransition] = useTransition();

  const progress = calculateKpiProgress(kpi.valueAchieved, kpi.targetValue);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateKpi(kpi.id, projectId, {
        ...kpi,
        targetValue: parseFloat(targetValue),
        valueAchieved: parseFloat(valueAchieved),
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('KPI updated successfully');
        setIsEditing(false);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to delete this KPI?')) return;

    startTransition(async () => {
      const result = await deleteKpi(kpi.id, projectId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('KPI deleted successfully');
      }
    });
  };

  const handleTogglePrimary = () => {
    startTransition(async () => {
      const result = await setPrimaryKpi(kpi.id, projectId);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(result.isPrimary === true ? 'Set as primary KPI' : 'Removed as primary KPI');
      }
    });
  };

  return (
    <Card className={kpi.isPrimary ? 'ring-2 ring-blue-500' : ''}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleTogglePrimary}
                  disabled={isPending}
                >
                  <Star
                    className={`h-4 w-4 ${kpi.isPrimary ? 'fill-blue-500 text-blue-500' : ''}`}
                  />
                </Button>
              ) : null}
              <h4 className="font-medium">{kpi.indicatorName}</h4>
            </div>
            {kpi.updated ? (
              <p className="text-xs text-muted-foreground mt-1">Updated: {kpi.updated}</p>
            ) : null}
          </div>

          {canEdit ? (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsEditing(!isEditing)}
                disabled={isPending}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Target Value</label>
                <Input
                  type="number"
                  step="any"
                  value={targetValue}
                  onChange={e => setTargetValue(e.target.value)}
                  className="h-8"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Achieved Value</label>
                <Input
                  type="number"
                  step="any"
                  value={valueAchieved}
                  onChange={e => setValueAchieved(e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={isPending}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setTargetValue(kpi.targetValue.toString());
                  setValueAchieved(kpi.valueAchieved.toString());
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Target:</span>
                <span className="font-medium">
                  {formatNumber(kpi.targetValue, {
                    decimals: kpi.decimals,
                    thousandSeparators: kpi.thousandSeparators,
                  })}{' '}
                  {kpi.unit}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Achieved:</span>
                <span className="font-medium">
                  {formatNumber(kpi.valueAchieved, {
                    decimals: kpi.decimals,
                    thousandSeparators: kpi.thousandSeparators,
                  })}{' '}
                  {kpi.unit}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getKpiProgressColor(progress)}`}>
                  {progress}%
                </span>
                {progress >= 100 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : progress < 80 ? (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                ) : null}
              </div>
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${getKpiProgressBgColor(progress)} transition-all`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
