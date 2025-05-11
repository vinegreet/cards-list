import React from 'react';
import styled from 'styled-components';
import { EventsContext, EventsContextType } from '../../context'; // Adjusted path
import { Card } from '../Card'; // Assuming Card is in src/components/Card

// Styled components moved from App.tsx
const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px;
`;

const LoadMoreButton = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  margin: 20px;
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

  if (displayInitialLoading && (!displayEventIds || displayEventIds.length === 0)) {
    return <div>Loading events...</div>;
  }

  if (displayError && (!displayEventIds || displayEventIds.length === 0)) {
    return <div>Error fetching events: {displayError}</div>;
  }

  if (!displayInitialLoading && (!displayEventIds || displayEventIds.length === 0) && !displayError) {
    return <div>No events found.</div>;
  }

  return (
    <>
      <CardsContainer>
        {displayEventIds.map(id => (
          <Card key={id} eventId={id} />
        ))}
      </CardsContainer>
      {/* Button is always rendered, but its state (text, disabled) changes based on context */}
      {(displayEventIds && displayEventIds.length > 0) && (
        <LoadMoreButton onClick={loadMoreEvents} disabled={isLoadingMore || !canLoadMore}>
          {isLoadingMore
            ? 'Loading...'
            : canLoadMore
            ? 'Load More Events'
            : 'All Events Loaded'}
        </LoadMoreButton>
      )}
    </>
  );
} 