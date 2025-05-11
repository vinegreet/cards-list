import { useContext } from 'react';
import { EventsContext } from '../context'; // Path relative to src/api/

// Define the custom hook to use the EventsContext
export const useEvents = () => {
  const context = useContext(EventsContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventsProvider');
  }
  return context;
};
