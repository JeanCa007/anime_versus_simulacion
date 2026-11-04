import { useEffect, useState } from 'react';

export const SIMULATION_STEPS = [
  'Analizando personajes...',
  'Comparando estadisticas...',
  'Evaluando habilidades...',
  'Calculando counters...',
  'Simulando el combate...',
  'Determinando el ganador...',
];

interface SimulationOverlayProps {
  nameA: string;
  nameB: string;
}

export default function SimulationOverlay({ nameA, nameB }: SimulationOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, SIMULATION_STEPS.length - 1));
    }, 2200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background-950/92 px-4 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-3xl border border-primary-500/30 bg-background-900/90 p-6 text-center shadow-2xl shadow-primary-950/60 md:p-8">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-pulse-ring rounded-full border border-primary-500/50" />
          <span className="absolute inset-2 rounded-full border border-accent-500/40" />
          <i className="ri-sparkling-2-fill text-3xl text-primary-300" />
        </div>

        <p className="mt-5 font-label text-[10px] uppercase text-foreground-500">Motor de batalla</p>
        <h2 className="mt-1 font-heading text-lg font-bold text-foreground-50 md:text-xl">
          {nameA} <span className="text-foreground-600">vs</span> {nameB}
        </h2>

        <div className="mt-6 space-y-2.5 text-left">
          {SIMULATION_STEPS.map((step, index) => {
            const done = index < stepIndex;
            const active = index === stepIndex;
            return (
              <div
                key={step}
                className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? 'border-primary-500/50 bg-primary-500/10 text-foreground-50'
                    : done
                      ? 'border-background-800 text-foreground-400'
                      : 'border-transparent text-foreground-600'
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  {done ? (
                    <i className="ri-check-line text-primary-300" />
                  ) : active ? (
                    <i className="ri-loader-4-line animate-spin text-primary-300" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-background-600" />
                  )}
                </span>
                {step}
              </div>
            );
          })}
        </div>

        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-background-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-700"
            style={{ width: `${((stepIndex + 1) / SIMULATION_STEPS.length) * 100}%` }}
          />
        </div>
        <p className="mt-3 text-[11px] text-foreground-500">
          La IA esta leyendo stats, habilidades, feats y condiciones reales del catalogo.
        </p>
      </div>
    </div>
  );
}