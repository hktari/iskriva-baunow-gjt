'use client';

import { useState, useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Plus, Info } from 'lucide-react';
import { KPI_INDICATORS, KPI_INDICATOR_METADATA } from '@/shared/lib/constants';
import { createKpi } from '@/server/actions/kpis';
import { toast } from 'sonner';

interface AddKpiDialogProps {
  projectId: string;
  configurableFields: {
    KPI_UNIT?: string[];
  };
}

export function AddKpiDialog({ projectId, configurableFields }: AddKpiDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [selectedIndicator, setSelectedIndicator] = useState('');
  const [customIndicator, setCustomIndicator] = useState('');
  const [useDecimals, setUseDecimals] = useState(false);
  const [useThousandSeparators, setUseThousandSeparators] = useState(true);

  const isCustom = selectedIndicator === 'custom';
  const indicatorName = isCustom ? customIndicator : selectedIndicator;
  const metadata =
    selectedIndicator && !isCustom ? KPI_INDICATOR_METADATA[selectedIndicator] : null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!indicatorName) {
      toast.error('Please select or enter an indicator name');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data = {
      indicatorName,
      targetValue: parseFloat(formData.get('targetValue') as string),
      valueAchieved: parseFloat(formData.get('valueAchieved') as string),
      unit: formData.get('unit') as string,
      updated: (formData.get('updated') as string) || null,
      decimals: useDecimals,
      thousandSeparators: useThousandSeparators,
      isPrimary: false,
    };

    startTransition(async () => {
      const result = await createKpi(projectId, data);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('KPI added successfully');
        setOpen(false);
        setSelectedIndicator('');
        setCustomIndicator('');
        setUseDecimals(false);
        setUseThousandSeparators(true);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add KPI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add KPI</DialogTitle>
          <DialogDescription>
            Add a new key performance indicator to track project progress
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="indicator">Indicator Name *</Label>
            <Select value={selectedIndicator} onValueChange={setSelectedIndicator}>
              <SelectTrigger>
                <SelectValue placeholder="Select indicator" />
              </SelectTrigger>
              <SelectContent>
                {KPI_INDICATORS.map(indicator => (
                  <SelectItem key={indicator} value={indicator}>
                    {indicator}
                  </SelectItem>
                ))}
                <SelectItem value="custom">Custom KPI (enter manually)</SelectItem>
              </SelectContent>
            </Select>

            {isCustom ? (
              <Input
                placeholder="Enter custom indicator name"
                value={customIndicator}
                onChange={e => setCustomIndicator(e.target.value)}
              />
            ) : null}
          </div>

          {metadata ? (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100 font-medium">
                <Info className="h-4 w-4" />
                <span>KPI Information</span>
              </div>
              {metadata.description ? (
                <div>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Description:
                  </span>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{metadata.description}</p>
                </div>
              ) : null}
              {metadata.formula ? (
                <div>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Formula:
                  </span>
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-mono">
                    {metadata.formula}
                  </p>
                </div>
              ) : null}
              {metadata.target ? (
                <div>
                  <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Recommended Target:
                  </span>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{metadata.target}</p>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetValue">Target Value *</Label>
              <Input id="targetValue" name="targetValue" type="number" step="any" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valueAchieved">Value Achieved *</Label>
              <Input id="valueAchieved" name="valueAchieved" type="number" step="any" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit *</Label>
            <Select name="unit" required>
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {configurableFields.KPI_UNIT?.map(unit => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="updated">Updated Date</Label>
            <Input id="updated" name="updated" placeholder="e.g., Q1/2025, 02/2025" />
          </div>

          <div className="space-y-2">
            <Label>Display Options</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDecimals}
                  onChange={e => setUseDecimals(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Use decimals</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useThousandSeparators}
                  onChange={e => setUseThousandSeparators(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Use thousand separators</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add KPI'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
