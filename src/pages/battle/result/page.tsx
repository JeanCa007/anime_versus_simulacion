import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AppHeader from '@/components/feature/AppHeader';
import AppFooter from '@/components/feature/AppFooter';
import CharacterAvatar from '@/components/feature/CharacterAvatar';
import DifficultyBadge from '@/components/feature/DifficultyBadge';
import RadarComparison from '@/components/feature/RadarComparison';
import VersusHeader from '@/components/feature/VersusHeader';
import { getBattleDetail } from '@/services/battleService';
import { describeConditions } from '@/lib/battleConditions';
import { getVersionPower } from '@/lib/stats';
import CategoryComparison from '@/pages/battle/components/CategoryComparison';
import BattleRounds from '@/pages/battle/components/BattleRounds';
import BattleVerdict from '@/pages/battle/components/BattleVerdict';
import type { BattleConditions, BattleDetail } from '@/types/battle';

function toConditions(battle: BattleDetail['battle']): BattleConditions {
  return {
    battle_type: battle.battle_type as BattleConditions['battle_type'],
    location: battle.location as BattleConditions['location'],
    knowledge: battle.knowledge as BattleConditions['knowledge'],
    preparation: battle.preparation as BattleConditions['preparation'],
    summons: battle.summons as BattleConditions['summons'],
    transformations: battle.transformations as BattleConditions['transformations'],
  };
}

