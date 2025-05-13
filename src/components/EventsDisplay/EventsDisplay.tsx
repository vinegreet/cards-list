import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { EventsContext, EventsContextType } from '../../logic/context';
import { EventCard } from '../EventCard';
import { AnimatedLoader } from '../styling/Loaders';
import { PREFETCH_TRIGGER_DISTANCE } from '../../logic/config';

// Styled components moved from App.tsx
const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20px;
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
`;

const LoadingIndicator = styled.div`
  width: 100%;
  text-align: center;
  padding: 20px;
  color: #666;
  color: #fff;
`;

const Sentinel = styled.div`
  width: 100%;
  height: 50px;
  margin-top: 20px;
`;

export function EventsDisplay() {
  const {
    eventIds: displayEventIds,
    loading: displayInitialLoading,
    error: displayError,
    loadMoreEvents,
    isLoadingMore,
    canLoadMore,
  } = React.useContext(EventsContext)! as EventsContextType;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const observer = useRef<IntersectionObserver | undefined>(undefined);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: `0px 0px ${100 * PREFETCH_TRIGGER_DISTANCE}% 0px`,
      threshold: 0.1
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && canLoadMore && !isLoadingMore) {
        loadMoreEvents();
      }
    };

    observer.current = new IntersectionObserver(handleIntersect, observerOptions);

    if (sentinelRef.current) {
      observer.current.observe(sentinelRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [canLoadMore, isLoadingMore, loadMoreEvents]);

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
      {displayEventIds.map(id => (
        <EventCard key={id} eventId={id} />
      ))}
      <Sentinel ref={sentinelRef} />
      {isLoadingMore && <AnimatedLoader />}
    </CardsContainer>
  );
} 