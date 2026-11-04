import DifficultyBadge from '@/components/feature/DifficultyBadge';
import type { BattleRecord } from '@/types/battle';

interface BattleVerdictProps {
  battle: BattleRecord;
  nameA: string;
  nameB: string;
  winnerName: string;
  loserName: string;
  winnerSide: 'a' | 'b';
}

function ListCard({
  title,
  icon,
  items,
  accent,
  emptyText,
}: {
  title: string;
  icon: string;
  items: string[];
  accent: 'primary' | 'accent';
  emptyText: string;
}) {
  const accentText = accent === 'primary' ? 'text-primary-300' : 'text-accent-300';
  const accentBg = accent === 'primary' ? 'bg-primary-500/10' : 'bg-accent-500/10';

  return (
    <div className="rounded-2xl border border-background-800 bg-background-900/60 p-4 md:p-5">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentBg} ${accentText}`}>
          <i className={`${icon} text-sm`} />
        </span>
        <h3 className="font-heading text-sm font-semibold text-foreground-50">{title}</h3>
      </div>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex gap-2 text-xs leading-relaxed text-foreground-400">
              <i className={`ri-check-line mt-0.5 shrink-0 ${accentText}`} />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-xs italic text-foreground-600">{emptyText}</p>
      )}
    </div>
  );
}

export default function BattleVerdict({
  battle,
  nameA,
  nameB,
  winnerName,
  loserName,
  winnerSide,
}: BattleVerdictProps) {
  const winnerConditions = winnerSide === 'a' ? battle.win_conditions_a : battle.win_conditions_b;
  const loserConditions = winnerSide === 'a' ? battle.win_conditions_b : battle.win_conditions_a;
  const winnerAdvantages = winnerSide === 'a' ? battle.advantages_a : battle.advantages_b;
  const loserAdvantages = winnerSide === 'a' ? battle.advantages_b : battle.advantages_a;

  return (
    <section className="space-y-4">
      <div>
        <span className="font-label text-[11px] uppercase text-secondary-300">Conclusion</span>
        <h2 className="mt-1.5 font-heading text-2xl font-bold text-foreground-50">Veredicto final</h2>
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-background-700 bg-gradient-to-br from-primary-950/50 via-background-900 to-accent-950/40 p-5 md:p-7">
        <div className="arena-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-foreground-50 px-2.5 py-1 font-label text-[10px] uppercase text-background-950">
              <i className="ri-trophy-fill" />
              Ganador
            </span>
            <DifficultyBadge difficulty={battle.difficulty} size="sm" />
            <span className="rounded-full border border-background-700 px-2.5 py-1 font-label text-[10px] uppercase text-foreground-400">
              Confianza {battle.confidence}%
            </span>
          </div>

          <h3 className="mt-3 font-heading text-3xl font-extrabold text-foreground-50 md:text-4xl">
            {winnerName}
          </h3>
          <p className="mt-1 text-sm text-foreground-400">
            {battle.win_probability}% de probabilidad de victoria frente a {loserName} ({battle.loser_probability}%).
          </p>

          {battle.final_verdict && (
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground-200">
              {battle.final_verdict}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ListCard
          title={`Ventajas de ${winnerName}`}
          icon="ri-thumb-up-line"
          items={winnerAdvantages ?? []}
          accent={winnerSide === 'a' ? 'primary' : 'accent'}
          emptyText="El analisis no registro ventajas explicitas."
        />
        <ListCard
          title={`Ventajas de ${loserName}`}
          icon="ri-shield-star-line"
          items={loserAdvantages ?? []}
          accent={winnerSide === 'a' ? 'accent' : 'primary'}
          emptyText="El analisis no registro ventajas explicitas."
        />
        <ListCard
          title={`Como gana ${winnerName}`}
          icon="ri-crosshair-line"
          items={winnerConditions ?? []}
          accent={winnerSide === 'a' ? 'primary' : 'accent'}
          emptyText="No se registraron condiciones de victoria."
        />
        <ListCard
          title={`Como podria ganar ${loserName}`}
          icon="ri-route-line"
          items={loserConditions ?? []}
          accent={winnerSide === 'a' ? 'accent' : 'primary'}
          emptyText="No se registraron condiciones de victoria."
        />
      </div>

      <div className="rounded-2xl border border-background-800 bg-background-950/60 p-4 md:p-5">
        <div className="flex items-center gap-2">
          <i className="ri-sparkling-line text-primary-300" />
          <h3 className="font-heading text-sm font-semibold text-foreground-50">Resumen del analisis</h3>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-foreground-400">
          {battle.summary ?? 'Sin resumen registrado para esta batalla.'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-foreground-600">
          <span className="rounded-full border border-background-700 px-2 py-0.5 font-label uppercase">
            {battle.is_ai ? 'Analisis con IA' : 'Analisis del motor'}
          </span>
          {battle.ai_model && (
            <span className="rounded-full border border-background-700 px-2 py-0.5 font-label uppercase">
              {battle.ai_model}
            </span>
          )}
          <span className="rounded-full border border-background-700 px-2 py-0.5 font-label uppercase">
            {nameA} vs {nameB}
          </span>
        </div>
      </div>
    </section>
  );
}