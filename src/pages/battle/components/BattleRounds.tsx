import type { BattleRoundRecord } from '@/types/battle';

interface BattleRoundsProps {
  rounds: BattleRoundRecord[];
  nameA: string;
  nameB: string;
}

export default function BattleRounds({ rounds, nameA, nameB }: BattleRoundsProps) {
  if (rounds.length === 0) {
    return (
      <section>
        <span className="font-label text-[11px] uppercase text-accent-300">Simulacion</span>
        <h2 className="mt-1.5 font-heading text-2xl font-bold text-foreground-50">Rondas del combate</h2>
        <div className="mt-4 rounded-2xl border border-dashed border-background-700 bg-background-900/40 px-5 py-10 text-center">
          <i className="ri-time-line text-2xl text-foreground-600" />
          <p className="mt-2 text-sm text-foreground-500">
            Esta batalla no tiene rondas guardadas. Vuelve a simularla para generar la secuencia completa.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-label text-[11px] uppercase text-accent-300">Simulacion</span>
          <h2 className="mt-1.5 font-heading text-2xl font-bold text-foreground-50">
            Desarrollo del combate
          </h2>
        </div>
        <p className="max-w-md text-xs text-foreground-500">
          Cada ronda usa las habilidades reales de {nameA} y {nameB}.
        </p>
      </div>

      <ol className="mt-5 space-y-3">
        {rounds.map((round, index) => {
          const isLast = index === rounds.length - 1;
          return (
            <li
              key={round.id}
              className={`relative rounded-2xl border p-4 md:p-5 ${
                isLast
                  ? 'border-primary-500/40 bg-gradient-to-br from-primary-950/40 via-background-900 to-accent-950/30'
                  : 'border-background-800 bg-background-900/60'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 font-label text-[11px] uppercase ${
                    isLast ? 'bg-primary-500 text-background-50' : 'bg-background-800 text-foreground-300'
                  }`}
                >
                  {isLast ? 'Final' : `R${round.round_number}`}
                </span>
                <h3 className="font-heading text-sm font-semibold text-foreground-50">
                  {round.title ?? `Ronda ${round.round_number}`}
                </h3>
                {round.winner_name && (
                  <span className="ml-auto flex items-center gap-1 rounded-full border border-background-700 px-2 py-0.5 text-[10px] text-foreground-300">
                    <i className="ri-arrow-up-line text-primary-300" />
                    {round.winner_name}
                  </span>
                )}
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-foreground-400">{round.description}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}