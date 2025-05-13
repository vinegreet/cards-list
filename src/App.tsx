import React, { useEffect } from 'react';
import './App.css';
import { EventsContext, EventsContextType } from './logic/context';
import { EventsDisplay } from './components/EventsDisplay';
import { usePageLoader } from './logic/hooks';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  overflow-y: auto;
  background: #F5F2F0;
`;

function App() {
  const {
    eventIds,
    eventsMappedById,
    loading,
    isLoadingMore,
    error,
    loadPage,
    prefetchNextPages,
    currentPage,
    totalLoadedPages
  } = usePageLoader();

  useEffect(() => {
    if (totalLoadedPages === 0) {
      loadPage(1);
    }
  }, [loadPage, totalLoadedPages]);

  const handleLoadMore = () => {
    console.log('handleLoadMore 1')
    if (!loading && !isLoadingMore && totalLoadedPages < 20) {
      console.log('handleLoadMore 2')
      const nextPage = currentPage + 1;
      loadPage(nextPage);
      prefetchNextPages(nextPage);
    }
  };

  const contextValue: EventsContextType = {
    eventIds,
    eventsMappedById,
    loading,
    error,
    loadMoreEvents: handleLoadMore,
    isLoadingMore,
    canLoadMore: totalLoadedPages < 20
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
