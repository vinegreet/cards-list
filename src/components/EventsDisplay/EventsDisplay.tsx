import React, { useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { EventsContext, EventsContextType } from '../../logic/context';
import { EventCard } from '../EventCard';

// Styled components moved from App.tsx
const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20px;
  padding: 20px;
`;

const LoadingIndicator = styled.div`
  width: 100%;
  text-align: center;
  padding: 20px;
  color: #666;
  color: #fff;
`;

export function EventsDisplay() {
  const {
    eventIds: displayEventIds,
    loading: displayInitialLoading,
    error: displayError,
    loadMoreEvents,
    isLoadingMore,
    canLoadMore,
  } = React.useContext(EventsContext)! as EventsContextType; // Added type assertion for safety

  const observer = useRef<IntersectionObserver>(null);
  const lastCardRef = useCallback((node: HTMLDivElement) => {
    if (isLoadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && canLoadMore) {
        loadMoreEvents();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoadingMore, canLoadMore, loadMoreEvents]);

  if (displayInitialLoading && (!displayEventIds || displayEventIds.length === 0)) {
    return <LoadingIndicator>Loading events...</LoadingIndicator>;
  }

  if (displayError && (!displayEventIds || displayEventIds.length === 0)) {
    return <LoadingIndicator>Error fetching events: {displayError}</LoadingIndicator>;
  }

  if (!displayInitialLoading && (!displayEventIds || displayEventIds.length === 0) && !displayError) {
    return <LoadingIndicator>No events found.</LoadingIndicator>;
  }

  return (
    <CardsContainer>
      {displayEventIds.map((id, index) => (
        <div 
          key={id} 
          ref={index === displayEventIds.length - 1 ? lastCardRef : undefined}
        >
          <EventCard eventId={id} />
        </div>
      ))}
      {isLoadingMore && <LoadingIndicator>Loading more events...</LoadingIndicator>}
    </CardsContainer>
  );
} 