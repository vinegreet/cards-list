import { useContext, useCallback, useRef, useState, useEffect } from 'react';
import { EventsContext } from './context';
import { loadPageHandler, prefetchNextPagesHandler } from './pageLoader/handlers';
import { getVisibleEventIds } from './pageLoader/utils';
import { EventsState, PageState } from './pageLoader/types';
import { Event as EventType } from '../api/models';

// Define the custom hook to use the EventsContext
/**
 * `useEvents` is a convenience hook for accessing the `EventsContext`.
 * It provides components with event data and related loading/error states and functions.
 * Throws an error if used outside of an `EventsContext.Provider`.
 */
export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};


/**
 * usePageLoader is a custom hook responsible for managing the fetching, caching,
 * and pagination of event data. It handles the state for loaded pages, individual event data
 * mapped by ID, loading indicators (initial, more, prefetching), error states, and provides
 * functions to load and prefetch pages.
 *
 * @returns {Object} Loader state and API
 * @property {number[]} eventIds - All visible event IDs in order.
 * @property {Record<number, EventType>} eventsMappedById - Map of event data by ID.
 * @property {boolean} loading - True if the initial page is loading.
 * @property {boolean} isLoadingMore - True if more pages are being loaded or prefetched.
 * @property {string|null} error - Error message if loading failed, otherwise null.
 * @property {(currentPageFromCaller: number) => void} prefetchNextPages - Function to prefetch the next page.
 * @property {boolean} canLoadMore - True if more pages can be loaded.
 * @property {number} lastLoadedPage - The last loaded page number.
 * @property {number|null} totalPages - Total number of pages, or null if unknown.
 */
export const usePageLoader = () => {
  const [state, setState] = useState<EventsState>({
    pages: {},
    currentPage: 1,
    totalLoadedPages: 0,
    isInitialLoading: true,
    isPrefetching: false,
    totalPages: null,
  });

  // Stores all event data mapped by event ID for fast lookup and rendering
  const [eventsMappedById, setEventsMappedById] = useState<Record<number, EventType>>({});
  // Holds any error message encountered during loading
  const [error, setError] = useState<string | null>(null);
  // Tracks which page numbers are currently being loaded to prevent duplicate requests
  const pageNumbersCurrentlyLoading_ref = useRef<Set<number>>(new Set());

  // Used to reference the latest prefetchNextPages function for use in callbacks
  const prefetchNextPagesRef = useRef<((currentPageFromCaller: number) => void) | null>(null);
  // Tracks the set of pages being prefetched in the current batch; used to determine when prefetching is complete
  const prefetchingPages_ref = useRef<Set<number>>(new Set());

  // Load a page of events from the API
  const loadPage = useCallback((pageNumber: number, shouldPrefetch: boolean = false) => {
    return loadPageHandler({
      pageNumber,
      shouldPrefetch,
      state,
      setState,
      setEventsMappedById,
      setError,
      pageNumbersCurrentlyLoading_ref,
      prefetchingPages_ref
    });
  }, [state, setState, setEventsMappedById, setError]);

  // Prefetch the next page of events from the API
  const prefetchNextPages = useCallback((currentPageFromCaller: number) => {
    return prefetchNextPagesHandler({
      currentPageFromCaller,
      state,
      setState,
      loadPage,
      pageNumbersCurrentlyLoading_ref,
      prefetchingPages_ref
    });
  }, [state, setState, loadPage]);

  // Assign to ref for loadPage
  useEffect(() => {
    prefetchNextPagesRef.current = prefetchNextPages;
  }, [prefetchNextPages]);

  useEffect(() => {
    // On initial mount, fetch only the first page
    if (state.totalLoadedPages === 0) {
      loadPage(1, false);
    }
  }, [loadPage, state.totalLoadedPages]);

  return {
    eventIds: getVisibleEventIds(state.pages),
    eventsMappedById,
    loading: state.isInitialLoading,
    isLoadingMore: state.isPrefetching || (pageNumbersCurrentlyLoading_ref.current.size > 0 && !state.isInitialLoading),
    error,
    prefetchNextPages,
    canLoadMore: state.totalPages === null || Object.keys(state.pages).length < state.totalPages,
    lastLoadedPage: state.totalLoadedPages,
    totalPages: state.totalPages,
  };
};

