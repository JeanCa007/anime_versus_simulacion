import { Link } from 'react-router-dom';
import CharacterAvatar from '@/components/feature/CharacterAvatar';
import type { CharacterSummary, Series } from '@/types';

const MATCHUPS: { a: string; b: string; title: string; tag: string }[] = [
  { a: 'gojo', b: 'sukuna', title: 'El duelo del siglo', tag: 'Hax vs tecnica' },
  { a: 'goku', b: 'vegeta', title: 'Rivalidad eterna', tag: 'Saiyajin' },
  { a: 'sung-jin-woo', b: 'zoro', title: 'Monarcas del nuevo mundo', tag: 'Manhwa vs manga' },
  { a: 'naruto', b: 'ichigo', title: 'Hokage vs Shinigami', tag: 'Chakra vs reiatsu' },
  { a: 'luffy', b: 'madara', title: 'Libertad contra el Sharingan', tag: 'Yonko vs Uchiha' },
  { a: 'aizen', b: 'sasuke', title: 'Ilusion contra ilusion', tag: 'Genjutsu' },
];

interface PopularMatchupsProps {
  characters: CharacterSummary[];
  onPick: (slugA: string, slugB: string) => void;
}

export function PopularMatchups({ characters, onPick }: PopularMatchupsProps) {
  const findCharacter = (slug: string) => characters.find((item) => item.slug === slug) ?? null;

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-14 md:px-8 md:py-16">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-label text-[11px] uppercase text-accent-300">Debates clasicos</span>
          <h2 className="mt-2 font-heading text-2xl font-bold text-foreground-50 md:text-3xl">
            Enfrentamientos populares
          </h2>
        </div>
        <span className="text-sm text-foreground-500">Pulsa una tarjeta para cargarla en el comparador.</span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MATCHUPS.map((match) => {
          const fighterA = findCharacter(match.a);
          const fighterB = findCharacter(match.b);
          if (!fighterA || !fighterB) return null;

          return (
            <button
              key={match.title}
              type="button"
              onClick={() => onPick(match.a, match.b)}
              className="group cursor-pointer rounded-2xl border border-background-800 bg-background-900 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-950/40"
            >
              <div className="flex items-center gap-3">
                <CharacterAvatar
                  name={fighterA.name}
                  image={fighterA.thumbnail_url}
                  archetype={fighterA.archetype}
                  className="h-14 w-14"
                  textClassName="text-sm"
                />
                <div className="flex-1 text-center">
                  <span className="font-label text-[10px] uppercase text-foreground-500">VS</span>
                </div>
                <CharacterAvatar
                  name={fighterB.name}
                  image={fighterB.thumbnail_url}
                  archetype={fighterB.archetype}
                  className="h-14 w-14"
                  textClassName="text-sm"
                />
              </div>

              <h3 className="mt-4 font-heading text-sm font-semibold text-foreground-50">{match.title}</h3>
              <div className="mt-1 flex items-center justify-between">
                <span className="truncate text-xs text-foreground-500">
                  {fighterA.name} vs {fighterB.name}
                </span>
                <span className="ml-2 hidden shrink-0 rounded-md border border-background-700 px-2 py-0.5 text-[10px] text-foreground-400 sm:block">
                  {match.tag}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

interface UniverseSectionProps {
  series: Series[];
}

export function UniverseSection({ series }: UniverseSectionProps) {
  const visible = series.slice(0, 8);

  return (
    <section className="border-y border-background-800 bg-background-900/30">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-14 md:px-8 md:py-16">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-label text-[11px] uppercase text-secondary-300">Catalogo</span>
            <h2 className="mt-2 font-heading text-2xl font-bold text-foreground-50 md:text-3xl">
              Universos disponibles
            </h2>
          </div>
          <Link
            to="/characters"
            className="flex items-center gap-1 text-sm font-semibold text-primary-300 transition-colors hover:text-primary-200"
          >
            Ver todos los personajes
            <i className="ri-arrow-right-line" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((item) => (
            <Link
              key={item.id}
              to={`/characters?series=${item.slug}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-background-800 bg-background-950/70 px-4 py-3.5 transition-colors hover:border-primary-500/50 hover:bg-background-900"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground-100">{item.name}</p>
                <p className="font-label text-[10px] uppercase text-foreground-500">{item.type}</p>
              </div>
              <i className="ri-arrow-right-up-line text-base text-foreground-600 transition-colors group-hover:text-primary-300" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    icon: 'ri-user-search-line',
    title: 'Elige dos personajes',
    description: 'Busca por nombre, alias, anime o incluso por el nombre de una version concreta.',
  },
  {
    icon: 'ri-equalizer-line',
    title: 'Ajusta la version',
    description: 'Goku Ultra Instinct no es lo mismo que Goku base. Selecciona el estado exacto del combate.',
  },
  {
    icon: 'ri-bar-chart-2-line',
    title: 'Lee el analisis',
    description: 'Radar, 10 categorias de estadisticas y probabilidad estimada calculadas desde la base de datos.',
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-14 md:px-8 md:py-16">
      <div className="max-w-2xl">
        <span className="font-label text-[11px] uppercase text-primary-300">Como funciona</span>
        <h2 className="mt-2 font-heading text-2xl font-bold text-foreground-50 md:text-3xl">
          Tres pasos hasta el veredicto
        </h2>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="rounded-2xl border border-background-800 bg-background-900/60 p-5 transition-colors hover:border-background-700"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500/15 text-primary-300">
                <i className={`${step.icon} text-xl`} />
              </span>
              <span className="font-label text-[11px] text-foreground-600">0{index + 1}</span>
            </div>
            <h3 className="mt-4 font-heading text-base font-semibold text-foreground-50">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ArenaCta() {
  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 pb-16 md:px-8 md:pb-20">
      <div className="relative overflow-hidden rounded-3xl border border-primary-500/30 bg-gradient-to-br from-primary-900/60 via-background-900 to-accent-950/50 px-6 py-10 md:px-12 md:py-14">
        <div className="arena-grid pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground-50 md:text-3xl">
              Explora el catalogo completo
            </h2>
            <p className="mt-2 max-w-lg text-sm text-foreground-300">
              Miles de combinaciones posibles entre personajes, versiones y universos. Encuentra el
              enfrentamiento que siempre quisiste resolver.
            </p>
          </div>
          <Link
            to="/characters"
            className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-foreground-50 px-5 py-3 text-sm font-semibold text-background-950 transition-colors hover:bg-foreground-200"
          >
            <i className="ri-sword-line" />
            Ver personajes
          </Link>
        </div>
      </div>
    </section>
  );
}