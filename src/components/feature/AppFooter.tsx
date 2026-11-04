import { Link } from 'react-router-dom';

const COLUMNS = [
  {
    title: 'Arena',
    links: [
      { label: 'Catálogo de personajes', to: '/characters' },
      { label: 'Universos', to: '/characters?view=universes' },
      { label: 'Personajes más populares', to: '/characters?sort=popularity' },
    ],
  },
  {
    title: 'Batallas',
    links: [
      { label: 'Simulador con IA', to: '/battle' },
      { label: 'Rankings', to: '/characters' },
      { label: 'Historial de batallas', to: '/characters' },
    ],
  },
];

export default function AppFooter() {
  return (
    <footer className="border-t border-background-800 bg-background-950">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-12 md:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-background-50">
                <i className="ri-sparkling-2-fill" />
              </span>
              <span className="font-heading text-sm font-bold text-foreground-50">Anime Battle Arena</span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground-500">
              Comparador de personajes de anime, manga y manhwa con estadísticas por versión, interacción de
              habilidades y análisis de enfrentamientos.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-background-700 text-foreground-400">
                <i className="ri-discord-line" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-background-700 text-foreground-400">
                <i className="ri-twitter-x-line" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-background-700 text-foreground-400">
                <i className="ri-reddit-line" />
              </span>
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="font-label text-[11px] uppercase text-foreground-500">{column.title}</h4>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-foreground-300 transition-colors hover:text-primary-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-background-800 pt-6 text-xs text-foreground-600 sm:flex-row sm:items-center">
          <span>Anime Battle Arena. Proyecto de fans sin afiliación con los estudios o editoriales.</span>
          <span className="font-label uppercase">Datos en vivo desde Supabase</span>
        </div>
      </div>
    </footer>
  );
}