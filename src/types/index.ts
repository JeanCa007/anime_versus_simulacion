export type Archetype =
  | 'brawler'
  | 'speedster'
  | 'tank'
  | 'hax'
  | 'technique'
  | 'regenerator'
  | 'balanced';

export interface Series {
  id: string;
  name: string;
  slug: string;
  type: string;
  universe: string | null;
  description: string | null;
}

export interface CharacterSummary {
  id: string;
  name: string;
  slug: string;
  alias: string | null;
  description: string | null;
  thumbnail_url: string | null;
  main_image_url: string | null;
  popularity: number;
  base_power: number;
  archetype: Archetype;
  series_name: string | null;
  series_slug: string | null;
  universe: string | null;
  series_type: string | null;
  versions: string;
}

export interface CharacterVersion {
  id: string;
  character_id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  strength: number;
  speed: number;
  durability: number;
  stamina: number;
  intelligence: number;
  battle_iq: number;
  technique: number;
  experience: number;
  attack_power: number;
  defense: number;
  regeneration: number;
  range_score: number;
  special_abilities_score: number;
  hax_score: number;
  power_boost: number;
  canon_status: string;
}

export interface CatalogFilters {
  query: string;
  seriesSlug: string;
  archetype: string;
  sort: 'popularity' | 'power' | 'name';
  page: number;
  pageSize: number;
}

export interface FighterSlot {
  character: CharacterSummary;
  versions: CharacterVersion[];
  versionId: string | null;
}