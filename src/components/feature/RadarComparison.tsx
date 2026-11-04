import { useMemo } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { getRadarData } from '@/lib/stats';
import type { CharacterVersion } from '@/types';

interface RadarComparisonProps {
  versionA: CharacterVersion | null;
  versionB: CharacterVersion | null;
  nameA: string;
  nameB: string;
  height?: number;
  showLegend?: boolean;
}

interface RadarTooltipPayload {
  payload?: { stat: string; a: number; b: number };
}

function RadarTooltip({ active, payload }: { active?: boolean; payload?: RadarTooltipPayload[] }) {
  if (!active || !payload || payload.length === 0) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;

  return (
    <div className="rounded-xl border border-background-700 bg-background-950/95 px-3 py-2 shadow-xl">
      <p className="font-label text-[10px] uppercase text-foreground-400">{entry.stat}</p>
      <p className="mt-1 text-xs font-semibold text-primary-300">A: {entry.a}</p>
      <p className="text-xs font-semibold text-accent-300">B: {entry.b}</p>
    </div>
  );
}

export default function RadarComparison({
  versionA,
  versionB,
  nameA,
  nameB,
  height = 320,
  showLegend = true,
}: RadarComparisonProps) {
  const radarData = useMemo(() => getRadarData(versionA, versionB), [versionA, versionB]);

  return (
    <div>
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} outerRadius="70%">
            <PolarGrid stroke="oklch(var(--background-700))" />
            <PolarAngleAxis
              dataKey="stat"
              tick={{ fill: 'oklch(var(--foreground-400))', fontSize: 10 }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip content={<RadarTooltip />} />
            <Radar
              name={nameA}
              dataKey="a"
              stroke="oklch(var(--primary-400))"
              fill="oklch(var(--primary-500))"
              fillOpacity={0.32}
            />
            <Radar
              name={nameB}
              dataKey="b"
              stroke="oklch(var(--accent-400))"
              fill="oklch(var(--accent-500))"
              fillOpacity={0.28}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {showLegend && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs">
          <span className="flex items-center gap-2 text-foreground-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary-500" />
            {nameA}
          </span>
          <span className="flex items-center gap-2 text-foreground-300">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent-500" />
            {nameB}
          </span>
        </div>
      )}
    </div>
  );
}