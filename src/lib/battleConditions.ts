import type { BattleConditions } from '@/types/battle';

export interface ConditionOption {
  value: string;
  label: string;
  hint?: string;
}

export interface ConditionGroup {
  key: keyof BattleConditions;
  label: string;
  description: string;
  icon: string;
  options: ConditionOption[];
}

export const CONDITION_GROUPS: ConditionGroup[] = [
  {
    key: 'battle_type',
    label: 'Tipo de combate',
    description: 'Define que significa ganar en este escenario.',
    icon: 'ri-sword-line',
    options: [
      { value: 'standard', label: 'Estandar', hint: 'Victoria por incapacitacion' },
      { value: 'death-battle', label: 'Death battle', hint: 'Solo uno sale vivo' },
      { value: 'tournament', label: 'Torneo', hint: 'Reglas y limite de tiempo' },
      { value: 'sparring', label: 'Sparring', hint: 'Sin intencion de matar' },
    ],
  },
  {
    key: 'location',
    label: 'Escenario',
    description: 'El terreno condiciona movilidad y ataques de area.',
    icon: 'ri-landscape-line',
    options: [
      { value: 'neutral-arena', label: 'Arena neutral' },
      { value: 'city', label: 'Ciudad' },
      { value: 'forest', label: 'Bosque' },
      { value: 'open-field', label: 'Campo abierto' },
      { value: 'custom', label: 'Personalizado' },
    ],
  },
  {
    key: 'knowledge',
    label: 'Conocimiento previo',
    description: 'Cuanta informacion tiene cada uno del rival.',
    icon: 'ri-eye-line',
    options: [
      { value: 'none', label: 'Ninguno' },
      { value: 'basic', label: 'Basico' },
      { value: 'full', label: 'Completo' },
    ],
  },
  {
    key: 'preparation',
    label: 'Preparacion',
    description: 'Tiempo para planificar, curarse o montar trampas.',
    icon: 'ri-timer-line',
    options: [
      { value: 'none', label: 'Sin preparacion' },
      { value: '1-hour', label: '1 hora' },
      { value: '1-day', label: '1 dia' },
      { value: 'unlimited', label: 'Ilimitada' },
    ],
  },
  {
    key: 'summons',
    label: 'Invocaciones',
    description: 'Permite ejercitos, sombras, clones o familiares.',
    icon: 'ri-group-line',
    options: [
      { value: 'allowed', label: 'Permitidas' },
      { value: 'disabled', label: 'Desactivadas' },
    ],
  },
  {
    key: 'transformations',
    label: 'Transformaciones',
    description: 'Si pueden usar su forma mas alta o solo la base.',
    icon: 'ri-fire-line',
    options: [
      { value: 'allowed', label: 'Permitidas' },
      { value: 'base-only', label: 'Solo forma base' },
    ],
  },
];

export const DEFAULT_CONDITIONS: BattleConditions = {
  battle_type: 'standard',
  location: 'neutral-arena',
  knowledge: 'none',
  preparation: 'none',
  summons: 'allowed',
  transformations: 'allowed',
};

const LABEL_LOOKUP: Record<string, Record<string, string>> = CONDITION_GROUPS.reduce(
  (accumulator, group) => {
    accumulator[group.key] = group.options.reduce<Record<string, string>>((optionAccumulator, option) => {
      optionAccumulator[option.value] = option.label;
      return optionAccumulator;
    }, {});
    return accumulator;
  },
  {},
);

export function conditionLabel(key: keyof BattleConditions, value: string): string {
  return LABEL_LOOKUP[key]?.[value] ?? value;
}

export function describeConditions(conditions: BattleConditions) {
  return CONDITION_GROUPS.map((group) => ({
    key: group.key,
    label: group.label,
    icon: group.icon,
    value: conditionLabel(group.key, conditions[group.key]),
  }));
}