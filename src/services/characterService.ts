import { supabase } from '@/lib/supabase';
import type { CatalogFilters, CharacterSummary, CharacterVersion, Series } from '@/types';

const SEARCH_COLUMNS = ['name', 'alias', 'series_name', 'universe', 'versions'];

function sanitizeTerm(term: string): string {
  return term.replace(/[,()%*"'\\]/g, ' ').replace(/\s+/g, ' ').trim();
}

export async function searchCharacters(term: string, limit = 8): Promise<CharacterSummary[]> {
  const clean = sanitizeTerm(term);
  if (clean.length < 2) return [];

  const orFilter = SEARCH_COLUMNS.map((column) => `${column}.ilike.%${clean}%`).join(',');

  const { data, error } = await supabase
    .from('character_search')
    .select('*')
    .or(orFilter)
    .order('popularity', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as CharacterSummary[];
}

export async function listCharacters(
  filters: CatalogFilters,
): Promise<{ items: CharacterSummary[]; total: number }> {
  const from = (filters.page - 1) * filters.pageSize;
  const to = from + filters.pageSize - 1;

  let request = supabase.from('character_search').select('*', { count: 'exact' });

  const clean = sanitizeTerm(filters.query);
  if (clean.length >= 2) {
    const orFilter = SEARCH_COLUMNS.map((column) => `${column}.ilike.%${clean}%`).join(',');
    request = request.or(orFilter);
  }

  if (filters.seriesSlug) request = request.eq('series_slug', filters.seriesSlug);
  if (filters.archetype) request = request.eq('archetype', filters.archetype);

  if (filters.sort === 'name') {
    request = request.order('name', { ascending: true });
  } else if (filters.sort === 'power') {
    request = request.order('base_power', { ascending: false });
  } else {
    request = request.order('popularity', { ascending: false });
  }

  const { data, error, count } = await request.range(from, to);

  if (error) throw new Error(error.message);
  return { items: (data ?? []) as CharacterSummary[], total: count ?? 0 };
}

export async function getCharacterBySlug(slug: string): Promise<CharacterSummary | null> {
  const { data, error } = await supabase
    .from('character_search')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as CharacterSummary) ?? null;
}

export async function getCharacterVersions(characterId: string): Promise<CharacterVersion[]> {
  const { data, error } = await supabase
    .from('character_versions')
    .select('*')
    .eq('character_id', characterId)
    .order('power_boost', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as CharacterVersion[];
}

export async function getSeriesList(): Promise<Series[]> {
  const { data, error } = await supabase
    .from('series')
    .select('id, name, slug, type, universe, description')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as Series[];
}

export async function getTopCharacters(limit = 8): Promise<CharacterSummary[]> {
  const { data, error } = await supabase
    .from('character_search')
    .select('*')
    .order('popularity', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return (data ?? []) as CharacterSummary[];
}

export async function getCatalogCounts(): Promise<{
  characters: number;
  series: number;
  versions: number;
}> {
  const [characters, series, versions] = await Promise.all([
    supabase.from('characters').select('id', { count: 'exact', head: true }),
    supabase.from('series').select('id', { count: 'exact', head: true }),
    supabase.from('character_versions').select('id', { count: 'exact', head: true }),
  ]);

  return {
    characters: characters.count ?? 0,
    series: series.count ?? 0,
    versions: versions.count ?? 0,
  };
}