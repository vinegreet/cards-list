/**
 * Handlers for loading and prefetching event pages.
 * These functions encapsulate the core logic for fetching, caching, and managing event data state.
 */

import { EventsState } from './types';
import { getTotalLoadedRecords } from './utils';
import { fetchEventsData } from '../../api/eventService';
import { Event as EventType } from '../../api/models';
import { PAGE_SIZE, MAX_RECORDS } from '../config';
import React from 'react';

/**
 * Loads a page of events, updates state, and manages loading indicators.
 * @param {Object} params - The parameters for loading a page.
 * @param {number} params.pageNumber - The page number to load.
 * @param {boolean} [params.shouldPrefetch=false] - Whether this is a prefetch operation.
 * @param {EventsState} params.state - The current events state.
 * @param {Function} params.setState - State setter for events state.
 * @param {Function} params.setEventsMappedById - State setter for event data by ID.
 * @param {Function} params.setError - State setter for error messages.
 * @param {React.RefObject<Set<number>>} params.pageNumbersCurrentlyLoading_ref - Ref tracking currently loading pages.
 * @param {React.RefObject<Set<number>>} params.prefetchingPages_ref - Ref tracking currently prefetching pages.
 * @returns {Promise<void>} Resolves when the page load is complete.
 */
export async function loadPageHandler({
  pageNumber,
  shouldPrefetch = false,
  state,
  setState,
  setEventsMappedById,
  setError,
  pageNumbersCurrentlyLoading_ref,
  prefetchingPages_ref
}: {
  pageNumber: number;
  shouldPrefetch?: boolean;
  state: EventsState;
  setState: React.Dispatch<React.SetStateAction<EventsState>>;
  setEventsMappedById: React.Dispatch<React.SetStateAction<Record<number, EventType>>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  pageNumbersCurrentlyLoading_ref: React.RefObject<Set<number>>;
  prefetchingPages_ref: React.RefObject<Set<number>>;
}) {
  
  if (pageNumbersCurrentlyLoading_ref.current.has(pageNumber)) {
    return;
  }

  if (state.totalPages !== null && pageNumber > state.totalPages) {
    if (!shouldPrefetch && state.isPrefetching) {
       setState(prev => ({ ...prev, isPrefetching: false }));
    }
    return;
  }

  if (state.pages[pageNumber]?.isLoaded) {
    if (!shouldPrefetch) {
      setState(prev => {
        if (pageNumber > prev.currentPage) {
          return { ...prev, currentPage: pageNumber, isInitialLoading: false, isPrefetching: false };
        } else if (pageNumber === prev.currentPage && (prev.isInitialLoading || prev.isPrefetching)) {
          return { ...prev, isInitialLoading: false, isPrefetching: false };
        }
        return prev;
      });
    }
    return;
  }

  if (getTotalLoadedRecords(state.pages) >= MAX_RECORDS || (state.totalPages !== null && pageNumber > state.totalPages)) {
    return;
  }
  
  try {
    pageNumbersCurrentlyLoading_ref.current.add(pageNumber);
    if (shouldPrefetch) {
      prefetchingPages_ref.current.add(pageNumber);
    }
    if (!shouldPrefetch) {
      setState(prev => ({ ...prev, isInitialLoading: pageNumber === 1 && !prev.pages[1]?.isLoaded, isPrefetching: false }));
    }

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
        return { ...prev, ...updatePayload };
      });
    } else {
      setState(prev => {
          const newTotalPages = paginationInfo?.totalPages !== undefined ? paginationInfo.totalPages : prev.totalPages;
          let finalTotalPages = newTotalPages;

          if (newTotalPages !== null && pageNumber > newTotalPages) {
              finalTotalPages = newTotalPages;
          } else if (fetchedCount === 0 && newTotalPages === null && pageNumber === 1) {
              finalTotalPages = 1; 
          }

          if (!shouldPrefetch) {
              return {...prev, isInitialLoading: false, isPrefetching: false, totalPages: finalTotalPages };
          }
          return {...prev, totalPages: finalTotalPages};
      });
    }
  } catch (e: any) {
    console.error(`[loadPage error] For page ${pageNumber}:`, e);
    setError(e.message);
    setState(prev => {
      const updatePayload: Partial<EventsState> = {
        isInitialLoading: (prev.isInitialLoading && pageNumber === 1 && !shouldPrefetch) ? false : prev.isInitialLoading,
      };
      if (!shouldPrefetch) {
        updatePayload.isPrefetching = false;
      }
      return { ...prev, ...updatePayload };
    });
  } finally {
    pageNumbersCurrentlyLoading_ref.current.delete(pageNumber);
    if (shouldPrefetch) {
      prefetchingPages_ref.current.delete(pageNumber);
    }
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
}

/**
 * Prefetches the next page of events if not already prefetching or at the data limit.
 * @param {Object} params - The parameters for prefetching.
 * @param {number} params.currentPageFromCaller - The current page number.
 * @param {EventsState} params.state - The current events state.
 * @param {Function} params.setState - State setter for events state.
 * @param {Function} params.loadPage - Function to load a page.
 * @param {React.RefObject<Set<number>>} params.pageNumbersCurrentlyLoading_ref - Ref tracking currently loading pages.
 * @param {React.RefObject<Set<number>>} params.prefetchingPages_ref - Ref tracking currently prefetching pages.
 */
export function prefetchNextPagesHandler({
  currentPageFromCaller,
  state,
  setState,
  loadPage,
  pageNumbersCurrentlyLoading_ref,
  prefetchingPages_ref
}: {
  currentPageFromCaller: number;
  state: EventsState;
  setState: React.Dispatch<React.SetStateAction<EventsState>>;
  loadPage: (pageNumber: number, shouldPrefetch?: boolean) => void;
  pageNumbersCurrentlyLoading_ref: React.RefObject<Set<number>>;
  prefetchingPages_ref: React.RefObject<Set<number>>;
}) {
  if (state.isPrefetching || getTotalLoadedRecords(state.pages) >= MAX_RECORDS || (state.totalPages !== null && currentPageFromCaller >= state.totalPages)) {
      return;
  }

  const nextPageToPrefetch = currentPageFromCaller + 1;
  if ((state.totalPages !== null && nextPageToPrefetch > state.totalPages) || getTotalLoadedRecords(state.pages) + PAGE_SIZE > MAX_RECORDS) {
    return; 
  }
  if (!state.pages[nextPageToPrefetch]?.isLoaded && !pageNumbersCurrentlyLoading_ref.current.has(nextPageToPrefetch)) {
    prefetchingPages_ref.current = new Set([nextPageToPrefetch]);
    setState(prev => ({ ...prev, isPrefetching: true }));
    loadPage(nextPageToPrefetch, true);
  }
}
