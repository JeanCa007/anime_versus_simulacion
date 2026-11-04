import CharacterAvatar from '@/components/feature/CharacterAvatar';

export interface VersusFighter {
  name: string;
  image: string | null;
  series: string | null;
  version: string | null;
  archetype?: string;
  slug?: string | null;
}

interface VersusHeaderProps {
  sideA: VersusFighter;
  sideB: VersusFighter;
  winnerSide?: 'a' | 'b' | null;
  backgroundImage?: string;
}

function FighterPanel({
  fighter,
  side,
  isWinner,
}: {
  fighter: VersusFighter;
  side: 'a' | 'b';
  isWinner: boolean;
}) {
  const accentBorder = side === 'a' ? 'border-primary-500/50' : 'border-accent-500/50';
  const accentText = side === 'a' ? 'text-primary-300' : 'text-accent-300';

  return (
    <div className="flex w-full flex-col items-center text-center">
      <div
        className={`relative w-full max-w-[240px] overflow-hidden rounded-2xl border-2 bg-background-900 ${
          isWinner ? 'border-foreground-50/80 shadow-2xl shadow-primary-950/60' : accentBorder
        }`}
      >
        {fighter.image ? (
          <img
            src={fighter.image}
            alt={`Retrato de ${fighter.name}`}
            title={`${fighter.name} - personaje de anime`}
            className="h-56 w-full object-cover object-top md:h-72"
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center bg-background-900 md:h-72">
            <CharacterAvatar
              name={fighter.name}
              archetype={fighter.archetype}
              className="h-24 w-24"
              textClassName="text-3xl"
            />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background-950 via-background-950/10 to-transparent" />

        {isWinner && (
          <span className="absolute left-1/2 top-3 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-foreground-50 px-2.5 py-1 font-label text-[10px] uppercase text-background-950">
            <i className="ri-trophy-fill" />
            Ganador
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="truncate font-heading text-base font-bold text-foreground-50 md:text-lg">
            {fighter.name}
          </p>
          <p className={`truncate font-label text-[10px] uppercase ${accentText}`}>
            {fighter.version ?? 'Sin version'}
          </p>
        </div>
      </div>
      <p className="mt-2 max-w-[240px] truncate text-xs text-foreground-500">{fighter.series}</p>
    </div>
  );
}

export default function VersusHeader({ sideA, sideB, winnerSide = null, backgroundImage }: VersusHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-background-800 bg-background-900/60">
      {backgroundImage && (
        <img
          src={backgroundImage}
          alt="Arena de combate"
          title="Arena de combate"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-25"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background-950/60 via-background-950/80 to-background-950" />
      <div className="arena-grid pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative flex flex-col items-center gap-4 p-5 md:gap-6 md:p-8">
        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 md:gap-8">
          <FighterPanel fighter={sideA} side="a" isWinner={winnerSide === 'a'} />
          <div className="flex flex-col items-center gap-2">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-background-600 bg-background-950/90 font-label text-xs text-foreground-300 md:h-14 md:w-14 md:text-sm">
              VS
            </span>
            <span className="hidden font-label text-[9px] uppercase text-foreground-600 md:block">
              Battle arena
            </span>
          </div>
          <FighterPanel fighter={sideB} side="b" isWinner={winnerSide === 'b'} />
        </div>
      </div>
    </section>
  );
}