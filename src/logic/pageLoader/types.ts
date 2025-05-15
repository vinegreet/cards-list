/**
 * Types for event page loading and state management.
 * Defines the structure of page and events state used throughout the loader logic.
 */

/**
 * Represents the state of a single page of events.
 */
export interface PageState {
  pageNumber: number;
  eventIds: number[];
  isLoaded: boolean;
  isPrefetched: boolean;
}

/**
 * Represents the overall state for paginated event data.
 */
export interface EventsState {
  pages: Record<number, PageState>;
  currentPage: number;
  totalLoadedPages: number;
  isInitialLoading: boolean;
  isPrefetching: boolean;
  totalPages: number | null;
}
