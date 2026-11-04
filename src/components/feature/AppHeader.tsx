import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Inicio', to: '/' },
  { label: 'Comparar', to: '/battle' },
  { label: 'Personajes', to: '/characters' },
  { label: 'Universos', to: '/characters?view=universes' },
];

export default function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-background-800/80 bg-background-950/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-4 px-4 md:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-background-50 shadow-lg shadow-primary-900/40">
            <i className="ri-sparkling-2-fill text-xl" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-heading text-base font-bold tracking-tight text-foreground-50">
              Anime Battle Arena
            </span>
            <span className="font-label text-[10px] uppercase text-foreground-500">Power scaling lab</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-background-800/80 text-foreground-50'
                    : 'text-foreground-400 hover:bg-background-900 hover:text-foreground-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/battle"
            className="flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
          >
            <i className="ri-sword-line text-base" />
            <span className="whitespace-nowrap">Entrar a la arena</span>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Abrir menú"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-background-700 text-foreground-200 md:hidden"
        >
          <i className={open ? 'ri-close-line text-xl' : 'ri-menu-line text-xl'} />
        </button>
      </div>

      {open && (
        <div className="animate-slide border-t border-background-800 bg-background-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-300 hover:bg-background-900"
              >
                {item.label}
              </NavLink>
            ))}
          </div>
          <Link
            to="/battle"
            onClick={() => setOpen(false)}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-background-50"
          >
            <i className="ri-sword-line" />
            Entrar a la arena
          </Link>
        </div>
      )}
    </header>
  );
}