export default function BattleResultPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<BattleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return undefined;
    let cancelled = false;
    setLoading(true);

    const load = async () => {
      try {
        const result = await getBattleDetail(id);
        if (cancelled) return;
        if (!result) {
          setDetail(null);
          setError('No encontramos esa batalla.');
          return;
        }
        setDetail(result);
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'No se pudo cargar la batalla');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  const derived = useMemo(() => {
    if (!detail) return null;
    const { battle, sideA, sideB } = detail;
    const nameA = sideA.character?.name ?? 'Combatiente A';
    const nameB = sideB.character?.name ?? 'Combatiente B';

    let winnerSide: 'a' | 'b' = 'a';
    if (battle.winner_character_id) {
      winnerSide = battle.winner_character_id === battle.character_b_id ? 'b' : 'a';
    } else if (battle.winner_name && battle.winner_name.trim().toLowerCase() === nameB.toLowerCase()) {
      winnerSide = 'b';
    }

    const winnerName = winnerSide === 'a' ? nameA : nameB;
    const loserName = winnerSide === 'a' ? nameB : nameA;

    return { battle, sideA, sideB, nameA, nameB, winnerSide, winnerName, loserName };
  }, [detail]);

  const rematchLink = useMemo(() => {
    if (!derived) return '/battle';
    const { battle, sideA, sideB } = derived;
    if (!sideA.character || !sideB.character) return '/battle';
    const params = new URLSearchParams();
    params.set('a', sideA.character.slug);
    if (battle.version_a_id) params.set('av', battle.version_a_id);
    params.set('b', sideB.character.slug);
    if (battle.version_b_id) params.set('bv', battle.version_b_id);
    return `/battle?${params.toString()}`;
  }, [derived]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-950">
        <AppHeader />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-8">
          <div className="h-10 w-64 animate-pulse rounded-lg bg-background-900" />
          <div className="mt-6 h-80 animate-pulse rounded-3xl bg-background-900" />
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="h-64 animate-pulse rounded-2xl bg-background-900/70" />
            <div className="h-64 animate-pulse rounded-2xl bg-background-900/70" />
          </div>
          <p className="mt-6 text-center text-sm text-foreground-500">Cargando el analisis del combate...</p>
        </main>
      </div>
    );
  }

  if (!derived) {
    return (
      <div className="min-h-screen bg-background-950">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 py-24 text-center md:px-8">
          <i className="ri-sword-line text-4xl text-foreground-600" />
          <h1 className="mt-4 font-heading text-2xl font-bold text-foreground-50">Batalla no disponible</h1>
          <p className="mt-2 max-w-md text-sm text-foreground-500">
            {error ?? 'Puede que el analisis ya no exista o que el enlace sea incorrecto.'}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/battle"
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 hover:bg-primary-600"
            >
              <i className="ri-add-line" />
              Nueva batalla
            </Link>
            <button
              type="button"
              onClick={() => setReloadKey((prev) => prev + 1)}
              className="cursor-pointer rounded-xl border border-background-700 px-4 py-2.5 text-sm font-medium text-foreground-200 hover:border-primary-500/60"
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { battle, sideA, sideB, nameA, nameB, winnerSide, winnerName, loserName } = derived;
  const winnerInfo = winnerSide === 'a' ? sideA : sideB;
  const probabilityA = winnerSide === 'a' ? battle.win_probability : battle.loser_probability;
  const probabilityB = 100 - probabilityA;
  const conditionsSummary = describeConditions(toConditions(battle));
  const createdLabel = new Date(battle.created_at).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-background-950">
      <AppHeader />

      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-10">
        <div className="flex flex-wrap items-center gap-2 text-xs text-foreground-500">
          <Link to="/" className="hover:text-foreground-200">
            Inicio
          </Link>
          <i className="ri-arrow-right-s-line" />
          <Link to="/battle" className="hover:text-foreground-200">
            Batallas
          </Link>
          <i className="ri-arrow-right-s-line" />
          <span className="text-foreground-300">Resultado</span>
        </div>

        <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="font-label text-[11px] uppercase text-accent-300">Analisis guardado</span>
            <h1 className="mt-2 font-heading text-2xl font-extrabold text-foreground-50 md:text-3xl">
              {nameA} vs {nameB}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-foreground-500">
              <span className="flex items-center gap-1">
                <i className="ri-calendar-line" />
                {createdLabel}
              </span>
              <span className="text-foreground-700">·</span>
              <span className="flex items-center gap-1 text-primary-300">
                <i className="ri-sparkling-line" />
                {battle.is_ai ? 'Analisis con IA' : 'Analisis del motor'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to={rematchLink}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-background-700 px-4 py-2.5 text-sm font-medium text-foreground-200 transition-colors hover:border-primary-500/60"
            >
              <i className="ri-restart-line" />
              Revancha
            </Link>
            <Link
              to="/battle"
              className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
            >
              <i className="ri-add-line" />
              Nueva batalla
            </Link>
          </div>
        </div>

        <div className="mt-6">
          <VersusHeader
            sideA={{
              name: nameA,
              image: sideA.character?.main_image_url ?? sideA.character?.thumbnail_url ?? null,
              series: sideA.character?.series_name ?? null,
              version: sideA.version?.name ?? null,
              archetype: sideA.character?.archetype,
            }}
            sideB={{
              name: nameB,
              image: sideB.character?.main_image_url ?? sideB.character?.thumbnail_url ?? null,
              series: sideB.character?.series_name ?? null,
              version: sideB.version?.name ?? null,
              archetype: sideB.character?.archetype,
            }}
            winnerSide={winnerSide}
            backgroundImage="https://readdy.ai/api/search-image?query=dark%20cinematic%20anime%20battle%20arena%20with%20violet%20and%20crimson%20energy%20pillars%2C%20floating%20embers%2C%20deep%20navy%20black%20tones%2C%20atmospheric%20fog%2C%20epic%20versus%20stage%20lighting&width=1600&height=900&seq=battle-result-arena-bg&orientation=landscape"
          />
        </div>

        <section className="mt-4 overflow-hidden rounded-3xl border border-background-700 bg-gradient-to-br from-primary-950/50 via-background-900 to-accent-950/40 p-5 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <span className="flex w-fit items-center gap-1.5 rounded-full bg-foreground-50 px-2.5 py-1 font-label text-[10px] uppercase text-background-950">
                <i className="ri-trophy-fill" />
                Winner
              </span>
              <div className="mt-3 flex items-center gap-3">
                <CharacterAvatar
                  name={winnerName}
                  image={winnerInfo.character?.thumbnail_url ?? winnerInfo.character?.main_image_url}
                  archetype={winnerInfo.character?.archetype}
                  className="h-14 w-14"
                />
                <div className="min-w-0">
                  <h2 className="truncate font-heading text-2xl font-extrabold text-foreground-50 md:text-3xl">
                    {winnerName}
                  </h2>
                  <p className="truncate text-xs text-foreground-400">
                    {winnerInfo.character?.series_name} · {winnerInfo.version?.name ?? 'Sin version'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <div className="rounded-xl border border-background-700 bg-background-950/60 px-3 py-2 text-center">
                <p className="font-heading text-xl font-bold text-foreground-50">{battle.win_probability}%</p>
                <p className="font-label text-[9px] uppercase text-foreground-500">Victoria</p>
              </div>
              <div className="rounded-xl border border-background-700 bg-background-950/60 px-3 py-2 text-center">
                <p className="font-heading text-xl font-bold text-foreground-50">{battle.confidence}%</p>
                <p className="font-label text-[9px] uppercase text-foreground-500">Confianza</p>
              </div>
              <div className="rounded-xl border border-background-700 bg-background-950/60 px-3 py-2">
                <DifficultyBadge difficulty={battle.difficulty} size="sm" />
                <p className="mt-1 font-label text-[9px] uppercase text-foreground-500">Dificultad</p>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-primary-300">
                {nameA} · {getVersionPower(sideA.version)}
              </span>
              <span className="font-label uppercase text-foreground-500">Probabilidad de victoria</span>
              <span className="font-semibold text-accent-300">
                {nameB} · {getVersionPower(sideB.version)}
              </span>
            </div>
            <div className="mt-2 flex h-3 w-full overflow-hidden rounded-full bg-background-800">
              <div className="h-full bg-primary-500" style={{ width: `${probabilityA}%` }} />
              <div className="h-full flex-1 bg-accent-500" />
            </div>
            <div className="mt-1.5 flex items-center justify-between font-heading text-base font-bold">
              <span className="text-primary-300">{probabilityA}%</span>
              <span className="text-accent-300">{probabilityB}%</span>
            </div>
          </div>
        </section>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-2xl border border-background-800 bg-background-900/60 p-4 md:p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-semibold text-foreground-50">Radar comparativo</h2>
              <span className="font-label text-[10px] uppercase text-foreground-500">0 - 100</span>
            </div>
            <div className="mt-1">
              <RadarComparison
                versionA={sideA.version}
                versionB={sideB.version}
                nameA={nameA}
                nameB={nameB}
                height={280}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-background-800 bg-background-900/60 p-4 md:p-5">
              <div className="flex items-center gap-2">
                <i className="ri-settings-3-line text-secondary-300" />
                <h2 className="font-heading text-sm font-semibold text-foreground-50">
                  Condiciones del combate
                </h2>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {conditionsSummary.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-2 rounded-lg border border-background-800 bg-background-950/50 px-2.5 py-1.5"
                  >
                    <span className="flex items-center gap-1.5 truncate text-[11px] text-foreground-500">
                      <i className={`${item.icon} text-[10px]`} />
                      {item.label}
                    </span>
                    <span className="truncate text-[11px] font-medium text-foreground-200">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-background-800 bg-background-900/60 p-4 md:p-5">
              <div className="flex items-center gap-2">
                <i className="ri-flashlight-line text-primary-300" />
                <h2 className="font-heading text-sm font-semibold text-foreground-50">
                  Habilidades en juego
                </h2>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <p className="truncate font-label text-[10px] uppercase text-primary-300">{nameA}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {sideA.abilities.length > 0 ? (
                      sideA.abilities.slice(0, 5).map((ability) => (
                        <span
                          key={`a-${ability.name}`}
                          title={ability.description ?? undefined}
                          className="rounded-md border border-primary-500/25 bg-primary-500/5 px-2 py-0.5 text-[10px] text-foreground-300"
                        >
                          {ability.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] italic text-foreground-600">Sin habilidades registradas</span>
                    )}
                  </div>
                </div>
                <div>
                  <p className="truncate font-label text-[10px] uppercase text-accent-300">{nameB}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {sideB.abilities.length > 0 ? (
                      sideB.abilities.slice(0, 5).map((ability) => (
                        <span
                          key={`b-${ability.name}`}
                          title={ability.description ?? undefined}
                          className="rounded-md border border-accent-500/25 bg-accent-500/5 px-2 py-0.5 text-[10px] text-foreground-300"
                        >
                          {ability.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] italic text-foreground-600">Sin habilidades registradas</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <CategoryComparison
            scores={battle.scores}
            versionA={sideA.version}
            versionB={sideB.version}
            nameA={nameA}
            nameB={nameB}
          />
        </div>

        <div className="mt-10">
          <BattleRounds rounds={detail.rounds} nameA={nameA} nameB={nameB} />
        </div>

        <div className="mt-10">
          <BattleVerdict
            battle={battle}
            nameA={nameA}
            nameB={nameB}
            winnerName={winnerName}
            loserName={loserName}
            winnerSide={winnerSide}
          />
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-background-800 bg-background-900/60 p-5 md:flex-row md:items-center">
          <div>
            <h3 className="font-heading text-base font-semibold text-foreground-50">
              Este analisis quedo guardado
            </h3>
            <p className="mt-1 text-xs text-foreground-500">
              Puedes compartir el enlace directo o cambiar las condiciones y volver a simular.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to={rematchLink}
              className="flex items-center gap-2 whitespace-nowrap rounded-xl border border-background-700 px-4 py-2.5 text-sm font-medium text-foreground-200 transition-colors hover:border-primary-500/60"
            >
              <i className="ri-restart-line" />
              Cambiar condiciones
            </Link>
            {sideA.character && (
              <Link
                to={`/character/${sideA.character.slug}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-semibold text-background-50 transition-colors hover:bg-primary-600"
              >
                <i className="ri-user-line" />
                Ver ficha de {nameA}
              </Link>
            )}
          </div>
        </div>
      </main>

      <AppFooter />
    </div>
  );
}