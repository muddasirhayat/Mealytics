import { useState, useCallback, useRef, useEffect } from 'react';
import { Food } from '@/types/food';
import { searchOfflineFoods, searchRemoteFoods } from '@/services/food/searchFoods';

export const useFoodSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');
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
      setIsPending(false);
      setSearchedQuery('');
      return;
    }

    if (trimmed.length < 2) {
      setResults([]);
      setError(null);
      setIsLoading(false);
      setIsPending(false);
      setSearchedQuery(trimmed);
      return;
    }

    const localMatches = searchOfflineFoods(trimmed);
    setResults(localMatches);
    setError(null);

    if (localMatches.length > 0) {
      setIsLoading(false);
      setIsPending(false);
      setSearchedQuery(trimmed);
      return;
    }

    setIsLoading(true);

    try {
      const remote = await searchRemoteFoods(trimmed);
      if (requestId !== requestIdRef.current) {
        return;
      }
      setResults(remote);
      setError(null);
      setIsLoading(false);
      setIsPending(false);
      setSearchedQuery(trimmed);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Could not search foods. Please try again.');
      setResults([]);
      setIsLoading(false);
      setIsPending(false);
      setSearchedQuery(trimmed);
    }
  }, []);

  const handleSearchChange = useCallback((text: string) => {
    setQuery(text);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    const trimmed = text.trim();
    if (!trimmed) {
      requestIdRef.current += 1;
      setResults([]);
      setError(null);
      setIsLoading(false);
      setIsPending(false);
      setSearchedQuery('');
      return;
    }

    setIsPending(true);

    searchTimeout.current = setTimeout(() => {
      void searchFoods(text);
    }, 250);
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
    isPending,
    searchedQuery,
    error,
    searchFoods,
  };
};
