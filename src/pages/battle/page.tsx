import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AppHeader from '@/components/feature/AppHeader';
import AppFooter from '@/components/feature/AppFooter';
import RadarComparison from '@/components/feature/RadarComparison';
import { simulateBattle } from '@/services/battleService';
import { getCharacterBySlug, getCharacterVersions } from '@/services/characterService';
import { DEFAULT_CONDITIONS, describeConditions } from '@/lib/battleConditions';
import { getVersionPower, getWinProbability } from '@/lib/stats';
import BattleConditionsPanel from '@/pages/battle/components/BattleConditionsPanel';
import FighterSlotCard from '@/pages/battle/components/FighterSlotCard';
import SimulationOverlay from '@/pages/battle/components/SimulationOverlay';
import type { CharacterSummary, FighterSlot } from '@/types';
import type { BattleConditions } from '@/types/battle';

export default function BattleSetupPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [slotA, setSlotA] = useState<FighterSlot | null>(null);
  const [slotB, setSlotB] = useState<FighterSlot | null>(null);
  const [conditions, setConditions] = useState<BattleConditions>(DEFAULT_CONDITIONS);
  const [initialLoading, setInitialLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignCharacter = useCallback(
    async (side: 'a' | 'b', character: CharacterSummary, preferredVersionId?: string | null) => {
      const versions = await getCharacterVersions(character.id);
      const sorted = [...versions].sort((first, second) => first.power_boost - second.power_boost);
      const preferred =
        preferredVersionId && sorted.some((version) => version.id === preferredVersionId)
          ? preferredVersionId
          : sorted.length > 0
            ? sorted[sorted.length - 1].id
            : null;

      const slot: FighterSlot = { character, versions: sorted, versionId: preferred };
      if (side === 'a') setSlotA(slot);
      else setSlotB(slot);
    },
    [],
  );

  useEffect(() => {
    const slugA = searchParams.get('a');
    const slugB = searchParams.get('b');
    if (!slugA && !slugB) return undefined;

    let cancelled = false;

    const load = async () => {
      setInitialLoading(true);
      try {
        if (slugA) {
          const first = await getCharacterBySlug(slugA);
          if (first && !cancelled) await assignCharacter('a', first, searchParams.get('av'));
        }
        if (slugB) {
          const second = await getCharacterBySlug(slugB);
          if (second && !cancelled) await assignCharacter('b', second, searchParams.get('bv'));
        }
        if (!cancelled) setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudieron cargar los personajes');
        }
      } finally {
        if (!cancelled) setInitialLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [searchParams, assignCharacter]);

  const handleSelect = async (side: 'a' | 'b', character: CharacterSummary) => {
    setError(null);
    try {
      await assignCharacter(side, character);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las versiones');
    }
  };

  const versionA = useMemo(
    () => slotA?.versions.find((version) => version.id === slotA.versionId) ?? null,
    [slotA],
  );
  const versionB = useMemo(
    () => slotB?.versions.find((version) => version.id === slotB.versionId) ?? null,
    [slotB],
  );

  const ready = Boolean(slotA && slotB && versionA && versionB);
  const probabilityA = ready ? getWinProbability(versionA, versionB) : 50;
  const conditionsSummary = describeConditions(conditions);

  const handleSimulate = async () => {
    if (!versionA || !versionB) return;
    setRunning(true);
    setError(null);

    try {
      const result = await simulateBattle({
        versionAId: versionA.id,
        versionBId: versionB.id,
        conditions,
      });
      navigate(`/battle/${result.battleId}`, { state: { cached: result.cached } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo simular la batalla.');
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-950">
      <AppHeader />

      {running && slotA && slotB && (
        <SimulationOverlay nameA={slotA.character.name} nameB={slotB.character.name} />
      )}

      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-500">
          <Link to="/" className="hover:text-foreground-200">
            Inicio
          </Link>
          <i className="ri-arrow-right-s-line" />
          <span className="text-foreground-300">Nueva batalla</span>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-label text-[11px] uppercase text-accent-300">Arena de simulacion</span>
            <h1 className="mt-2 font-heading text-3xl font-extrabold text-foreground-50 md:text-4xl">
              Configura el combate
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground-400">
              Elige las versiones exactas y define las condiciones. La IA analiza estadisticas, habilidades,
              counters y win conditions antes de dictar un ganador.
            </p>
          </div>
          <Link
            to="/characters"
            className="flex w-fit items-center gap-2 whitespace-nowrap rounded-xl border border-background-700 px-4 py-2.5 text-sm font-medium text-foreground-300 transition-colors hover:border-primary-500/60 hover:text-foreground-50"
          >
            <i className="ri-search-line" />
            Explorar catalogo
          </Link>
        </div>

        {error && (
          <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-xl border border-accent-500/40 bg-accent-950/30 px-4 py-3 text-sm text-accent-200 sm:flex-row sm:items-center">
            <span className="flex items-start gap-2">
              <i className="ri-error-warning-line mt-0.5" />
              {error}
            </span>
            <button
              type="button"
              onClick={handleSimulate}
              className="cursor-pointer whitespace-nowrap rounded-lg border border-accent-500/50 px-3 py-1.5 text-xs font-semibold text-accent-100 hover:bg-accent-500/10"
            >
              Reintentar
            </button>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-background-800 bg-background-900/40 p-4 md:p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-base font-semibold text-foreground-50">Combatientes</h2>
                <span className="font-label text-[10px] uppercase text-foreground-600">
                  {initialLoading ? 'Cargando...' : 'Datos en vivo'}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
                <FighterSlotCard
                  side="a"
                  label="Combatiente A"
                  slot={slotA}
                  onSelect={(character) => handleSelect('a', character)}
                  onClear={() => setSlotA(null)}
                  onVersionChange={(versionId) =>
                    setSlotA((prev) => (prev ? { ...prev, versionId } : prev))
                  }
                />
                <div className="flex items-center justify-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-background-700 bg-background-950 font-label text-[10px] text-foreground-400">
                    VS
                  </span>
                </div>
                <FighterSlotCard
                  side="b"
                  label="Combatiente B"
                  slot={slotB}
                  onSelect={(character) => handleSelect('b', character)}
                  onClear={() => setSlotB(null)}
                  onVersionChange={(versionId) =>
                    setSlotB((prev) => (prev ? { ...prev, versionId } : prev))
                  }
                />
              </div>
            </div>

            <BattleConditionsPanel conditions={conditions} onChange={setConditions} />
          </div>

          <aside className="space-y-4 self-start lg:sticky lg:top-24">
            <div className="rounded-2xl border border-background-800 bg-background-900/70 p-4 md:p-5">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-sm font-semibold text-foreground-50">Resumen previo</h2>
                <span className="font-label text-[10px] uppercase text-foreground-500">Estimado</span>
              </div>

              {ready && versionA && versionB ? (
                <>
                  <div className="mt-2">
                    <RadarComparison
                      versionA={versionA}
                      versionB={versionB}
                      nameA={slotA?.character.name ?? 'A'}
                      nameB={slotB?.character.name ?? 'B'}
                      height={210}
                      showLegend={false}
                    />
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl border border-primary-500/30 bg-primary-500/5 px-2 py-2">
                      <p className="truncate text-[11px] text-foreground-400">{slotA?.character.name}</p>
                      <p className="font-heading text-lg font-bold text-primary-300">
                        {getVersionPower(versionA)}
                      </p>
                    </div>
                    <div className="rounded-xl border border-accent-500/30 bg-accent-500/5 px-2 py-2">
                      <p className="truncate text-[11px] text-foreground-400">{slotB?.character.name}</p>
                      <p className="font-heading text-lg font-bold text-accent-300">
                        {getVersionPower(versionB)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-primary-300">{probabilityA}%</span>
                      <span className="font-label uppercase text-foreground-500">Prob. estimada</span>
                      <span className="font-semibold text-accent-300">{100 - probabilityA}%</span>
                    </div>
                    <div className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-background-800">
                      <div className="h-full bg-primary-500" style={{ width: `${probabilityA}%` }} />
                      <div className="h-full flex-1 bg-accent-500" />
                    </div>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-foreground-600">
                      Solo referencia: el resultado final lo decide el analisis de habilidades y counters.
                    </p>
                  </div>
                </>
              ) : (
                <div className="mt-3 rounded-xl border border-dashed border-background-700 bg-background-950/40 px-4 py-8 text-center">
                  <i className="ri-sword-line text-2xl text-foreground-600" />
                  <p className="mt-2 text-xs leading-relaxed text-foreground-500">
                    Elige los dos combatientes para ver la vista previa y activar la simulacion.
                  </p>
                </div>
              )}

              <div className="mt-4 space-y-1.5 border-t border-background-800 pt-3">
                {conditionsSummary.map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="flex items-center gap-1.5 text-foreground-500">
                      <i className={`${item.icon} text-[10px]`} />
                      {item.label}
                    </span>
                    <span className="truncate font-medium text-foreground-200">{item.value}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSimulate}
                disabled={!ready || running}
                className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary-500 px-4 py-3.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-background-800 disabled:text-foreground-600"
              >
                <i className="ri-flashlight-fill text-base" />
                Simular batalla
              </button>

              <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-[10px] text-foreground-600">
                <i className="ri-shield-check-line" />
                Analisis con IA y clave protegida en el servidor
              </p>
            </div>

            <div className="rounded-2xl border border-background-800 bg-background-950/60 p-4">
              <h3 className="font-label text-[10px] uppercase text-foreground-500">Como se decide</h3>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-foreground-400">
                <li className="flex gap-2">
                  <i className="ri-check-line mt-0.5 text-primary-400" />
                  No gana solo quien tiene mas fuerza.
                </li>
                <li className="flex gap-2">
                  <i className="ri-check-line mt-0.5 text-primary-400" />
                  Se cruzan hax, regeneracion, stamina y battle IQ.
                </li>
                <li className="flex gap-2">
                  <i className="ri-check-line mt-0.5 text-primary-400" />
                  Cada resultado queda guardado y se reutiliza.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}