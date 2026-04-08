'use client';

import { EU_COUNTRY_CODES, NUMERIC_ISO_COUNTRY } from '@/shared/lib/country-iso-mapping';
import type { ProjectsByCountry } from '@/types/analytics';
import { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';

const GEO_URL = '/maps/world-110m.json';

/**
 * European-focused projection config.
 * Uses geoMercator centered on Europe.
 * rotate: shifts the globe so Europe is centered
 * center: fine-tune panning [lon, lat]
 * scale: zoom level
 */
const PROJECTION_CONFIG = {
  rotate: [-15, 0, 0] as [number, number, number],
  center: [0, 52] as [number, number],
  scale: 680,
};

/** All European country codes for display purposes (both EU and non-EU) */
const EUROPEAN_COUNTRY_CODES = new Set(Object.keys(NUMERIC_ISO_COUNTRY));

interface TooltipState {
  country: string;
  count: number;
  x: number;
  y: number;
}

interface ProjectsByCountryMapProps {
  data: ProjectsByCountry[];
}

function getCountColor(count: number, maxCount: number, isDark: boolean): string {
  if (count === 0) return isDark ? '#374151' : '#e5e7eb'; // gray-700 / gray-200

  const intensity = count / maxCount;
  // Blue gradient: low → light blue, high → deep blue
  // Light mode:  hsl(221 83% 75%) → hsl(221 83% 35%)
  // Dark mode:   hsl(221 70% 35%) → hsl(221 70% 65%)
  if (isDark) {
    const l = Math.round(30 + intensity * 35); // 30% → 65%
    return `hsl(221 70% ${l}%)`;
  } else {
    const l = Math.round(75 - intensity * 40); // 75% → 35%
    return `hsl(221 83% ${l}%)`;
  }
}

export function ProjectsByCountryMap({ data }: ProjectsByCountryMapProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Build a fast lookup map: country name → count
  const countByCountry = new Map<string, number>(data.map(d => [d.country, d.count]));
  const maxCount = Math.max(...data.map(d => d.count), 1);

  // Detect dark mode via CSS variable (Tailwind dark class on html)
  // We derive color at render time; the map re-renders on theme change
  const isDark =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  const handleMouseEnter = (
    event: React.MouseEvent<SVGPathElement>,
    countryName: string,
    count: number
  ) => {
    const rect = (event.currentTarget as SVGPathElement).closest('svg')?.getBoundingClientRect();
    const x = event.clientX - (rect?.left ?? 0);
    const y = event.clientY - (rect?.top ?? 0);
    setTooltip({ country: countryName, count, x, y });
  };

  const handleMouseMove = (event: React.MouseEvent<SVGPathElement>) => {
    if (!tooltip) return;
    const rect = (event.currentTarget as SVGPathElement).closest('svg')?.getBoundingClientRect();
    const x = event.clientX - (rect?.left ?? 0);
    const y = event.clientY - (rect?.top ?? 0);
    setTooltip(prev => (prev ? { ...prev, x, y } : null));
  };

  const handleMouseLeave = () => setTooltip(null);

  return (
    <div className="relative w-full select-none" style={{ height: 580 }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={PROJECTION_CONFIG}
        width={980}
        height={580}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map(geo => {
                const numericId: string = geo.id as string;

                // Skip non-European countries entirely (not displayed)
                if (!EUROPEAN_COUNTRY_CODES.has(numericId)) {
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={isDark ? '#1f2937' : '#f3f4f6'}
                      stroke={isDark ? '#374151' : '#d1d5db'}
                      strokeWidth={0.4}
                      style={{
                        default: { outline: 'none' },
                        hover: { outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                }

                const countryName = NUMERIC_ISO_COUNTRY[numericId];
                const count = countByCountry.get(countryName) ?? 0;
                const fill = getCountColor(count, maxCount, isDark);

                // Non-EU European countries: visible but not interactable
                if (!EU_COUNTRY_CODES.has(numericId)) {
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={isDark ? '#4b5563' : '#9ca3af'}
                      strokeWidth={0.6}
                      style={{
                        default: { outline: 'none', cursor: 'default' },
                        hover: { outline: 'none' },
                        pressed: { outline: 'none' },
                      }}
                    />
                  );
                }

                // EU countries: fully interactable with hover and tooltip
                const hoverFill =
                  count === 0
                    ? isDark
                      ? '#4b5563'
                      : '#d1d5db'
                    : isDark
                      ? `hsl(221 80% ${Math.min(75, Math.round(30 + (count / maxCount) * 35) + 10)}%)`
                      : `hsl(221 90% ${Math.max(25, Math.round(75 - (count / maxCount) * 40) - 8)}%)`;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke={isDark ? '#4b5563' : '#9ca3af'}
                    strokeWidth={0.6}
                    onMouseEnter={e => handleMouseEnter(e, countryName, count)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: { outline: 'none', cursor: 'default' },
                      hover: { outline: 'none', fill: hoverFill, cursor: 'pointer' },
                      pressed: { outline: 'none' },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltip ? (
        <div
          className="pointer-events-none absolute z-10 rounded-md border bg-popover px-3 py-2 shadow-md text-sm"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y - 10,
            transform: tooltip.x > 800 ? 'translateX(-110%)' : undefined,
          }}
        >
          <p className="font-semibold text-popover-foreground">{tooltip.country}</p>
          <p className="text-muted-foreground">
            {tooltip.count === 0
              ? 'No projects'
              : `${tooltip.count} ${tooltip.count === 1 ? 'project' : 'projects'}`}
          </p>
        </div>
      ) : null}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-md border bg-background/80 backdrop-blur px-3 py-2 text-xs text-muted-foreground">
        <span>Fewer</span>
        <div
          className="h-3 w-24 rounded-sm"
          style={{
            background: isDark
              ? 'linear-gradient(to right, hsl(221 70% 30%), hsl(221 70% 65%))'
              : 'linear-gradient(to right, hsl(221 83% 75%), hsl(221 83% 35%))',
          }}
        />
        <span>More</span>
      </div>
    </div>
  );
}
