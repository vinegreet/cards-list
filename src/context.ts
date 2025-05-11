import { createContext } from 'react';
import { Event as EventType } from './api/models'; // Path relative to src/

// Define the context type
export interface EventsContextType {
  eventIds: number[];
  eventsMappedById: Record<number, EventType>;
  loading: boolean;
  error: string | null;
  // Added for lazy loading
  loadMoreEvents: () => void;
  isLoadingMore: boolean;
  canLoadMore: boolean;
}

// Create the context
// The default value is undefined, consumers must be within a Provider
export const EventsContext = createContext<EventsContextType | undefined>(undefined);
