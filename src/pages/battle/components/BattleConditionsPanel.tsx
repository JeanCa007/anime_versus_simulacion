import { CONDITION_GROUPS } from '@/lib/battleConditions';
import type { BattleConditions } from '@/types/battle';

interface BattleConditionsPanelProps {
  conditions: BattleConditions;
  onChange: (next: BattleConditions) => void;
}

export default function BattleConditionsPanel({ conditions, onChange }: BattleConditionsPanelProps) {
  const setValue = (key: keyof BattleConditions, value: string) => {
    onChange({ ...conditions, [key]: value } as BattleConditions);
  };

  return (
    <div className="rounded-2xl border border-background-800 bg-background-900/60 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-base font-semibold text-foreground-50">
            Condiciones de combate
          </h2>
          <p className="mt-1 text-xs text-foreground-500">
            Cada ajuste cambia el analisis: el motor de IA recibe estas condiciones junto a los datos.
          </p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-background-700 text-foreground-400">
          <i className="ri-equalizer-line" />
        </span>
      </div>

      <div className="mt-5 space-y-5">
        {CONDITION_GROUPS.map((group) => (
          <div key={group.key}>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-background-800/80 text-[11px] text-foreground-400">
                <i className={group.icon} />
              </span>
              <span className="font-label text-[10px] uppercase text-foreground-400">{group.label}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {group.options.map((option) => {
                const active = conditions[group.key] === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue(group.key, option.value)}
                    title={option.hint}
                    className={`cursor-pointer whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? 'border-primary-500 bg-primary-500/15 text-primary-100'
                        : 'border-background-700 text-foreground-400 hover:border-background-600 hover:text-foreground-100'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}