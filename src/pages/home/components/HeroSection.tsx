import { Link } from 'react-router-dom';
import CharacterSearchInput from '@/components/feature/CharacterSearchInput';
import type { CharacterSummary, FighterSlot } from '@/types';

interface HeroSectionProps {
  slotA: FighterSlot | null;
  slotB: FighterSlot | null;
  quickPicks: CharacterSummary[];
  counts: { characters: number; series: number; versions: number };
  onSelectA: (character: CharacterSummary) => void;
  onSelectB: (character: CharacterSummary) => void;
  onClearA: () => void;
  onClearB: () => void;
  onCompare: () => void;
}

export default function HeroSection({
  slotA,
  slotB,
  quickPicks,
  counts,
  onSelectA,
  onSelectB,
  onClearA,
  onClearB,
  onCompare,
}: HeroSectionProps) {
  const ready = Boolean(slotA && slotB);

  const battleLink =
    slotA && slotB
      ? `/battle?a=${slotA.character.slug}${slotA.versionId ? `&av=${slotA.versionId}` : ''}&b=${
          slotB.character.slug
        }${slotB.versionId ? `&bv=${slotB.versionId}` : ''}`
      : '/battle';

  const handleQuickPick = (character: CharacterSummary) => {
    if (!slotA) {
      onSelectA(character);
      return;
    }
    onSelectB(character);
  };

  return (
    <section className="relative w-full overflow-hidden border-b border-background-800">
      <img
        src="https://readdy.ai/api/search-image?query=dark-futuristic-anime-battle-arena-with-glowing-violet-energy-pillars-and-floating-particles-cinematic-wide-shot-deep-navy-and-black-tones-atmospheric-fog&width=1920&height=1080&seq=arena-hero-bg-01&orientation=landscape"
        alt="Arena de combate futurista"
        title="Anime Battle Arena - arena de combate"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center opacity-30"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background-950/70 via-background-950/85 to-background-950" />
      <div className="arena-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 py-14 md:px-8 md:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary-500/40 bg-primary-500/10 px-3 py-1.5 font-label text-[10px] uppercase text-primary-200">
              <i className="ri-flashlight-fill" />
              Comparador de poder · datos en vivo
            </span>

            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-[1.05] md:text-6xl">
              <span className="text-gradient-hero">Quien ganaria</span>
              <br />
              <span className="text-foreground-50">de verdad?</span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-foreground-300 md:text-base">
              Nada de power levels sueltos. Elige dos personajes, ajusta sus versiones y compara fuerza,
              velocidad, resistencia, hax, battle IQ y regeneracion lado a lado.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 md:gap-4">
              {[
                { value: counts.characters, label: 'Personajes' },
                { value: counts.series, label: 'Universos' },
                { value: counts.versions, label: 'Versiones' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-background-800 bg-background-900/70 px-3 py-3 backdrop-blur md:px-4"
                >
                  <p className="font-heading text-xl font-bold text-foreground-50 md:text-2xl">
                    {item.value || '—'}
                  </p>
                  <p className="font-label text-[10px] uppercase text-foreground-500">{item.label}</p>
                </div>
              ))}
            </div>

            {quickPicks.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="font-label text-[10px] uppercase text-foreground-500">Prueba con</span>
                {quickPicks.map((character) => (
                  <button
                    key={character.id}
                    type="button"
                    onClick={() => handleQuickPick(character)}
                    className="cursor-pointer rounded-full border border-background-700 bg-background-900/70 px-3 py-1.5 text-xs text-foreground-300 transition-colors hover:border-primary-500/60 hover:text-foreground-50"
                  >
                    {character.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="animate-rise rounded-3xl border border-background-700/80 bg-background-900/70 p-4 shadow-2xl shadow-background-950/60 backdrop-blur-xl md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-label text-[11px] uppercase text-foreground-400">Nuevo enfrentamiento</span>
              <span className="flex items-center gap-1 rounded-full bg-background-950/80 px-2 py-1 font-label text-[10px] uppercase text-foreground-500">
                <i className="ri-live-line text-accent-400" />
                Live
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <CharacterSearchInput
                side="a"
                label="Combatiente A"
                selected={slotA?.character ?? null}
                onSelect={onSelectA}
                onClear={onClearA}
              />

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-background-700" />
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-background-700 bg-background-950 font-label text-[11px] text-foreground-400">
                  VS
                </span>
                <span className="h-px flex-1 bg-background-700" />
              </div>

              <CharacterSearchInput
                side="b"
                label="Combatiente B"
                selected={slotB?.character ?? null}
                onSelect={onSelectB}
                onClear={onClearB}
              />
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                to={battleLink}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-3.5 text-sm font-semibold transition-colors ${
                  ready
                    ? 'bg-primary-500 text-background-50 hover:bg-primary-600'
                    : 'pointer-events-none bg-background-800 text-foreground-600'
                }`}
              >
                <i className="ri-flashlight-fill text-base" />
                Simular batalla
              </Link>
              <button
                type="button"
                onClick={onCompare}
                disabled={!ready}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-background-700 px-4 py-3.5 text-sm font-medium text-foreground-200 transition-colors hover:border-primary-500/60 disabled:cursor-not-allowed disabled:border-background-800 disabled:text-foreground-600"
              >
                <i className="ri-bar-chart-grouped-line text-base" />
                Comparar stats
              </button>
            </div>

            <p className="mt-3 text-center text-[11px] text-foreground-500">
              {ready
                ? 'Listo. Puedes comparar las estadisticas o saltar directo al simulador.'
                : 'Selecciona dos personajes para activar el combate.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}