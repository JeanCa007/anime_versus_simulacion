import type { CharacterSummary, CharacterVersion } from '@/types';

export type BattleType = 'standard' | 'death-battle' | 'tournament' | 'sparring';
export type BattleLocation = 'neutral-arena' | 'city' | 'forest' | 'open-field' | 'custom';
export type KnowledgeLevel = 'none' | 'basic' | 'full';
export type PreparationLevel = 'none' | '1-hour' | '1-day' | 'unlimited';
export type SummonPolicy = 'allowed' | 'disabled';
export type TransformationPolicy = 'allowed' | 'base-only';

export interface BattleConditions {
  battle_type: BattleType;
  location: BattleLocation;
  knowledge: KnowledgeLevel;
  preparation: PreparationLevel;
  summons: SummonPolicy;
  transformations: TransformationPolicy;
}

export interface BattleCategoryScore {
  characterA: number;
  characterB: number;
  winner: string;
  reason: string;
}

export type BattleScoreMap = Record<string, BattleCategoryScore>;

export interface BattleRecord {
  id: string;
  battle_hash: string;
  character_a_id: string | null;
  character_b_id: string | null;
  version_a_id: string | null;
  version_b_id: string | null;
  battle_type: string;
  location: string;
  knowledge: string;
  preparation: string;
  summons: string;
  transformations: string;
  winner_character_id: string | null;
  winner_name: string | null;
  win_probability: number;
  loser_probability: number;
  difficulty: string;
  summary: string | null;
  final_verdict: string | null;
  confidence: number;
  scores: BattleScoreMap | null;
  advantages_a: string[] | null;
  advantages_b: string[] | null;
  win_conditions_a: string[] | null;
  win_conditions_b: string[] | null;
  ai_model: string | null;
  is_ai: boolean;
  created_at: string;
}

export interface BattleRoundRecord {
  id: string;
  battle_id: string;
  round_number: number;
  title: string | null;
  description: string | null;
  winner_name: string | null;
}

export interface BattleAbility {
  name: string;
  category: string;
  description: string | null;
}

export interface BattleSideInfo {
  character: CharacterSummary | null;
  version: CharacterVersion | null;
  abilities: BattleAbility[];
}

export interface BattleDetail {
  battle: BattleRecord;
  rounds: BattleRoundRecord[];
  sideA: BattleSideInfo;
  sideB: BattleSideInfo;
}

export interface SimulateBattleResult {
  battleId: string;
  cached: boolean;
}