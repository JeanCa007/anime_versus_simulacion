import { Link } from 'react-router-dom';
import CharacterAvatar from '@/components/feature/CharacterAvatar';
import { ARCHETYPE_LABELS } from '@/lib/stats';
import type { CharacterSummary } from '@/types';

interface CharacterCardProps {
  character: CharacterSummary;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const versionList = character.versions ? character.versions.split(' | ') : [];

  return (
    <Link
      to={`/character/${character.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-background-800 bg-background-900 transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-950/50"
    >
      <div className="relative h-44 w-full overflow-hidden">
        <CharacterAvatar
          name={character.name}
          image={character.main_image_url || character.thumbnail_url}
          archetype={character.archetype}
          rounded="rounded-none"
          className="h-full w-full border-0"
          textClassName="text-4xl"
        />
        <span className="absolute left-3 top-3 rounded-full border border-background-700/80 bg-background-950/80 px-2.5 py-1 font-label text-[10px] uppercase text-foreground-300 backdrop-blur">
          {character.universe ?? character.series_name}
        </span>
        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-background-950/80 px-2.5 py-1 font-label text-[10px] text-accent-300 backdrop-blur">
          <i className="ri-fire-fill" />
          {character.popularity}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-base font-semibold text-foreground-50">{character.name}</h3>
        <p className="mt-0.5 truncate text-xs text-foreground-500">
          {character.alias || character.series_name}
        </p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {versionList.slice(0, 3).map((version) => (
            <span
              key={version}
              className="rounded-md border border-background-700 bg-background-950/60 px-2 py-0.5 text-[10px] text-foreground-400"
            >
              {version}
            </span>
          ))}
          {versionList.length > 3 && (
            <span className="rounded-md border border-background-700 bg-background-950/60 px-2 py-0.5 text-[10px] text-foreground-500">
              +{versionList.length - 3}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-label text-[10px] uppercase text-foreground-500">
            {ARCHETYPE_LABELS[character.archetype] ?? character.archetype}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-primary-300 opacity-0 transition-opacity group-hover:opacity-100">
            Ver ficha
            <i className="ri-arrow-right-line" />
          </span>
        </div>
      </div>
    </Link>
  );
}