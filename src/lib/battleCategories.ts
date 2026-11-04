import type { BattleCategoryScore, BattleScoreMap } from '@/types/battle';
import type { CharacterVersion } from '@/types';

export interface BattleCategory {
  key: string;
  label: string;
  shortLabel: string;
  fallbackStat: keyof CharacterVersion | null;
}

export const BATTLE_CATEGORIES: BattleCategory[] = [
  { key: 'strength', label: 'Fuerza', shortLabel: 'Fuerza', fallbackStat: 'strength' },
  { key: 'speed', label: 'Velocidad', shortLabel: 'Velocidad', fallbackStat: 'speed' },
  { key: 'durability', label: 'Resistencia', shortLabel: 'Resistencia', fallbackStat: 'durability' },
  { key: 'stamina', label: 'Stamina', shortLabel: 'Stamina', fallbackStat: 'stamina' },
  { key: 'battle_iq', label: 'Battle IQ', shortLabel: 'Battle IQ', fallbackStat: 'battle_iq' },
  { key: 'technique', label: 'Tecnica', shortLabel: 'Tecnica', fallbackStat: 'technique' },
  { key: 'experience', label: 'Experiencia', shortLabel: 'Experiencia', fallbackStat: 'experience' },
  { key: 'attack_power', label: 'Poder de ataque', shortLabel: 'Ataque', fallbackStat: 'attack_power' },
  { key: 'defense', label: 'Defensa', shortLabel: 'Defensa', fallbackStat: 'defense' },
  { key: 'regeneration', label: 'Regeneracion', shortLabel: 'Regen.', fallbackStat: 'regeneration' },
  { key: 'range', label: 'Alcance', shortLabel: 'Alcance', fallbackStat: 'range_score' },
  {
    key: 'special_abilities',
    label: 'Habilidades especiales',
    shortLabel: 'Habilidades',
    fallbackStat: 'special_abilities_score',
  },
  { key: 'hax', label: 'Hax', shortLabel: 'Hax', fallbackStat: 'hax_score' },
];

export function getCategoryScore(
  scores: BattleScoreMap | null,
  category: BattleCategory,
  versionA: CharacterVersion | null,
  versionB: CharacterVersion | null,
): BattleCategoryScore {
  const fromAi = scores?.[category.key];
  const fallbackA =
    category.fallbackStat && versionA ? Number(versionA[category.fallbackStat] ?? 0) : 0;
  const fallbackB =
    category.fallbackStat && versionB ? Number(versionB[category.fallbackStat] ?? 0) : 0;

  if (fromAi) {
    return {
      characterA: Number(fromAi.characterA ?? fallbackA),
      characterB: Number(fromAi.characterB ?? fallbackB),
      winner: fromAi.winner ?? '',
      reason: fromAi.reason ?? '',
    };
  }

  let winner = 'Empate';
  if (fallbackA > fallbackB) winner = 'A';
  if (fallbackB > fallbackA) winner = 'B';

  return { characterA: fallbackA, characterB: fallbackB, winner, reason: '' };
}

const DIFFICULTY_LABELS: Record<string, string> = {
  'no diff': 'No diff',
  'low diff': 'Low diff',
  'low-mid diff': 'Low-mid diff',
  'mid diff': 'Mid diff',
  'mid-high diff': 'Mid-high diff',
  'high diff': 'High diff',
  'extreme diff': 'Extreme diff',
  '50/50': '50/50',
};

export function normalizeDifficulty(value: string | null | undefined): string {
  if (!value) return 'mid diff';
  const key = value.trim().toLowerCase().replace(/\s+/g, ' ');
  return DIFFICULTY_LABELS[key] ?? key;
}

export function difficultyTone(value: string | null | undefined): string {
  const key = normalizeDifficulty(value);
  if (key === 'no diff' || key === 'low diff') {
    return 'border-secondary-500/50 bg-secondary-500/10 text-secondary-200';
  }
  if (key === 'extreme diff' || key === 'high diff') {
    return 'border-accent-500/60 bg-accent-500/10 text-accent-200';
  }
  if (key === '50/50') {
    return 'border-primary-500/60 bg-primary-500/10 text-primary-200';
  }
  return 'border-background-600 bg-background-800/70 text-foreground-200';
}