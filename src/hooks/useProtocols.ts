import { useCallback } from 'react';
import { useStore } from '@/store/useStore';
import { fetchProtocolsWithText } from '@/services/bundestag';

export function useProtocols() {
  const apiKeys = useStore((state) => state.apiKeys);
  const searchParams = useStore((state) => state.searchParams);
  const protocols = useStore((state) => state.protocols);
  const cursor = useStore((state) => state.cursor);
  const isLoading = useStore((state) => state.isLoading);
  const isLoadingMore = useStore((state) => state.isLoadingMore);
  const error = useStore((state) => state.error);

  const setProtocols = useStore((state) => state.setProtocols);
  const appendProtocols = useStore((state) => state.appendProtocols);
  const setCursor = useStore((state) => state.setCursor);
  const setIsLoading = useStore((state) => state.setIsLoading);
  const setIsLoadingMore = useStore((state) => state.setIsLoadingMore);
  const setError = useStore((state) => state.setError);
  const setSelectedProtocol = useStore((state) => state.setSelectedProtocol);
  const setSearchParams = useStore((state) => state.setSearchParams);

  const search = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setCursor(undefined);

    try {
      const data = await fetchProtocolsWithText(apiKeys.bundestagKey, searchParams);

      if (data && data.documents) {
        setProtocols(data.documents);
        setCursor(data.cursor);

        // Auto-select first result on desktop
        if (data.documents.length > 0 && window.innerWidth >= 768) {
          setSelectedProtocol(data.documents[0]);
        }

        if (data.documents.length === 0) {
          setError('Keine Protokolle für diese Suchkriterien gefunden.');
        }
      } else {
        setError('Unerwartetes Antwortformat von der API.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  }, [
    apiKeys.bundestagKey,
    searchParams,
    setProtocols,
    setCursor,
    setIsLoading,
    setError,
    setSelectedProtocol,
  ]);

  const loadMore = useCallback(async () => {
    if (!cursor || isLoadingMore) return;

    setIsLoadingMore(true);
    setError(null);

    try {
      const data = await fetchProtocolsWithText(apiKeys.bundestagKey, {
        ...searchParams,
        cursor,
      });

      if (data && data.documents) {
        appendProtocols(data.documents);
        setCursor(data.cursor);
      }
    } catch (err) {
      console.error('Load more error:', err);
      setError(err instanceof Error ? err.message : 'Fehler beim Laden weiterer Protokolle');
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    cursor,
    isLoadingMore,
    apiKeys.bundestagKey,
    searchParams,
    appendProtocols,
    setCursor,
    setIsLoadingMore,
    setError,
  ]);

  const updateSearch = useCallback(
    (params: Partial<typeof searchParams>) => {
      setSearchParams(params);
    },
    [setSearchParams]
  );

  return {
    protocols,
    cursor,
    isLoading,
    isLoadingMore,
    error,
    hasMore: !!cursor,
    search,
    loadMore,
    updateSearch,
    searchParams,
  };
}
