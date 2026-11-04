import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import AppHeader from '@/components/feature/AppHeader';
import AppFooter from '@/components/feature/AppFooter';
import CharacterAvatar from '@/components/feature/CharacterAvatar';
import {
  ARCHETYPE_LABELS,
  STAT_KEYS,
  STAT_LABELS,
  getVersionPower,
  type StatKey,
} from '@/lib/stats';
import { getCharacterBySlug, getCharacterVersions } from '@/services/characterService';
import type { CharacterSummary, CharacterVersion } from '@/types';

export default function CharacterDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [character, setCharacter] = useState<CharacterSummary | null>(null);
  const [versions, setVersions] = useState<CharacterVersion[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!slug) return undefined;
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const found = await getCharacterBySlug(slug);
        if (cancelled) return;
        if (!found) {
          setCharacter(null);
          setError('No encontramos ese personaje.');
          return;
        }
        setCharacter(found);
        const versionList = await getCharacterVersions(found.id);
        if (cancelled) return;
        const sorted = [...versionList].sort((a, b) => a.power_boost - b.power_boost);
        setVersions(sorted);
        setSelectedId(sorted.length > 0 ? sorted[sorted.length - 1].id : null);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudo cargar el personaje');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [slug, reloadKey]);

  const selectedVersion = useMemo(
    () => versions.find((version) => version.id === selectedId) ?? null,
    [versions, selectedId],
  );

  const radarData = useMemo(
    () =>
      STAT_KEYS.map((key) => ({
        stat: STAT_LABELS[key],
        valor: selectedVersion ? selectedVersion[key] : 0,
      })),
    [selectedVersion],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background-950">
        <AppHeader />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-8">
          <div className="h-48 animate-pulse rounded-3xl bg-background-900" />
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="h-72 animate-pulse rounded-2xl bg-background-900/70 lg:col-span-2" />
            <div className="h-72 animate-pulse rounded-2xl bg-background-900/70" />
          </div>
        </main>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-background-950">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 py-24 text-center md:px-8">
          <i className="ri-user-unfollow-line text-4xl text-foreground-600" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground-50">Personaje no disponible</h1>
          <p className="mt-2 max-w-md text-sm text-foreground-500">
            {error ?? 'Puede que el personaje ya no exista en el catalogo.'}
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              to="/characters"
              className="rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 hover:bg-primary-600"
            >
              Volver al catalogo
            </Link>
            <button
              type="button"
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="cursor-pointer rounded-xl border border-background-700 px-4 py-2.5 text-sm font-medium text-foreground-200 hover:border-primary-500/60"
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-950">
      <AppHeader />

      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
        <div className="flex items-center gap-2 text-xs text-foreground-500">
          <Link to="/" className="hover:text-foreground-200">
            Inicio
          </Link>
          <i className="ri-arrow-right-s-line" />
          <Link to="/characters" className="hover:text-foreground-200">
            Personajes
          </Link>
          <i className="ri-arrow-right-s-line" />
          <span className="text-foreground-300">{character.name}</span>
        </div>

        <section className="mt-5 overflow-hidden rounded-3xl border border-background-800 bg-background-900/60">
          <div className="grid grid-cols-1 gap-6 p-5 md:grid-cols-[260px_1fr] md:p-8">
            <div className="flex flex-col items-center gap-4">
              <CharacterAvatar
                name={character.name}
                image={character.main_image_url || character.thumbnail_url}
                archetype={character.archetype}
                rounded="rounded-2xl"
                className="h-56 w-56"
                textClassName="text-6xl"
              />
              <div className="w-full rounded-xl border border-background-800 bg-background-950/70 p-4 text-center">
                <p className="font-heading text-3xl font-bold text-foreground-50">
                  {getVersionPower(selectedVersion)}
                </p>
                <p className="font-label text-[10px] uppercase text-foreground-500">Indice de poder</p>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-primary-500/40 bg-primary-500/10 px-3 py-1 font-label text-[10px] uppercase text-primary-200">
                  {character.universe ?? character.series_name}
                </span>
                <span className="rounded-full border border-background-700 px-3 py-1 font-label text-[10px] uppercase text-foreground-400">
                  {ARCHETYPE_LABELS[character.archetype] ?? character.archetype}
                </span>
                <span className="flex items-center gap-1 rounded-full border border-accent-500/40 px-3 py-1 font-label text-[10px] uppercase text-accent-300">
                  <i className="ri-fire-fill" />
                  {character.popularity} popularidad
                </span>
              </div>

              <h1 className="mt-4 font-heading text-3xl font-extrabold text-foreground-50 md:text-4xl">
                {character.name}
              </h1>
              <p className="mt-1 text-sm text-foreground-400">
                {character.alias || character.series_name} · {character.series_name}
              </p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground-300">
                {character.description}
              </p>

              <div className="mt-6">
                <p className="font-label text-[11px] uppercase text-foreground-500">Versiones disponibles</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {versions.map((version) => (
                    <button
                      key={version.id}
                      type="button"
                      onClick={() => setSelectedId(version.id)}
                      className={`cursor-pointer whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                        version.id === selectedId
                          ? 'bg-primary-500 text-background-50'
                          : 'border border-background-700 text-foreground-300 hover:border-primary-500/60'
                      }`}
                    >
                      {version.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to={`/?a=${character.slug}`}
                  className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
                >
                  <i className="ri-sword-line" />
                  Llevar al comparador
                </Link>
                <Link
                  to="/characters"
                  className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-background-700 px-4 py-2.5 text-sm font-medium text-foreground-200 transition-colors hover:border-primary-500/60"
                >
                  <i className="ri-grid-line" />
                  Ver mas personajes
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-background-800 bg-background-900/60 p-5">
            <h2 className="font-heading text-base font-semibold text-foreground-50">
              Estadisticas · {selectedVersion?.name ?? 'Sin version'}
            </h2>
            <div className="mt-4 space-y-3">
              {STAT_KEYS.map((key: StatKey) => {
                const value = selectedVersion ? selectedVersion[key] : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-foreground-400">{STAT_LABELS[key]}</span>
                      <span className="font-semibold text-foreground-100">{value}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-background-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent-500"
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-background-800 bg-background-900/60 p-5">
            <h2 className="font-heading text-base font-semibold text-foreground-50">Perfil de combate</h2>
            <div className="mt-2 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="70%">
                  <PolarGrid stroke="oklch(var(--background-700))" />
                  <PolarAngleAxis
                    dataKey="stat"
                    tick={{ fill: 'oklch(var(--foreground-400))', fontSize: 10 }}
                  />
                  <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    dataKey="valor"
                    stroke="oklch(var(--primary-400))"
                    fill="oklch(var(--primary-500))"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3 border-t border-background-800 pt-4 text-xs">
              <div>
                <p className="font-label text-[10px] uppercase text-foreground-500">Universo</p>
                <p className="mt-1 text-foreground-200">{character.universe ?? character.series_name}</p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase text-foreground-500">Tipo de obra</p>
                <p className="mt-1 capitalize text-foreground-200">{character.series_type}</p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase text-foreground-500">Version</p>
                <p className="mt-1 text-foreground-200">{selectedVersion?.name ?? '—'}</p>
              </div>
              <div>
                <p className="font-label text-[10px] uppercase text-foreground-500">Canon</p>
                <p className="mt-1 text-foreground-200">{selectedVersion?.canon_status ?? '—'}</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <AppFooter />
    </div>
  );
}