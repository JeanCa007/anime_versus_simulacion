import { useEffect, useState } from 'react';
import { searchCharacters } from '@/services/characterService';
import type { CharacterSummary } from '@/types';

export function useCharacterSearch(delay = 220) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<CharacterSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cleaned = term.trim();

    if (cleaned.length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);

    const timer = window.setTimeout(async () => {
      try {
        const data = await searchCharacters(cleaned, 8);
        if (!cancelled) {
          setResults(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setResults([]);
          setError(err instanceof Error ? err.message : 'No se pudo buscar');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, delay);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [term, delay]);

  return { term, setTerm, results, loading, error };
}