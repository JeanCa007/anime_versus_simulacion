import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppHeader from '@/components/feature/AppHeader';
import AppFooter from '@/components/feature/AppFooter';
import HeroSection from '@/pages/home/components/HeroSection';
import MatchupSection from '@/pages/home/components/MatchupSection';
import { ArenaCta, HowItWorks, PopularMatchups, UniverseSection } from '@/pages/home/components/HomeSections';
import {
  getCatalogCounts,
  getCharacterBySlug,
  getCharacterVersions,
  getSeriesList,
  getTopCharacters,
} from '@/services/characterService';
import type { CharacterSummary, FighterSlot, Series } from '@/types';

export default function Home() {
  const [searchParams] = useSearchParams();
  const [slotA, setSlotA] = useState<FighterSlot | null>(null);
  const [slotB, setSlotB] = useState<FighterSlot | null>(null);
  const [counts, setCounts] = useState({ characters: 0, series: 0, versions: 0 });
  const [series, setSeries] = useState<Series[]>([]);
  const [topCharacters, setTopCharacters] = useState<CharacterSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setError(null);
      try {
        const [catalogCounts, seriesList, top] = await Promise.all([
          getCatalogCounts(),
          getSeriesList(),
          getTopCharacters(16),
        ]);
        if (cancelled) return;
        setCounts(catalogCounts);
        setSeries(seriesList);
        setTopCharacters(top);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar el catalogo');
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const assignSlot = useCallback(async (side: 'a' | 'b', character: CharacterSummary) => {
    try {
      const versions = await getCharacterVersions(character.id);
      const sorted = [...versions].sort((a, b) => a.power_boost - b.power_boost);
      const slot: FighterSlot = {
        character,
        versions: sorted,
        versionId: sorted.length > 0 ? sorted[sorted.length - 1].id : null,
      };
      if (side === 'a') setSlotA(slot);
      else setSlotB(slot);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron cargar las versiones');
    }
  }, []);

  useEffect(() => {
    const slugA = searchParams.get('a');
    const slugB = searchParams.get('b');
    if (!slugA && !slugB) return undefined;
    let cancelled = false;

    const loadFromUrl = async () => {
      try {
        if (slugA) {
          const first = await getCharacterBySlug(slugA);
          if (first && !cancelled) await assignSlot('a', first);
        }
        if (slugB) {
          const second = await getCharacterBySlug(slugB);
          if (second && !cancelled) await assignSlot('b', second);
        }
      } catch {
        /* silencioso: el usuario puede elegir manualmente */
      }
    };

    loadFromUrl();
    return () => {
      cancelled = true;
    };
  }, [searchParams, assignSlot]);

  const handlePick = useCallback(
    async (slugA: string, slugB: string) => {
      try {
        const [first, second] = await Promise.all([getCharacterBySlug(slugA), getCharacterBySlug(slugB)]);
        if (first) await assignSlot('a', first);
        if (second) await assignSlot('b', second);
        window.setTimeout(() => {
          document.getElementById('matchup')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo cargar el enfrentamiento');
      }
    },
    [assignSlot],
  );

  const handleVersionChange = (side: 'a' | 'b', versionId: string) => {
    if (side === 'a') {
      setSlotA((prev) => (prev ? { ...prev, versionId } : prev));
    } else {
      setSlotB((prev) => (prev ? { ...prev, versionId } : prev));
    }
  };

  const handleCompare = () => {
    document.getElementById('matchup')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const quickPicks = useMemo(() => topCharacters.slice(0, 4), [topCharacters]);

  return (
    <div className="min-h-screen bg-background-950">
      <AppHeader />
      <main>
        {error && (
          <div className="mx-auto w-full max-w-[1400px] px-4 pt-4 md:px-8">
            <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-accent-500/40 bg-accent-950/40 px-4 py-3 text-sm text-accent-200 sm:flex-row sm:items-center">
              <span>No pudimos cargar los datos: {error}</span>
              <button
                type="button"
                onClick={() => setReloadKey((prev) => prev + 1)}
                className="cursor-pointer whitespace-nowrap rounded-lg border border-accent-500/50 px-3 py-1.5 text-xs font-semibold text-accent-100 hover:bg-accent-500/10"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        <HeroSection
          slotA={slotA}
          slotB={slotB}
          quickPicks={quickPicks}
          counts={counts}
          onSelectA={(character) => assignSlot('a', character)}
          onSelectB={(character) => assignSlot('b', character)}
          onClearA={() => setSlotA(null)}
          onClearB={() => setSlotB(null)}
          onCompare={handleCompare}
        />

        <MatchupSection slotA={slotA} slotB={slotB} onVersionChange={handleVersionChange} />

        <PopularMatchups characters={topCharacters} onPick={handlePick} />

        <UniverseSection series={series} />

        <HowItWorks />

        <ArenaCta />
      </main>
      <AppFooter />
    </div>
  );
}