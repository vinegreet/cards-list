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
  totalPages: number | null;
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
    isPrefetching: false,
    totalPages: null,
  });

  const [eventsMappedById, setEventsMappedById] = useState<Record<number, EventType>>({});
  const [error, setError] = useState<string | null>(null);
  const [pageNumbersCurrentlyLoadingState, setPageNumbersCurrentlyLoadingState] = useState<Set<number>>(new Set());
  const pageNumbersCurrentlyLoading_ref = useRef<Set<number>>(new Set());

  const loadPage = useCallback(async (pageNumber: number, shouldPrefetch: boolean = false) => {
    if (pageNumbersCurrentlyLoading_ref.current.has(pageNumber)) {
      return;
    }

    // Prevent fetching if pageNumber exceeds totalPages
    if (state.totalPages !== null && pageNumber > state.totalPages) {
      // If it's a direct load attempt for a page beyond totalPages,
      // and we thought we could load more, update isPrefetching just in case.
      // This might happen if totalPages was updated after a prefetch was queued.
      if (!shouldPrefetch && state.isPrefetching) {
         setState(prev => ({ ...prev, isPrefetching: false }));
      }
      return;
    }

    // Handle already loaded pages (e.g. prefetched page being directly loaded now)
    if (state.pages[pageNumber]?.isLoaded) {
      if (!shouldPrefetch) {
        // This is a direct load attempt for an already loaded page.
        // Update currentPage if it's advancing, and ensure loading flags are off.
        setState(prev => {
          if (pageNumber > prev.currentPage) {
            return { ...prev, currentPage: pageNumber, isInitialLoading: false, isPrefetching: false };
          } else if (pageNumber === prev.currentPage && (prev.isInitialLoading || prev.isPrefetching)) {
            // If loading current page again (e.g. initial load completed by prefetch, then direct load called)
            return { ...prev, isInitialLoading: false, isPrefetching: false };
          }
          return prev; // No change needed if not advancing or not clearing flags
        });
      }
      // For prefetches of already loaded pages, or direct loads not advancing currentPage, nothing more to do here.
      return;
    }

    // Guard for total page limit if the page is NOT yet loaded
    // Also, ensure we don't try to load beyond known totalPages if available
    if (state.totalLoadedPages >= 20 || (state.totalPages !== null && pageNumber > state.totalPages)) {
      return;
    }
    
    try {
      pageNumbersCurrentlyLoading_ref.current.add(pageNumber);
      setPageNumbersCurrentlyLoadingState(prev => new Set(prev).add(pageNumber));

      if (!shouldPrefetch) {
        setState(prev => ({ ...prev, isInitialLoading: pageNumber === 1 && !prev.pages[1]?.isLoaded, isPrefetching: false }));
      } else {
        setState(prev => ({ ...prev, isPrefetching: true }));
      }

      const { ids, mappedById, fetchedCount, paginationInfo } = await fetchEventsData(pageNumber, PAGE_SIZE);

      if (fetchedCount > 0) {
        setEventsMappedById(prev => ({ ...prev, ...mappedById }));
        setState(prev => {
          const newCurrentPage = !shouldPrefetch && pageNumber > prev.currentPage ? pageNumber : prev.currentPage;
          const newTotalPages = paginationInfo?.totalPages !== undefined ? paginationInfo.totalPages : prev.totalPages;

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
            isPrefetching: shouldPrefetch ? prev.isPrefetching : false,
            totalPages: newTotalPages,
          };
        });
      } else {
        // If no events were fetched, it might be an empty page or past the last page.
        // Update totalPages if this fetch gives us that info (e.g. if API confirms current page is out of bounds by returning totalPages)
        // Or, if this was page 1 and it's empty, it implies 0 or 1 total pages.
        setState(prev => {
            const newTotalPages = paginationInfo?.totalPages !== undefined ? paginationInfo.totalPages : prev.totalPages;
            let finalTotalPages = newTotalPages;

            // If the current page number is greater than the reported totalPages,
            // or if fetchedCount is 0 (and we have totalPages info),
            // it's good to ensure our state.totalPages reflects the reality.
            if (newTotalPages !== null && pageNumber > newTotalPages) {
                finalTotalPages = newTotalPages;
            } else if (fetchedCount === 0 && newTotalPages !== null) {
                 // If we fetched 0 events, and we know totalPages,
                 // and the current pageNumber is within this known totalPages,
                 // this implies this page is empty but valid.
                 // If pageNumber is greater than newTotalPages, it means we already are past the end.
                 // If pageNumber *is* newTotalPages and it's empty, then that's the end.
                 // If pageNumber is less than newTotalPages and it's empty, it's an empty page.
                 // No specific change to finalTotalPages based on this alone unless pageNumber > newTotalPages
            } else if (fetchedCount === 0 && newTotalPages === null && pageNumber === 1) {
                // If page 1 is empty and we don't know total pages yet, assume totalPages is 1 (or 0).
                // Setting to 1 to prevent further fetches unless API says otherwise later.
                finalTotalPages = 1; 
            }


            if (pageNumber === 1 && !shouldPrefetch) {
                return {...prev, isInitialLoading: false, isPrefetching: false, totalPages: finalTotalPages };
            }
            // For other cases (prefetch returning 0, or non-initial load returning 0)
            // update totalPages and ensure prefetching flag is handled.
            // If this was a prefetch that returned 0 items, and we are still prefetching,
            // this specific loadPage call should not by itself turn off global isPrefetching,
            // as other prefetches might be in progress. The finally block handles global isPrefetching.
            return {...prev, totalPages: finalTotalPages};
        });
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
        if (pageNumbersCurrentlyLoading_ref.current.size === 0) {
            setState(currentInternalState => {
              if (currentInternalState.isPrefetching) {
                return { ...currentInternalState, isPrefetching: false };
              }
              return currentInternalState;
            });
        }
        return next;
      });
    }
  }, [state.pages, state.totalLoadedPages, state.currentPage, state.totalPages, setState, setEventsMappedById, setError, setPageNumbersCurrentlyLoadingState]); 

  const prefetchNextPages = useCallback((currentPageFromCaller: number) => {
    if (state.isPrefetching || state.totalLoadedPages >= 20 || (state.totalPages !== null && currentPageFromCaller >= state.totalPages)) {
        return;
    }

    let didInitiatePrefetch = false;
    for (let i = 1; i <= PREFETCH_WINDOW; i++) {
      const nextPageToPrefetch = currentPageFromCaller + i;
      // Stop prefetching if nextPageToPrefetch exceeds totalPages or the 20-page hard limit
      if ((state.totalPages !== null && nextPageToPrefetch > state.totalPages) || nextPageToPrefetch > 20) {
        continue;
      }

      if (!state.pages[nextPageToPrefetch]?.isLoaded && !pageNumbersCurrentlyLoading_ref.current.has(nextPageToPrefetch)) {
        loadPage(nextPageToPrefetch, true); 
        if (!didInitiatePrefetch) {
            setState(prev => ({ ...prev, isPrefetching: true })); 
            didInitiatePrefetch = true;
        }
      }
    }
    // If no prefetch was actually initiated (e.g., all target pages already loaded/loading, or window is empty)
    // and the state still thinks it's prefetching, turn it off.
    if (!didInitiatePrefetch && state.isPrefetching) {
        setState(prev => ({ ...prev, isPrefetching: false }));
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
    totalLoadedPages: state.totalLoadedPages,
    totalPages: state.totalPages,
  };
};

