import { useContext, useCallback, useRef, useState, useEffect } from 'react';
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
const FIRST_BATCH = 2; // Number of pages to fetch directly when first loading
const PREFETCH_BATCH = 5; // Number of pages to prefetch ahead
// TODO: switch to 20 pages, but only prefetch when current events loaded their assets

/**
 * `usePageLoader` is a custom hook responsible for managing the fetching, caching, 
 * and pagination of event data. It handles the state for loaded pages, 
 * individual event data mapped by ID, loading indicators (initial, more, prefetching), 
 * error states, and provides functions to load and prefetch pages.
 * This hook encapsulates the core logic for lazy loading and prefetching event items.
 *
 * Key features:
 * - Loads event data page by page, with a hard limit of 20 pages.
 * - Prefetches a batch of pages (PREFETCH_BATCH) ahead when needed.
 * - Ensures prefetching is only considered complete when all pages in the batch are loaded.
 * - Prevents duplicate loads and manages loading state for both direct and prefetch loads.
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

  const loadPage = useCallback(async (pageNumber: number, shouldPrefetch: boolean = false) => {
    // Prevent duplicate loads for the same page
    if (pageNumbersCurrentlyLoading_ref.current.has(pageNumber)) {
      return;
    }

    // If we've already reached the last page, don't load further
    if (state.totalPages !== null && pageNumber > state.totalPages) {
      // If this was a direct load and prefetching is still marked, clear it
      if (!shouldPrefetch && state.isPrefetching) {
         setState(prev => ({ ...prev, isPrefetching: false }));
      }
      return;
    }

    // If the page is already loaded, update state if needed and return
    if (state.pages[pageNumber]?.isLoaded) {
      if (!shouldPrefetch) {
        setState(prev => {
          if (pageNumber > prev.currentPage) {
            // Navigating forward: update current page and clear loading states
            return { ...prev, currentPage: pageNumber, isInitialLoading: false, isPrefetching: false };
          } else if (pageNumber === prev.currentPage && (prev.isInitialLoading || prev.isPrefetching)) {
            // If we're on the same page and still marked as loading, clear loading states
            return { ...prev, isInitialLoading: false, isPrefetching: false };
          }
          return prev;
        });
      }
      return;
    }

    // Enforce a hard limit of 20 pages
    if (state.totalLoadedPages >= 20 || (state.totalPages !== null && pageNumber > state.totalPages)) {
      return;
    }
    
    try {
      pageNumbersCurrentlyLoading_ref.current.add(pageNumber);
      // Track this page as part of the current prefetch batch if prefetching
      if (shouldPrefetch) {
        prefetchingPages_ref.current.add(pageNumber);
      }
      // For direct loads, set initial loading state and ensure prefetching is marked false.
      if (!shouldPrefetch) {
        setState(prev => ({ ...prev, isInitialLoading: pageNumber === 1 && !prev.pages[1]?.isLoaded, isPrefetching: false }));
      }
      // NOTE: If shouldPrefetch is true, we NO LONGER set isPrefetching: true here.
      // This will be managed by prefetchNextPages for the batch.

      const { ids, mappedById, fetchedCount, paginationInfo } = await fetchEventsData(pageNumber, PAGE_SIZE);

      if (fetchedCount > 0) {
        setEventsMappedById(prev => ({ ...prev, ...mappedById }));
        setState(prev => {
          const newCurrentPage = !shouldPrefetch && pageNumber > prev.currentPage ? pageNumber : prev.currentPage;
          const newTotalPages = paginationInfo?.totalPages !== undefined ? paginationInfo.totalPages : prev.totalPages;

          const updatePayload: Partial<EventsState> = {
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
            isInitialLoading: prev.isInitialLoading && pageNumber === 1 && !shouldPrefetch ? false : prev.isInitialLoading,
            totalPages: newTotalPages,
          };

          if (!shouldPrefetch) {
            updatePayload.isPrefetching = false;
          }
          // If shouldPrefetch is true, isPrefetching is NOT included in updatePayload,
          // so it preserves the value set by prefetchNextPages (true) or a previous direct load (false).

          return { ...prev, ...updatePayload };
        });
        // After loading the first page directly, trigger prefetch for the next batch
        if (pageNumber === 1 && !shouldPrefetch && prefetchNextPagesRef.current) {
          Promise.resolve().then(() => {
            if (prefetchNextPagesRef.current) {
              prefetchNextPagesRef.current(1);
            }
          });
        }
      } else {
        setState(prev => {
            const newTotalPages = paginationInfo?.totalPages !== undefined ? paginationInfo.totalPages : prev.totalPages;
            let finalTotalPages = newTotalPages;

            // If we know the total pages and this page is past the end, set finalTotalPages
            if (newTotalPages !== null && pageNumber > newTotalPages) {
                finalTotalPages = newTotalPages;
            } else if (fetchedCount === 0 && newTotalPages === null && pageNumber === 1) {
                // If no items at all, set totalPages to 1
                finalTotalPages = 1; 
            }

            if (!shouldPrefetch) { // Direct load resulting in no items
                return {...prev, isInitialLoading: false, isPrefetching: false, totalPages: finalTotalPages };
            }
            // Prefetch load resulting in no items, just update totalPages. isPrefetching not touched here.
            return {...prev, totalPages: finalTotalPages};
        });
      }
    } catch (e: any) {
      // Handle errors and clear loading state as appropriate
      console.error(`[loadPage error] For page ${pageNumber}:`, e);
      setError(e.message);
      setState(prev => {
        const updatePayload: Partial<EventsState> = {
          isInitialLoading: (prev.isInitialLoading && pageNumber === 1 && !shouldPrefetch) ? false : prev.isInitialLoading,
        };
        if (!shouldPrefetch) {
          updatePayload.isPrefetching = false;
        }
        // If shouldPrefetch is true, isPrefetching is NOT included in updatePayload.

        return { ...prev, ...updatePayload };
      });
    } finally {
      pageNumbersCurrentlyLoading_ref.current.delete(pageNumber);
      if (shouldPrefetch) {
        prefetchingPages_ref.current.delete(pageNumber);
      }
      // Only set isPrefetching to false when all prefetching pages are done
      if (shouldPrefetch && prefetchingPages_ref.current.size === 0) {
        setState(currentInternalState => {
          if (currentInternalState.isPrefetching) {
            return { ...currentInternalState, isPrefetching: false };
          }
          return currentInternalState;
        });
      } else if (!shouldPrefetch && pageNumbersCurrentlyLoading_ref.current.size === 0) {
        setState(currentInternalState => {
          if (currentInternalState.isPrefetching) {
            return { ...currentInternalState, isPrefetching: false };
          }
          return currentInternalState;
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.pages, state.totalLoadedPages, state.currentPage, state.totalPages, setState, setEventsMappedById, setError /* prefetchNextPagesRef.current will be stable via ref */]); 

  useEffect(() => {
    // On initial mount, fetch FIRST_BATCH pages in parallel
    if (state.totalLoadedPages === 0) {
      for (let i = 1; i <= FIRST_BATCH; i++) {
        loadPage(i, false); // false: not a prefetch, but initial batch
      }
    }
  }, [loadPage, state.totalLoadedPages]);

  /**
   * Prefetches the next PREFETCH_BATCH pages after the current page, as a batch.
   * Will not start a new batch if already prefetching, or if at the page/data limit.
   * Only sets isPrefetching to false after all pages in the batch are loaded.
   */
  const prefetchNextPages = useCallback((currentPageFromCaller: number) => {
    // Do not prefetch if already prefetching, or if at the page/data limit
    if (state.isPrefetching || state.totalLoadedPages >= 20 || (state.totalPages !== null && currentPageFromCaller >= state.totalPages)) {
        return;
    }

    const pagesToAttemptPrefetch: number[] = [];
    for (let i = 1; i <= PREFETCH_BATCH; i++) {
      const nextPageToPrefetch = currentPageFromCaller + i;
      // Stop if we hit known total pages or hard limit
      if ((state.totalPages !== null && nextPageToPrefetch > state.totalPages) || nextPageToPrefetch > 20) {
        break; 
      }
      // Only prefetch pages that are not already loaded or loading
      if (!state.pages[nextPageToPrefetch]?.isLoaded && !pageNumbersCurrentlyLoading_ref.current.has(nextPageToPrefetch)) {
        pagesToAttemptPrefetch.push(nextPageToPrefetch);
      }
    }

    if (pagesToAttemptPrefetch.length > 0) {
      // Track the batch of prefetching pages
      prefetchingPages_ref.current = new Set(pagesToAttemptPrefetch);
      setState(prev => ({ ...prev, isPrefetching: true }));
      pagesToAttemptPrefetch.forEach(pageNumber => {
        loadPage(pageNumber, true); // shouldPrefetch is true
      });
    }
    // isPrefetching will be set to false by the finally block in the last loadPage call from this batch.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isPrefetching, state.totalLoadedPages, state.pages, loadPage, state.totalPages, pageNumbersCurrentlyLoading_ref]); // pageNumbersCurrentlyLoading_ref is stable

  // Assign to ref for loadPage
  useEffect(() => {
    prefetchNextPagesRef.current = prefetchNextPages;
  }, [prefetchNextPages]);

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
    prefetchNextPages,
    canLoadMore: state.totalPages === null || Object.keys(state.pages).length < state.totalPages,
    lastLoadedPage: state.totalLoadedPages,
    totalPages: state.totalPages,
  };
};

