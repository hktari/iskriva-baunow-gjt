'use client';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { Palette, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ColorConfig {
  name: string;
  variable: string;
  label: string;
  description: string;
  defaultValue: string;
}

const COLOR_CONFIGS: ColorConfig[] = [
  {
    name: 'chart-1',
    variable: '--color-chart-1',
    label: 'Chart Color 1',
    description: 'Primary chart color (blue)',
    defaultValue: 'hsl(221.2 83.2% 53.3%)',
  },
  {
    name: 'chart-2',
    variable: '--color-chart-2',
    label: 'Chart Color 2',
    description: 'Secondary chart color (green)',
    defaultValue: 'hsl(142.1 76.2% 36.3%)',
  },
  {
    name: 'chart-3',
    variable: '--color-chart-3',
    label: 'Chart Color 3',
    description: 'Tertiary chart color (yellow)',
    defaultValue: 'hsl(47.9 95.8% 53.1%)',
  },
  {
    name: 'chart-4',
    variable: '--color-chart-4',
    label: 'Chart Color 4',
    description: 'Quaternary chart color (purple)',
    defaultValue: 'hsl(280.4 89.1% 65.5%)',
  },
  {
    name: 'chart-5',
    variable: '--color-chart-5',
    label: 'Chart Color 5',
    description: 'Quinary chart color (pink)',
    defaultValue: 'hsl(340.7 82.2% 52.5%)',
  },
  {
    name: 'status-planning',
    variable: '--color-status-planning',
    label: 'Planning Status',
    description: 'Color for projects in planning',
    defaultValue: 'hsl(47.9 95.8% 53.1%)',
  },
  {
    name: 'status-in-progress',
    variable: '--color-status-in-progress',
    label: 'In Progress Status',
    description: 'Color for projects in progress',
    defaultValue: 'hsl(221.2 83.2% 53.3%)',
  },
  {
    name: 'status-completed',
    variable: '--color-status-completed',
    label: 'Completed Status',
    description: 'Color for completed projects',
    defaultValue: 'hsl(142.1 76.2% 36.3%)',
  },
  {
    name: 'status-on-hold',
    variable: '--color-status-on-hold',
    label: 'On Hold Status',
    description: 'Color for projects on hold',
    defaultValue: 'hsl(0 84.2% 60.2%)',
  },
];

function hslToHex(hsl: string): string {
  const match = hsl.match(/hsl\((\d+\.?\d*)\s+(\d+\.?\d*)%\s+(\d+\.?\d*)%\)/);
  if (!match) return '#3b82f6';

  const h = parseFloat(match[1]) / 360;
  const s = parseFloat(match[2]) / 100;
  const l = parseFloat(match[3]) / 100;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hue2rgb(p, q, h) * 255);
  const b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToHsl(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `hsl(${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%)`;
}

export function ChartColorCustomizer() {
  const [open, setOpen] = useState(false);
  const [colors, setColors] = useState<Record<string, string>>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('chart-colors') : null;
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  });

  useEffect(() => {
    COLOR_CONFIGS.forEach(config => {
      const value = colors[config.name] || config.defaultValue;
      document.documentElement.style.setProperty(config.variable, value);
    });
  }, [colors]);

  const handleColorChange = (name: string, hexColor: string) => {
    const hslColor = hexToHsl(hexColor);
    setColors(prev => ({ ...prev, [name]: hslColor }));
  };

  const handleSave = () => {
    localStorage.setItem('chart-colors', JSON.stringify(colors));
    setOpen(false);
  };

  const handleReset = () => {
    setColors({});
    localStorage.removeItem('chart-colors');
    COLOR_CONFIGS.forEach(config => {
      document.documentElement.style.setProperty(config.variable, config.defaultValue);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          Customize Colors
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Chart Colors</DialogTitle>
          <DialogDescription>
            Personalize the colors used in analytics charts. Changes are saved locally in your
            browser.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-sm font-semibold mb-3">General Chart Colors</h3>
            <div className="grid gap-4">
              {COLOR_CONFIGS.filter(c => c.name.startsWith('chart-')).map(config => (
                <div key={config.name} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor={config.name} className="font-medium">
                      {config.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                  <input
                    type="color"
                    id={config.name}
                    value={hslToHex(colors[config.name] || config.defaultValue)}
                    onChange={e => handleColorChange(config.name, e.target.value)}
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Project Status Colors</h3>
            <div className="grid gap-4">
              {COLOR_CONFIGS.filter(c => c.name.startsWith('status-')).map(config => (
                <div key={config.name} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor={config.name} className="font-medium">
                      {config.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">{config.description}</p>
                  </div>
                  <input
                    type="color"
                    id={config.name}
                    value={hslToHex(colors[config.name] || config.defaultValue)}
                    onChange={e => handleColorChange(config.name, e.target.value)}
                    className="h-10 w-20 rounded border cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
