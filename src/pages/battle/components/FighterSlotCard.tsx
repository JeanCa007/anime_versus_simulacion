import { Link } from 'react-router-dom';
import CharacterAvatar from '@/components/feature/CharacterAvatar';
import CharacterSearchInput from '@/components/feature/CharacterSearchInput';
import { getVersionPower } from '@/lib/stats';
import type { CharacterSummary, FighterSlot } from '@/types';

interface FighterSlotCardProps {
  side: 'a' | 'b';
  label: string;
  slot: FighterSlot | null;
  onSelect: (character: CharacterSummary) => void;
  onClear: () => void;
  onVersionChange: (versionId: string) => void;
}

export default function FighterSlotCard({
  side,
  label,
  slot,
  onSelect,
  onClear,
  onVersionChange,
}: FighterSlotCardProps) {
  const isPrimary = side === 'a';
  const accentBorder = isPrimary ? 'border-primary-500/40' : 'border-accent-500/40';
  const accentText = isPrimary ? 'text-primary-300' : 'text-accent-300';
  const selectedVersion = slot?.versions.find((version) => version.id === slot.versionId) ?? null;

  return (
    <div className={`rounded-2xl border ${accentBorder} bg-background-900/60 p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <span className={`font-label text-[10px] uppercase ${accentText}`}>{label}</span>
        {slot && (
          <span className="flex items-center gap-1 rounded-full bg-background-950/70 px-2 py-1 font-label text-[9px] uppercase text-foreground-500">
            <i className="ri-stack-line text-[10px]" />
            {slot.versions.length} versiones
          </span>
        )}
      </div>

      {slot ? (
        <div>
          <div className="flex items-center gap-3">
            <CharacterAvatar
              name={slot.character.name}
              image={slot.character.thumbnail_url || slot.character.main_image_url}
              archetype={slot.character.archetype}
              className="h-16 w-16"
            />
            <div className="min-w-0 flex-1">
              <Link
                to={`/character/${slot.character.slug}`}
                className="block truncate font-heading text-sm font-semibold text-foreground-50 hover:text-primary-300"
              >
                {slot.character.name}
              </Link>
              <p className="truncate text-xs text-foreground-500">{slot.character.series_name}</p>
            </div>
            <div className="text-right">
              <p className="font-heading text-xl font-bold text-foreground-50">
                {getVersionPower(selectedVersion)}
              </p>
              <p className="font-label text-[9px] uppercase text-foreground-600">Power</p>
            </div>
          </div>

          <label className="mt-4 block">
            <span className="font-label text-[10px] uppercase text-foreground-500">Version en combate</span>
            <select
              value={slot.versionId ?? ''}
              onChange={(event) => onVersionChange(event.target.value)}
              className="mt-1.5 w-full cursor-pointer rounded-xl border border-background-700 bg-background-950 px-3 py-2.5 text-sm text-foreground-100 outline-none transition-colors focus:border-primary-500/70"
            >
              {slot.versions.map((version) => (
                <option key={version.id} value={version.id}>
                  {version.name}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3 flex items-center justify-between">
            <Link
              to={`/character/${slot.character.slug}`}
              className="flex items-center gap-1 text-[11px] text-foreground-500 transition-colors hover:text-foreground-200"
            >
              <i className="ri-file-user-line" />
              Ver ficha
            </Link>
            <button
              type="button"
              onClick={onClear}
              className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-foreground-500 transition-colors hover:text-accent-300"
            >
              <i className="ri-close-line" />
              Cambiar
            </button>
          </div>
        </div>
      ) : (
        <CharacterSearchInput
          side={side}
          label={label}
          selected={null}
          onSelect={onSelect}
          onClear={onClear}
        />
      )}
    </div>
  );
}