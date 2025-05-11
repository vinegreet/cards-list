import axios, { AxiosResponse } from 'axios';
import { dataUrl } from './urls';
import { EventsApiResponse, Event as EventType } from './models';

interface FetchEventsResult {
  ids: number[];
  mappedById: Record<number, EventType>;
}

export const fetchEventsData = async (): Promise<FetchEventsResult> => {
  try {
    const response: AxiosResponse<EventsApiResponse> = await axios.get(dataUrl);
    const result = response.data;

    if (result.status === "OK") {
      const records = result.data.records;
      const ids = records.map(event => event.id);
      const mappedById = records.reduce((acc, event) => {
        acc[event.id] = event;
        return acc;
      }, {} as Record<number, EventType>);
      return { ids, mappedById };
    } else {
      throw new Error(result.message || "Failed to fetch events due to API status not OK");
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || "An unknown error occurred while fetching events");
    } else {
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
};
