import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import CharacterAvatar from '@/components/feature/CharacterAvatar';
import {
  compareVersions,
  getRadarData,
  getVersionPower,
  getWinProbability,
} from '@/lib/stats';
import type { FighterSlot } from '@/types';

interface MatchupSectionProps {
  slotA: FighterSlot | null;
  slotB: FighterSlot | null;
  onVersionChange: (side: 'a' | 'b', versionId: string) => void;
}

export default function MatchupSection({ slotA, slotB, onVersionChange }: MatchupSectionProps) {
  const versionA = slotA?.versions.find((version) => version.id === slotA.versionId) ?? null;
  const versionB = slotB?.versions.find((version) => version.id === slotB.versionId) ?? null;
  const ready = Boolean(slotA && slotB && versionA && versionB);

  const comparisons = useMemo(() => compareVersions(versionA, versionB), [versionA, versionB]);
  const radarData = useMemo(() => getRadarData(versionA, versionB), [versionA, versionB]);
  const probabilityA = ready ? getWinProbability(versionA, versionB) : 50;

  const battleLink =
    slotA?.character && slotB?.character
      ? `/battle?a=${slotA.character.slug}${slotA.versionId ? `&av=${slotA.versionId}` : ''}&b=${slotB.character.slug}${
          slotB.versionId ? `&bv=${slotB.versionId}` : ''
        }`
      : '/battle';

  const sideCard = (slot: FighterSlot | null, side: 'a' | 'b') => {
    if (!slot) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-background-700 bg-background-900/40 px-4 py-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-background-700 text-foreground-600">
            <i className="ri-user-add-line text-xl" />
          </span>
          <p className="mt-3 text-xs text-foreground-500">
            Elige el combatiente {side === 'a' ? 'A' : 'B'} en el panel superior.
          </p>
        </div>
      );
    }

    const isPrimary = side === 'a';
    return (
      <div
        className={`flex-1 rounded-2xl border bg-background-900/80 p-4 ${
          isPrimary ? 'border-primary-500/40' : 'border-accent-500/40'
        }`}
      >
        <div className="flex items-center gap-3">
          <CharacterAvatar
            name={slot.character.name}
            image={slot.character.thumbnail_url || slot.character.main_image_url}
            archetype={slot.character.archetype}
            className="h-16 w-16"
          />
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-semibold text-foreground-50">
              {slot.character.name}
            </p>
            <p className="truncate text-xs text-foreground-500">{slot.character.series_name}</p>
          </div>
        </div>

        <select
          value={slot.versionId ?? ''}
          onChange={(event) => onVersionChange(side, event.target.value)}
          className="mt-3 w-full cursor-pointer rounded-lg border border-background-700 bg-background-950 px-3 py-2 text-xs text-foreground-200 outline-none focus:border-primary-500/70"
          aria-label={`Version de ${slot.character.name}`}
        >
          {slot.versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.name}
            </option>
          ))}
        </select>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-heading text-2xl font-bold text-foreground-50">
            {getVersionPower(slot.versions.find((v) => v.id === slot.versionId))}
          </span>
          <span className="font-label text-[10px] uppercase text-foreground-500">Indice de poder</span>
        </div>
      </div>
    );
  };

  return (
    <section id="matchup" className="mx-auto w-full max-w-[1400px] scroll-mt-24 px-4 py-14 md:px-8 md:py-20">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-label text-[11px] uppercase text-primary-300">Comparador</span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-foreground-50 md:text-3xl">
            Analisis cara a cara
          </h2>
        </div>
        <p className="max-w-md text-sm text-foreground-500">
          Las barras se calculan con los datos de cada version del personaje: nada de estimaciones al azar.
        </p>
      </div>

      <div className="mt-8 rounded-3xl border border-background-800 bg-background-900/50 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row">
          {sideCard(slotA, 'a')}
          <div className="flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-background-700 bg-background-950 font-label text-xs text-foreground-400">
              VS
            </span>
          </div>
          {sideCard(slotB, 'b')}
        </div>

        {ready ? (
          <>
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
              <div className="h-72 w-full md:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius="72%">
                    <PolarGrid stroke="oklch(var(--background-700))" />
                    <PolarAngleAxis
                      dataKey="stat"
                      tick={{ fill: 'oklch(var(--foreground-400))', fontSize: 10 }}
                    />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name={slotA?.character.name}
                      dataKey="a"
                      stroke="oklch(var(--primary-400))"
                      fill="oklch(var(--primary-500))"
                      fillOpacity={0.35}
                    />
                    <Radar
                      name={slotB?.character.name}
                      dataKey="b"
                      stroke="oklch(var(--accent-400))"
                      fill="oklch(var(--accent-500))"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div>
                <div className="rounded-2xl border border-background-800 bg-background-950/60 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary-300">{slotA?.character.name}</span>
                    <span className="font-label uppercase text-foreground-500">Probabilidad estimada</span>
                    <span className="font-semibold text-accent-300">{slotB?.character.name}</span>
                  </div>
                  <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-background-800">
                    <div className="h-full bg-primary-500" style={{ width: `${probabilityA}%` }} />
                    <div className="h-full flex-1 bg-accent-500" />
                  </div>
                  <div className="mt-2 flex items-center justify-between font-heading text-lg font-bold">
                    <span className="text-primary-300">{probabilityA}%</span>
                    <span className="text-accent-300">{100 - probabilityA}%</span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-foreground-500">
                    Estimacion basada en el indice ponderado de estadisticas. El veredicto real se decide
                    con habilidades, counters y condiciones de combate.
                  </p>

                  <Link
                    to={battleLink}
                    className="mt-3 flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
                  >
                    <i className="ri-flashlight-fill" />
                    Simular batalla con IA
                  </Link>
                </div>

                <div className="mt-4 space-y-2.5">
                  {comparisons.map((stat) => (
                    <div key={stat.key}>
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`w-9 text-left font-semibold ${
                            stat.winner === 'a' ? 'text-primary-300' : 'text-foreground-500'
                          }`}
                        >
                          {stat.a}
                        </span>
                        <span className="font-label uppercase text-foreground-500">{stat.label}</span>
                        <span
                          className={`w-9 text-right font-semibold ${
                            stat.winner === 'b' ? 'text-accent-300' : 'text-foreground-500'
                          }`}
                        >
                          {stat.b}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        <div className="flex flex-1 justify-end overflow-hidden rounded-full bg-background-800">
                          <div className="h-1.5 rounded-full bg-primary-500" style={{ width: `${stat.a}%` }} />
                        </div>
                        <div className="flex flex-1 overflow-hidden rounded-full bg-background-800">
                          <div className="h-1.5 rounded-full bg-accent-500" style={{ width: `${stat.b}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-background-700 bg-background-950/40 px-6 py-12 text-center">
            <i className="ri-radar-line text-3xl text-foreground-600" />
            <p className="mt-3 text-sm text-foreground-400">
              Cuando elijas los dos combatientes veras el radar comparativo, las 10 categorias de
              estadisticas y la probabilidad estimada.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}