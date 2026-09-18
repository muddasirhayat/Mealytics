import { useState, useCallback, useRef, useEffect } from 'react';
import { Food } from '@/types/food';
import { foodCache } from '@/services/food/foodCache';
import { searchCommonFoods } from '@/services/food/commonFoods';
import { searchRemoteFoods } from '@/services/food/searchFoods';

export const useFoodSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const searchFoods = useCallback(async (searchQuery: string) => {
    const requestId = ++requestIdRef.current;
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    const localMatches = searchCommonFoods(trimmed);
    foodCache.putMany(localMatches);
    setResults(localMatches);
    setError(null);
    setIsLoading(true);

    if (trimmed.length < 2) {
      setIsLoading(false);
      return;
    }

    try {
      const merged = await searchRemoteFoods(trimmed, localMatches);
      if (requestId !== requestIdRef.current) {
        return;
      }
      setResults(merged);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      if (localMatches.length > 0) {
        setResults(localMatches);
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : 'Could not search foods. Please try again.');
        setResults([]);
      }
      setIsLoading(false);
    }
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setQuery(text);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      void searchFoods(text);
    }, 400);
  }, [searchFoods]);

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
      requestIdRef.current += 1;
    };
  }, []);

  return {
    query,
    setQuery: handleSearchChange,
    results,
    isLoading,
    error,
    searchFoods,
  };
};
