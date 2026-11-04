import type { CharacterVersion } from '@/types';

export const STAT_KEYS = [
  'strength',
  'speed',
  'durability',
  'stamina',
  'battle_iq',
  'technique',
  'attack_power',
  'defense',
  'regeneration',
  'hax_score',
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export const STAT_LABELS: Record<StatKey, string> = {
  strength: 'Fuerza',
  speed: 'Velocidad',
  durability: 'Resistencia',
  stamina: 'Stamina',
  battle_iq: 'Battle IQ',
  technique: 'Tecnica',
  attack_power: 'Poder de ataque',
  defense: 'Defensa',
  regeneration: 'Regeneracion',
  hax_score: 'Hax',
};

const STAT_WEIGHTS: Record<StatKey, number> = {
  strength: 1.1,
  speed: 1.2,
  durability: 1.1,
  stamina: 0.9,
  battle_iq: 1.15,
  technique: 1.05,
  attack_power: 1.15,
  defense: 1,
  regeneration: 0.85,
  hax_score: 1.2,
};

export const ARCHETYPE_LABELS: Record<string, string> = {
  brawler: 'Combatiente puro',
  speedster: 'Velocista',
  tank: 'Tanque',
  hax: 'Hax',
  technique: 'Tecnico',
  regenerator: 'Regenerador',
  balanced: 'Equilibrado',
};

export const ARCHETYPE_GRADIENTS: Record<string, string> = {
  brawler: 'from-accent-600/45 via-background-900 to-background-950',
  speedster: 'from-primary-500/45 via-background-900 to-background-950',
  tank: 'from-secondary-500/45 via-background-900 to-background-950',
  hax: 'from-primary-700/55 via-background-900 to-background-950',
  technique: 'from-secondary-600/45 via-background-900 to-background-950',
  regenerator: 'from-accent-500/40 via-background-900 to-background-950',
  balanced: 'from-primary-600/40 via-background-900 to-background-950',
};

export function getVersionPower(version: CharacterVersion | null | undefined): number {
  if (!version) return 0;
  let total = 0;
  let weightSum = 0;
  STAT_KEYS.forEach((key) => {
    const weight = STAT_WEIGHTS[key];
    total += (version[key] ?? 50) * weight;
    weightSum += weight;
  });
  return Math.round(total / weightSum);
}

export interface StatComparison {
  key: StatKey;
  label: string;
  a: number;
  b: number;
  winner: 'a' | 'b' | 'draw';
}

export function compareVersions(
  a: CharacterVersion | null | undefined,
  b: CharacterVersion | null | undefined,
): StatComparison[] {
  return STAT_KEYS.map((key) => {
    const valueA = a?.[key] ?? 0;
    const valueB = b?.[key] ?? 0;
    let winner: 'a' | 'b' | 'draw' = 'draw';
    if (valueA > valueB) winner = 'a';
    if (valueB > valueA) winner = 'b';
    return { key, label: STAT_LABELS[key], a: valueA, b: valueB, winner };
  });
}

export function getWinProbability(
  a: CharacterVersion | null | undefined,
  b: CharacterVersion | null | undefined,
): number {
  const powerA = getVersionPower(a);
  const powerB = getVersionPower(b);
  const diff = powerA - powerB;
  const probability = 1 / (1 + Math.pow(10, -diff / 18));
  return Math.min(96, Math.max(4, Math.round(probability * 100)));
}

export function getRadarData(
  a: CharacterVersion | null | undefined,
  b: CharacterVersion | null | undefined,
) {
  return STAT_KEYS.map((key) => ({
    stat: STAT_LABELS[key],
    a: a?.[key] ?? 0,
    b: b?.[key] ?? 0,
  }));
}

export function getInitials(name: string): string {
  const cleaned = name
    .split(' ')
    .filter((part) => part.length > 1 && !['de', 'del', 'the', 'no'].includes(part.toLowerCase()));
  return cleaned
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}