import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { EventsContext, EventsContextType } from './context';
import { fetchEventsData } from './api/eventService';
import { Event as EventType } from './api/models';
import { EventsDisplay } from './components/EventsDisplay';

const PAGE_SIZE = 10;
const MAX_TOTAL_EVENTS = 100;

function App() {
  const [allLoadedEventIds, setAllLoadedEventIds] = useState<number[]>([]);
  const [eventsMappedById, setEventsMappedById] = useState<Record<number, EventType>>({});
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMoreApiData, setHasMoreApiData] = useState<boolean>(true);

  const loadEvents = useCallback(async (pageToLoad: number) => {
    const isInitialLoad = pageToLoad === 1;

    if (allLoadedEventIds.length >= MAX_TOTAL_EVENTS && hasMoreApiData) {
      setHasMoreApiData(false); 
      if(isInitialLoad) setLoadingInitial(false);
      else setLoadingMore(false);
      return;
    }
    if (!hasMoreApiData || allLoadedEventIds.length >= MAX_TOTAL_EVENTS) {
        if(isInitialLoad) setLoadingInitial(false);
        else setLoadingMore(false);
        return;
    }

    if (isInitialLoad) {
      setLoadingInitial(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      let {
        ids: receivedIdsFromApi,
        mappedById: receivedMappedByIdFromApi,
        hasMore: apiHasMoreResponse,
        fetchedCount: receivedFetchedCount
      } = await fetchEventsData(pageToLoad, PAGE_SIZE);

      if (isInitialLoad && receivedFetchedCount > PAGE_SIZE) {
        console.warn(`API returned ${receivedFetchedCount} items for initial page (requested ${PAGE_SIZE}). Truncating to ${PAGE_SIZE}.`);
        receivedIdsFromApi = receivedIdsFromApi.slice(0, PAGE_SIZE);
        const truncatedMap: Record<number, EventType> = {};
        for (const id of receivedIdsFromApi) {
          if (receivedMappedByIdFromApi[id]) {
            truncatedMap[id] = receivedMappedByIdFromApi[id];
          }
        }
        receivedMappedByIdFromApi = truncatedMap;
        receivedFetchedCount = receivedIdsFromApi.length;
      }
      
      if (receivedFetchedCount > 0) {
        const currentTotalCount = allLoadedEventIds.length;
        const newEventIdsToAdd: number[] = [];
        const newEventsToMap: Record<number, EventType> = {};

        for (const newId of receivedIdsFromApi) {
          if (currentTotalCount + newEventIdsToAdd.length < MAX_TOTAL_EVENTS) {
            if (!eventsMappedById[newId]) {
              newEventIdsToAdd.push(newId);
              newEventsToMap[newId] = receivedMappedByIdFromApi[newId];
            }
          } else {
            break; 
          }
        }

        if (newEventIdsToAdd.length > 0) {
            setAllLoadedEventIds(prevIds => [...prevIds, ...newEventIdsToAdd]);
            setEventsMappedById(prevMap => ({ ...prevMap, ...newEventsToMap }));
        }
      }
      
      const canStillAddMoreBasedOnClientLimit = allLoadedEventIds.length + receivedFetchedCount < MAX_TOTAL_EVENTS;
      setHasMoreApiData(apiHasMoreResponse && canStillAddMoreBasedOnClientLimit && receivedFetchedCount > 0);
      setCurrentPage(pageToLoad);

    } catch (e: any) {
      setError(e.message);
      console.error("Error in loadEvents App.tsx:", e);
    } finally {
      if (isInitialLoad) {
        setLoadingInitial(false);
      } else {
        setLoadingMore(false);
      }
    }
  }, [allLoadedEventIds.length, hasMoreApiData, eventsMappedById]); 

  useEffect(() => {
    if (allLoadedEventIds.length === 0 && hasMoreApiData) {
        loadEvents(1); 
    }
  }, [loadEvents, allLoadedEventIds.length, hasMoreApiData]);

  const handleLoadMore = () => {
    if (!loadingInitial && !loadingMore && hasMoreApiData && allLoadedEventIds.length < MAX_TOTAL_EVENTS) {
      loadEvents(currentPage + 1);
    }
  };
  
  const canLoadMoreClientSide = hasMoreApiData && allLoadedEventIds.length < MAX_TOTAL_EVENTS;

  const contextValue: EventsContextType = {
    eventIds: allLoadedEventIds,
    eventsMappedById,
    loading: loadingInitial,
    error,
    loadMoreEvents: handleLoadMore,
    isLoadingMore: loadingMore,
    canLoadMore: canLoadMoreClientSide,
  };

  return (
    <EventsContext.Provider value={contextValue}>
      <div className="App">
        <EventsDisplay />
      </div>
    </EventsContext.Provider>
  );
}

export default App;
