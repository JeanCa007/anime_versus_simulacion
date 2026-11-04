import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AppHeader from '@/components/feature/AppHeader';
import AppFooter from '@/components/feature/AppFooter';
import CharacterCard from '@/components/feature/CharacterCard';
import FilterBar from '@/pages/characters/components/FilterBar';
import { getSeriesList, listCharacters } from '@/services/characterService';
import type { CharacterSummary, Series } from '@/types';

const PAGE_SIZE = 12;

export default function CharactersPage() {
  const [searchParams] = useSearchParams();
  const showUniverses = searchParams.get('view') === 'universes';

  const [seriesOptions, setSeriesOptions] = useState<Series[]>([]);
  const [items, setItems] = useState<CharacterSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [seriesSlug, setSeriesSlug] = useState(searchParams.get('series') ?? '');
  const [archetype, setArchetype] = useState('');
  const [sort, setSort] = useState<'popularity' | 'power' | 'name'>('popularity');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const loadSeries = async () => {
      try {
        const data = await getSeriesList();
        if (!cancelled) setSeriesOptions(data);
      } catch {
        if (!cancelled) setSeriesOptions([]);
      }
    };
    loadSeries();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (showUniverses) {
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const result = await listCharacters({
          query: debouncedQuery,
          seriesSlug,
          archetype,
          sort,
          page,
          pageSize: PAGE_SIZE,
        });
        if (!cancelled) {
          setItems(result.items);
          setTotal(result.total);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
          setError(err instanceof Error ? err.message : 'No se pudo cargar el catalogo');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, seriesSlug, archetype, sort, page, showUniverses, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    for (let index = 1; index <= totalPages; index += 1) {
      if (index === 1 || index === totalPages || Math.abs(index - page) <= 1) pages.push(index);
    }
    return pages;
  }, [totalPages, page]);

  const resetPage = () => setPage(1);

  return (
    <div className="min-h-screen bg-background-950">
      <AppHeader />

      <main className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-8 md:py-14">
        <div className="flex flex-col gap-2">
          <span className="font-label text-[11px] uppercase text-primary-300">Catalogo</span>
          <h1 className="font-heading text-3xl font-extrabold text-foreground-50 md:text-4xl">
            {showUniverses ? 'Universos disponibles' : 'Personajes de anime, manga y manhwa'}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-foreground-400">
            {showUniverses
              ? 'Cada universo reune sus personajes y versiones. Elige uno para filtrar el catalogo.'
              : 'Busca por nombre, alias, universo o incluso por el nombre exacto de una version, como Ultra Instinct.'}
          </p>
        </div>

        {showUniverses ? (
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {seriesOptions.map((item) => (
              <Link
                key={item.id}
                to={`/characters?series=${item.slug}`}
                className="group rounded-2xl border border-background-800 bg-background-900 p-5 transition-colors hover:border-primary-500/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate font-heading text-base font-semibold text-foreground-50">
                      {item.name}
                    </h2>
                    <p className="mt-1 font-label text-[10px] uppercase text-foreground-500">{item.type}</p>
                  </div>
                  <i className="ri-arrow-right-up-line text-base text-foreground-600 group-hover:text-primary-300" />
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-foreground-500">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <>
            <div className="mt-8">
              <FilterBar
                query={query}
                onQueryChange={setQuery}
                seriesSlug={seriesSlug}
                onSeriesChange={(value) => {
                  setSeriesSlug(value);
                  resetPage();
                }}
                archetype={archetype}
                onArchetypeChange={(value) => {
                  setArchetype(value);
                  resetPage();
                }}
                sort={sort}
                onSortChange={(value) => {
                  setSort(value);
                  resetPage();
                }}
                seriesOptions={seriesOptions}
                total={total}
              />
            </div>

            {error && (
              <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-xl border border-accent-500/40 bg-accent-950/40 px-4 py-3 text-sm text-accent-200 sm:flex-row sm:items-center">
                <span>{error}</span>
                <button
                  type="button"
                  onClick={() => setReloadKey((prev) => prev + 1)}
                  className="cursor-pointer whitespace-nowrap rounded-lg border border-accent-500/50 px-3 py-1.5 text-xs font-semibold text-accent-100 hover:bg-accent-500/10"
                >
                  Reintentar
                </button>
              </div>
            )}

            {loading ? (
              <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="h-72 animate-pulse rounded-2xl border border-background-800 bg-background-900/60"
                  />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="mt-10 rounded-2xl border border-dashed border-background-700 bg-background-900/40 px-6 py-16 text-center">
                <i className="ri-search-eye-line text-3xl text-foreground-600" />
                <p className="mt-3 font-heading text-base text-foreground-200">Sin resultados</p>
                <p className="mt-1 text-sm text-foreground-500">
                  Prueba con otro nombre o quita los filtros activos.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setDebouncedQuery('');
                    setSeriesSlug('');
                    setArchetype('');
                    setPage(1);
                  }}
                  className="mt-5 cursor-pointer rounded-xl border border-background-700 px-4 py-2 text-sm font-medium text-foreground-200 hover:border-primary-500/60"
                >
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.map((character) => (
                  <CharacterCard key={character.id} character={character} />
                ))}
              </div>
            )}

            {!loading && items.length > 0 && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  aria-label="Pagina anterior"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-background-700 text-foreground-300 transition-colors hover:border-primary-500/60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <i className="ri-arrow-left-s-line" />
                </button>
                {pageNumbers.map((pageNumber, index) => {
                  const previous = pageNumbers[index - 1];
                  const gap = previous && pageNumber - previous > 1;
                  return (
                    <span key={pageNumber} className="flex items-center gap-2">
                      {gap && <span className="text-xs text-foreground-600">...</span>}
                      <button
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        className={`h-9 min-w-9 cursor-pointer rounded-lg px-3 text-sm font-medium transition-colors ${
                          pageNumber === page
                            ? 'bg-primary-500 text-background-50'
                            : 'border border-background-700 text-foreground-300 hover:border-primary-500/60'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </span>
                  );
                })}
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  aria-label="Pagina siguiente"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-background-700 text-foreground-300 transition-colors hover:border-primary-500/60 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <i className="ri-arrow-right-s-line" />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <AppFooter />
    </div>
  );
}