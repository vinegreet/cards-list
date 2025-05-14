import React, { useEffect } from 'react';
import { EventsContext, EventsContextType } from './logic/context';
import { EventsDisplay } from './components/EventsDisplay';
import { usePageLoader } from './logic/hooks';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  background: #F5F2F0;
  /*background-color: #444;*/ /* For evenings */
`;

function App() {
  const {
    eventIds,
    eventsMappedById,
    loading,
    isLoadingMore,
    error,
    prefetchNextPages,
    canLoadMore,
    lastLoadedPage,
  } = usePageLoader();

  const handleLoadMore = () => {
    if (!loading && !isLoadingMore && canLoadMore) {
      prefetchNextPages(lastLoadedPage);
    }
  };

  const contextValue: EventsContextType = {
    eventIds,
    eventsMappedById,
    loading,
    error,
    loadMoreEvents: handleLoadMore,
    isLoadingMore,
    canLoadMore,
  };

  return (
    <EventsContext.Provider value={contextValue}>
      <AppContainer>
        <EventsDisplay />
      </AppContainer>
    </EventsContext.Provider>
  );
}

export default App;
