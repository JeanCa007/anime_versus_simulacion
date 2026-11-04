import { supabase } from '@/lib/supabase';
import type {
  BattleAbility,
  BattleConditions,
  BattleDetail,
  BattleRecord,
  BattleRoundRecord,
  BattleSideInfo,
  SimulateBattleResult,
} from '@/types/battle';
import type { CharacterSummary, CharacterVersion } from '@/types';

export interface SimulateBattleInput {
  versionAId: string;
  versionBId: string;
  conditions: BattleConditions;
}

async function resolveFunctionError(error: unknown): Promise<string> {
  const fallback = 'No se pudo conectar con el motor de batalla.';
  if (!error) return fallback;

  const typed = error as { message?: string; context?: Response };
  let detail = typed.message || fallback;

  const context = typed.context;
  if (context && typeof context.clone === 'function') {
    try {
      const body = await context.clone().json();
      if (body && typeof body.error === 'string' && body.error.length > 0) {
        detail = body.error;
      }
    } catch {
      /* la respuesta no era JSON: conservamos el mensaje original */
    }
  }

  return detail;
}

export async function simulateBattle(input: SimulateBattleInput): Promise<SimulateBattleResult> {
  const { data, error } = await supabase.functions.invoke('battle-simulate', {
    body: {
      versionAId: input.versionAId,
      versionBId: input.versionBId,
      conditions: input.conditions,
    },
  });

  if (error) {
    throw new Error(await resolveFunctionError(error));
  }

  const payload = data as { battleId?: string; cached?: boolean; error?: string } | null;

  if (!payload?.battleId) {
    throw new Error(payload?.error || 'La simulacion no devolvio un resultado valido.');
  }

  return { battleId: payload.battleId, cached: Boolean(payload.cached) };
}

async function loadAbilities(characterId: string | null): Promise<BattleAbility[]> {
  if (!characterId) return [];

  const { data: links, error } = await supabase
    .from('character_abilities')
    .select('ability_id')
    .eq('character_id', characterId)
    .limit(8);

  if (error || !links || links.length === 0) return [];

  const abilityIds = links
    .map((link) => link.ability_id as string | null)
    .filter((value): value is string => Boolean(value));

  if (abilityIds.length === 0) return [];

  const { data: abilities } = await supabase
    .from('abilities')
    .select('name, category, description')
    .in('id', abilityIds);

  return (abilities ?? []) as BattleAbility[];
}

async function loadSide(
  characterId: string | null,
  versionId: string | null,
): Promise<BattleSideInfo> {
  if (!characterId) return { character: null, version: null, abilities: [] };

  const [characterResult, versionResult, abilities] = await Promise.all([
    supabase.from('character_search').select('*').eq('id', characterId).maybeSingle(),
    versionId
      ? supabase.from('character_versions').select('*').eq('id', versionId).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    loadAbilities(characterId),
  ]);

  return {
    character: (characterResult.data as CharacterSummary) ?? null,
    version: (versionResult.data as CharacterVersion) ?? null,
    abilities,
  };
}

export async function getBattleDetail(battleId: string): Promise<BattleDetail | null> {
  const { data: battleRow, error } = await supabase
    .from('battles')
    .select('*')
    .eq('id', battleId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!battleRow) return null;

  const battle = battleRow as BattleRecord;

  const [roundsResult, sideA, sideB] = await Promise.all([
    supabase
      .from('battle_rounds')
      .select('*')
      .eq('battle_id', battleId)
      .order('round_number', { ascending: true }),
    loadSide(battle.character_a_id, battle.version_a_id),
    loadSide(battle.character_b_id, battle.version_b_id),
  ]);

  return {
    battle,
    rounds: (roundsResult.data ?? []) as BattleRoundRecord[],
    sideA,
    sideB,
  };
}

export async function getRecentBattles(limit = 6): Promise<BattleRecord[]> {
  const { data, error } = await supabase
    .from('battles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as BattleRecord[];
}