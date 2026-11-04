import { ARCHETYPE_LABELS } from '@/lib/stats';
import type { Series } from '@/types';

const ARCHETYPES = ['brawler', 'speedster', 'tank', 'hax', 'technique', 'regenerator', 'balanced'];

interface FilterBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  seriesSlug: string;
  onSeriesChange: (value: string) => void;
  archetype: string;
  onArchetypeChange: (value: string) => void;
  sort: 'popularity' | 'power' | 'name';
  onSortChange: (value: 'popularity' | 'power' | 'name') => void;
  seriesOptions: Series[];
  total: number;
}

export default function FilterBar({
  query,
  onQueryChange,
  seriesSlug,
  onSeriesChange,
  archetype,
  onArchetypeChange,
  sort,
  onSortChange,
  seriesOptions,
  total,
}: FilterBarProps) {
  return (
    <div className="rounded-2xl border border-background-800 bg-background-900/60 p-4 md:p-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <i className="ri-search-line pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-foreground-500" />
          <input
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por nombre, alias, anime o version..."
            aria-label="Buscar personaje"
            className="w-full rounded-xl border border-background-700 bg-background-950 py-3 pl-10 pr-3 text-sm text-foreground-100 outline-none transition-colors placeholder:text-foreground-600 focus:border-primary-500/70"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={seriesSlug}
            onChange={(event) => onSeriesChange(event.target.value)}
            aria-label="Filtrar por universo"
            className="cursor-pointer rounded-xl border border-background-700 bg-background-950 px-3 py-3 text-sm text-foreground-200 outline-none focus:border-primary-500/70"
          >
            <option value="">Todos los universos</option>
            {seriesOptions.map((item) => (
              <option key={item.id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as 'popularity' | 'power' | 'name')}
            aria-label="Ordenar personajes"
            className="cursor-pointer rounded-xl border border-background-700 bg-background-950 px-3 py-3 text-sm text-foreground-200 outline-none focus:border-primary-500/70"
          >
            <option value="popularity">Mas populares</option>
            <option value="power">Mas poderosos</option>
            <option value="name">A - Z</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onArchetypeChange('')}
          className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            archetype === ''
              ? 'bg-primary-500 text-background-50'
              : 'border border-background-700 text-foreground-300 hover:border-primary-500/50'
          }`}
        >
          Todos
        </button>
        {ARCHETYPES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onArchetypeChange(item)}
            className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              archetype === item
                ? 'bg-primary-500 text-background-50'
                : 'border border-background-700 text-foreground-300 hover:border-primary-500/50'
            }`}
          >
            {ARCHETYPE_LABELS[item]}
          </button>
        ))}
        <span className="ml-auto font-label text-[11px] uppercase text-foreground-500">
          {total} resultados
        </span>
      </div>
    </div>
  );
}