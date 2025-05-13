import { useContext, useCallback, useRef, useState } from 'react';
import { EventsContext } from './context';
import { fetchEventsData } from '../api/eventService';
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

interface PageState {
  pageNumber: number;
  eventIds: number[];
  isLoaded: boolean;
  isPrefetched: boolean;
}

interface EventsState {
  pages: Record<number, PageState>;
  currentPage: number;
  totalLoadedPages: number;
  isInitialLoading: boolean;
  isPrefetching: boolean;
}

const PAGE_SIZE = 5;
const PREFETCH_WINDOW = 5; // Number of pages to prefetch ahead
// TODO: switch to 20 pages, but only prefetch when current events loaded their assets

/**
 * `usePageLoader` is a custom hook responsible for managing the fetching, caching, 
 * and pagination of event data. It handles the state for loaded pages, 
 * individual event data mapped by ID, loading indicators (initial, more, prefetching), 
 * error states, and provides functions to load and prefetch pages.
 * This hook encapsulates the core logic for lazy loading and prefetching event items.
 */
export const usePageLoader = () => {
  const [state, setState] = useState<EventsState>({
    pages: {},
    currentPage: 1,
    totalLoadedPages: 0,
    isInitialLoading: true,
    isPrefetching: false
  });

  const [eventsMappedById, setEventsMappedById] = useState<Record<number, EventType>>({});
  const [error, setError] = useState<string | null>(null);
  const [pageNumbersCurrentlyLoadingState, setPageNumbersCurrentlyLoadingState] = useState<Set<number>>(new Set());
  const pageNumbersCurrentlyLoading_ref = useRef<Set<number>>(new Set());

  const loadPage = useCallback(async (pageNumber: number, shouldPrefetch: boolean = false) => {
    console.log('[loadPage attempt]', { pageNumber, shouldPrefetch, isRefBusy: pageNumbersCurrentlyLoading_ref.current.has(pageNumber), isStateLoaded: state.pages[pageNumber]?.isLoaded, currentTotalPages: state.totalLoadedPages });

    if (pageNumbersCurrentlyLoading_ref.current.has(pageNumber)) {
      console.log(`[loadPage skip] Page ${pageNumber} is already being fetched (ref check).`);
      return;
    }

    // Handle already loaded pages (e.g. prefetched page being directly loaded now)
    if (state.pages[pageNumber]?.isLoaded) {
      console.log(`[loadPage info] Page ${pageNumber} is already loaded in state.`);
      if (!shouldPrefetch) {
        // This is a direct load attempt for an already loaded page.
        // Update currentPage if it's advancing, and ensure loading flags are off.
        setState(prev => {
          if (pageNumber > prev.currentPage) {
            console.log(`[loadPage update] Advancing currentPage from ${prev.currentPage} to ${pageNumber} for already loaded page (direct load).`);
            return { ...prev, currentPage: pageNumber, isInitialLoading: false, isPrefetching: false };
          } else if (pageNumber === prev.currentPage && (prev.isInitialLoading || prev.isPrefetching)) {
            // If loading current page again (e.g. initial load completed by prefetch, then direct load called)
            console.log(`[loadPage update] Clearing loading flags for already loaded currentPage ${pageNumber}.`);
            return { ...prev, isInitialLoading: false, isPrefetching: false };
          }
          return prev; // No change needed if not advancing or not clearing flags
        });
      }
      // For prefetches of already loaded pages, or direct loads not advancing currentPage, nothing more to do here.
      return;
    }

    // Guard for total page limit if the page is NOT yet loaded
    if (state.totalLoadedPages >= 20) {
      console.log(`[loadPage skip] Page ${pageNumber} not loaded, but total loaded pages limit (20) reached. Total: ${state.totalLoadedPages}.`);
      return;
    }
    
    console.log(`[loadPage proceed] To fetch page ${pageNumber}. Current totalLoadedPages: ${state.totalLoadedPages}`);

    try {
      pageNumbersCurrentlyLoading_ref.current.add(pageNumber);
      setPageNumbersCurrentlyLoadingState(prev => new Set(prev).add(pageNumber));

      if (!shouldPrefetch) {
        setState(prev => ({ ...prev, isInitialLoading: pageNumber === 1 && !prev.pages[1]?.isLoaded, isPrefetching: false }));
      } else {
        setState(prev => ({ ...prev, isPrefetching: true }));
      }

      const { ids, mappedById, fetchedCount } = await fetchEventsData(pageNumber, PAGE_SIZE);

      if (fetchedCount > 0) {
        setEventsMappedById(prev => ({ ...prev, ...mappedById }));
        setState(prev => {
          const newCurrentPage = !shouldPrefetch && pageNumber > prev.currentPage ? pageNumber : prev.currentPage;
          console.log('[loadPage setState after fetch]', { pageNumber, idsCount: ids.length, oldCurrentPage: prev.currentPage, newCurrentPage, oldTotalLoaded: prev.totalLoadedPages, newTotalLoaded: prev.totalLoadedPages + 1, shouldPrefetch });

          return {
            ...prev,
            pages: {
              ...prev.pages,
              [pageNumber]: {
                pageNumber,
                eventIds: ids,
                isLoaded: true,
                isPrefetched: shouldPrefetch
              }
            },
            totalLoadedPages: prev.totalLoadedPages + 1, 
            currentPage: newCurrentPage, 
            isInitialLoading: prev.isInitialLoading && pageNumber === 1 ? false : prev.isInitialLoading,
            isPrefetching: shouldPrefetch ? prev.isPrefetching : false // if direct load, prefetching is false. if prefetch, maintain current prefetching state (could be true from other prefetches)
          };
        });
      } else {
        console.log(`[loadPage info] Page ${pageNumber} fetched 0 events.`);
        if (pageNumber === 1 && !shouldPrefetch) {
            setState(prev => ({...prev, isInitialLoading: false, isPrefetching: false }));
        }
        // If a prefetch returns 0 events, it might mean the end of data. Clear its own prefetching contribution.
        // This is tricky; the main isPrefetching flag is managed more broadly.
        // For now, if a specific prefetch yields nothing, it just doesn't add to pages.
      }
    } catch (e: any) {
      console.error(`[loadPage error] For page ${pageNumber}:`, e);
      setError(e.message);
      setState(prev => ({
        ...prev,
        isInitialLoading: false, 
        isPrefetching: false 
      }));
    } finally {
      pageNumbersCurrentlyLoading_ref.current.delete(pageNumber);
      setPageNumbersCurrentlyLoadingState(prev => {
        const next = new Set(prev);
        next.delete(pageNumber);
        console.log(`[loadPage finally] Page ${pageNumber}. Ref count: ${pageNumbersCurrentlyLoading_ref.current.size}. State set count: ${next.size}`);
        // If all `loadPage` operations (including prefetches) are done, ensure isPrefetching is false.
        if (pageNumbersCurrentlyLoading_ref.current.size === 0) {
            setState(currentInternalState => {
              if (currentInternalState.isPrefetching) {
                console.log('[loadPage finally] All page loads complete, ensuring isPrefetching is false.');
                return { ...currentInternalState, isPrefetching: false };
              }
              return currentInternalState;
            });
        }
        return next;
      });
    }
  }, [state.pages, state.totalLoadedPages, state.currentPage, pageNumbersCurrentlyLoadingState, setState, setEventsMappedById, setError, setPageNumbersCurrentlyLoadingState]); 

  const prefetchNextPages = useCallback((currentPageFromCaller: number) => {
    console.log(`[prefetchNextPages attempt] Current isPrefetching state: ${state.isPrefetching}, totalLoadedPages: ${state.totalLoadedPages}, called with currentPage: ${currentPageFromCaller}`);
    if (state.isPrefetching || state.totalLoadedPages >= 20) {
        if(state.isPrefetching) console.log('[prefetchNextPages skip] Already prefetching (state check).');
        if(state.totalLoadedPages >= 20) console.log('[prefetchNextPages skip] Total loaded pages limit reached.');
        return;
    }

    let didInitiatePrefetch = false;
    for (let i = 1; i <= PREFETCH_WINDOW; i++) {
      const nextPageToPrefetch = currentPageFromCaller + i;
      if (nextPageToPrefetch > 20) { // Assuming 20 is the max page number based on MAX_TOTAL_EVENTS/PAGE_SIZE
        console.log(`[prefetchNextPages info] Skipping prefetch for page ${nextPageToPrefetch} as it exceeds page limit 20.`);
        continue;
      }

      if (!state.pages[nextPageToPrefetch]?.isLoaded && !pageNumbersCurrentlyLoading_ref.current.has(nextPageToPrefetch)) {
        console.log(`[prefetchNextPages action] Calling loadPage to prefetch page ${nextPageToPrefetch} (from current main page ${currentPageFromCaller})`);
        loadPage(nextPageToPrefetch, true); 
        if (!didInitiatePrefetch) {
            setState(prev => ({ ...prev, isPrefetching: true })); 
            didInitiatePrefetch = true;
            console.log(`[prefetchNextPages info] Set isPrefetching to true because prefetch for ${nextPageToPrefetch} was initiated.`);
        }
      } else {
        console.log(`[prefetchNextPages info] Skipping prefetch for page ${nextPageToPrefetch}: isLoaded=${state.pages[nextPageToPrefetch]?.isLoaded}, isInRef=${pageNumbersCurrentlyLoading_ref.current.has(nextPageToPrefetch)}`);
      }
    }
    // If no prefetch was actually initiated (e.g., all target pages already loaded/loading, or window is empty)
    // and the state still thinks it's prefetching, turn it off.
    if (!didInitiatePrefetch && state.isPrefetching) {
        setState(prev => ({ ...prev, isPrefetching: false }));
        console.log('[prefetchNextPages info] No prefetch initiated in this call, ensuring isPrefetching is false.');
    }

  }, [state.isPrefetching, state.totalLoadedPages, state.pages, loadPage, pageNumbersCurrentlyLoadingState]);

  const getVisibleEventIds = useCallback(() => {
    const visibleIds: number[] = [];
    Object.values(state.pages)
      .filter(page => page.isLoaded && Array.isArray(page.eventIds)) // ensure eventIds is an array
      .forEach(page => {
        visibleIds.push(...page.eventIds);
      });
    return visibleIds;
  }, [state.pages]);

  return {
    eventIds: getVisibleEventIds(),
    eventsMappedById,
    loading: state.isInitialLoading,
    isLoadingMore: state.isPrefetching || (pageNumbersCurrentlyLoading_ref.current.size > 0 && !state.isInitialLoading),
    error,
    loadPage,
    prefetchNextPages,
    currentPage: state.currentPage,
    totalLoadedPages: state.totalLoadedPages
  };
};

