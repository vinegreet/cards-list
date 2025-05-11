import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import './App.css';
import { Card } from './components/Card';
import { EventsContext, EventsContextType } from './context';
import { fetchEventsData } from './api/eventService';
import { Event as EventType } from './api/models';

const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 20px;
  padding: 20px;
`;

function App() {
  const [eventIds, setEventIds] = useState<number[]>([]);
  const [eventsMappedById, setEventsMappedById] = useState<Record<number, EventType>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        const { ids, mappedById } = await fetchEventsData();
        setEventIds(ids);
        setEventsMappedById(mappedById);
        setError(null);
      } catch (e: any) {
        setError(e.message);
        setEventIds([]);
        setEventsMappedById({});
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  const contextValue: EventsContextType = { eventIds, eventsMappedById, loading, error };

  return (
    <EventsContext.Provider value={contextValue}>
      <div className="App">
        <EventsDisplay />
      </div>
    </EventsContext.Provider>
  );
}

function EventsDisplay() {
  const { eventIds: displayEventIds, loading: displayLoading, error: displayError } = React.useContext(EventsContext)!;

  if (displayLoading) {
    return <div>Loading events...</div>;
  }

  if (displayError) {
    return <div>Error fetching events: {displayError}</div>;
  }

  if (!displayEventIds || displayEventIds.length === 0) {
    return <div>No events found.</div>;
  }

  return (
    <CardsContainer>
      {displayEventIds.map(id => (
        <Card key={id} eventId={id} />
      ))}
    </CardsContainer>
  );
}

export default App;
