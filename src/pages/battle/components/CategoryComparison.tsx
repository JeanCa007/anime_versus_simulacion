import { BATTLE_CATEGORIES, getCategoryScore } from '@/lib/battleCategories';
import type { BattleScoreMap } from '@/types/battle';
import type { CharacterVersion } from '@/types';

interface CategoryComparisonProps {
  scores: BattleScoreMap | null;
  versionA: CharacterVersion | null;
  versionB: CharacterVersion | null;
  nameA: string;
  nameB: string;
}

function matchesName(value: string, name: string): boolean {
  const normalizedValue = value.trim().toLowerCase();
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedValue) return false;
  if (normalizedValue === normalizedName) return true;
  if (normalizedName.length >= 5 && normalizedValue.includes(normalizedName)) return true;
  if (normalizedValue.length >= 5 && normalizedName.includes(normalizedValue)) return true;
  return false;
}

export function resolveWinnerSide(
  scoreWinner: string,
  nameA: string,
  nameB: string,
  valueA: number,
  valueB: number,
): 'a' | 'b' | 'draw' {
  const winner = scoreWinner.trim().toLowerCase();
  if (winner === 'a' || winner === 'charactera' || winner === 'charactersa') return 'a';
  if (winner === 'b' || winner === 'characterb' || winner === 'charactersb') return 'b';
  if (matchesName(scoreWinner, nameA)) return 'a';
  if (matchesName(scoreWinner, nameB)) return 'b';
  if (valueA > valueB) return 'a';
  if (valueB > valueA) return 'b';
  return 'draw';
}

export default function CategoryComparison({
  scores,
  versionA,
  versionB,
  nameA,
  nameB,
}: CategoryComparisonProps) {
  return (
    <section>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-label text-[11px] uppercase text-primary-300">Comparacion</span>
          <h2 className="mt-1.5 font-heading text-2xl font-bold text-foreground-50">
            Categoria por categoria
          </h2>
        </div>
        <p className="max-w-md text-xs text-foreground-500">
          Puntuacion 0-100 con la razon del analisis. El ganador de cada fila no decide el combate por si solo.
        </p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {BATTLE_CATEGORIES.map((category) => {
          const score = getCategoryScore(scores, category, versionA, versionB);
          const side = resolveWinnerSide(
            score.winner,
            nameA,
            nameB,
            score.characterA,
            score.characterB,
          );

          return (
            <article
              key={category.key}
              className="rounded-2xl border border-background-800 bg-background-900/60 p-4 transition-colors hover:border-background-700"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-label text-[10px] uppercase text-foreground-400">{category.label}</h3>
                <span
                  className={`truncate rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    side === 'a'
                      ? 'bg-primary-500/15 text-primary-200'
                      : side === 'b'
                        ? 'bg-accent-500/15 text-accent-200'
                        : 'bg-background-800 text-foreground-400'
                  }`}
                >
                  {side === 'a' ? nameA : side === 'b' ? nameB : 'Empate'}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span
                  className={`w-9 text-lg font-bold ${
                    side === 'a' ? 'text-primary-300' : 'text-foreground-300'
                  }`}
                >
                  {score.characterA}
                </span>
                <div className="flex flex-1 items-center gap-1">
                  <div className="flex flex-1 justify-end overflow-hidden rounded-full bg-background-800">
                    <div
                      className="h-1.5 rounded-full bg-primary-500"
                      style={{ width: `${score.characterA}%` }}
                    />
                  </div>
                  <div className="flex flex-1 overflow-hidden rounded-full bg-background-800">
                    <div
                      className="h-1.5 rounded-full bg-accent-500"
                      style={{ width: `${score.characterB}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`w-9 text-right text-lg font-bold ${
                    side === 'b' ? 'text-accent-300' : 'text-foreground-300'
                  }`}
                >
                  {score.characterB}
                </span>
              </div>

              {score.reason ? (
                <p className="mt-3 text-xs leading-relaxed text-foreground-400">{score.reason}</p>
              ) : (
                <p className="mt-3 text-xs italic text-foreground-600">
                  Sin explicacion registrada para esta categoria.
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}