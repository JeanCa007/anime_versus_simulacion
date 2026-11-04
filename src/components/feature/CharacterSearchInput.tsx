import { useEffect, useRef, useState } from 'react';
import CharacterAvatar from '@/components/feature/CharacterAvatar';
import { useCharacterSearch } from '@/hooks/useCharacterSearch';
import type { CharacterSummary } from '@/types';

interface CharacterSearchInputProps {
  side: 'a' | 'b';
  label: string;
  selected: CharacterSummary | null;
  onSelect: (character: CharacterSummary) => void;
  onClear: () => void;
}

export default function CharacterSearchInput({
  side,
  label,
  selected,
  onSelect,
  onClear,
}: CharacterSearchInputProps) {
  const { term, setTerm, results, loading, error } = useCharacterSearch();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [term]);

  const pick = (character: CharacterSummary) => {
    onSelect(character);
    setTerm('');
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      pick(results[activeIndex]);
    }
    if (event.key === 'Escape') {
      setOpen(false);
    }
  };

  const accentBorder = side === 'a' ? 'border-primary-500/60' : 'border-accent-500/60';
  const accentText = side === 'a' ? 'text-primary-300' : 'text-accent-300';

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="mb-2 flex items-center justify-between">
        <span className={`font-label text-[11px] uppercase ${accentText}`}>{label}</span>
        {selected && (
          <button
            type="button"
            onClick={onClear}
            className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 font-label text-[10px] uppercase text-foreground-500 transition-colors hover:text-foreground-200"
          >
            <i className="ri-close-line" />
            Quitar
          </button>
        )}
      </div>

      {selected ? (
        <div className={`flex items-center gap-3 rounded-2xl border ${accentBorder} bg-background-900/80 p-3`}>
          <CharacterAvatar
            name={selected.name}
            image={selected.thumbnail_url || selected.main_image_url}
            archetype={selected.archetype}
            className="h-14 w-14"
          />
          <div className="min-w-0">
            <p className="truncate font-heading text-sm font-semibold text-foreground-50">{selected.name}</p>
            <p className="truncate text-xs text-foreground-400">{selected.series_name}</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <i className="ri-search-line pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-base text-foreground-500" />
          <input
            type="text"
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Busca un personaje, anime o version..."
            aria-label={label}
            className="w-full rounded-2xl border border-background-700 bg-background-900/80 py-3.5 pl-10 pr-3 text-sm text-foreground-100 outline-none transition-colors placeholder:text-foreground-600 focus:border-primary-500/70"
          />
          {loading && (
            <i className="ri-loader-4-line absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-base text-foreground-500" />
          )}
        </div>
      )}

      {open && !selected && term.trim().length >= 2 && (
        <div className="animate-slide absolute left-0 right-0 top-full z-30 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-background-700 bg-background-900 p-1.5 shadow-2xl shadow-background-950/80">
          {error && <p className="px-3 py-3 text-xs text-accent-300">{error}</p>}
          {!error && results.length === 0 && !loading && (
            <p className="px-3 py-3 text-xs text-foreground-500">Sin resultados para esa busqueda.</p>
          )}
          {results.map((character, index) => {
            const versionList = character.versions ? character.versions.split(' | ') : [];
            return (
              <button
                key={character.id}
                type="button"
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => pick(character)}
                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors ${
                  index === activeIndex ? 'bg-background-800' : 'hover:bg-background-800/70'
                }`}
              >
                <CharacterAvatar
                  name={character.name}
                  image={character.thumbnail_url || character.main_image_url}
                  archetype={character.archetype}
                  className="h-10 w-10"
                  textClassName="text-xs"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground-100">{character.name}</span>
                  <span className="block truncate text-xs text-foreground-500">
                    {character.series_name} · {versionList.length} versiones
                  </span>
                </span>
                <i className="ri-arrow-right-up-line text-base text-foreground-600" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}