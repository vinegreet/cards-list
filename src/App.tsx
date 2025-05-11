import React, { createContext, useState, useEffect, useContext } from 'react';
import styled from 'styled-components'; // Import styled-components
import './App.css';
import { Card } from './components/Card';
import { dataUrl } from './api/urls';
import { EventsApiResponse, Event as EventType } from './api/models'; // Renamed Event to EventType to avoid conflict

// Define the context
interface EventsContextType {
  events: EventType[];
  loading: boolean;
  error: string | null;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};

// Define CardsContainer styled component
const CardsContainer = styled.div`
  display: flex;
  flex-wrap: wrap; // Allow cards to wrap to the next line
  justify-content: center; // Center cards on the line
  gap: 20px; // Add some space between cards
  padding: 20px; // Add some padding around the container
`;

function App() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result: EventsApiResponse = await response.json();
        if (result.status === "OK") {
          setEvents(result.data.records);
        } else {
          setError(result.message || "Failed to fetch events");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <EventsContext.Provider value={{ events, loading, error }}>
      <div className="App">
        <EventsDisplay />
      </div>
    </EventsContext.Provider>
  );
}

// New component to consume context and display cards
function EventsDisplay() {
  const { events, loading, error } = useEvents();

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error fetching events: {error}</div>;
  }

  if (!events || events.length === 0) {
    return <div>No events found.</div>;
  }

  // For now, let's render a Card for each event.
  // Or, if you only want to render one card for the first event:
  // return <Card event={events[0]} />;
  return (
    <CardsContainer>
      {events.map(event => (
        <Card key={event.id} event={event} />
      ))}
    </CardsContainer>
  );
}

export default App;
