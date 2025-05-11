import axios, { AxiosResponse } from 'axios';
import { getDataUrl } from './urls';
import { EventsApiResponse, Event as EventType, Pagination } from './models';

interface FetchEventsResult {
  ids: number[];
  mappedById: Record<number, EventType>;
  hasMore: boolean;
  fetchedCount: number;
  paginationInfo?: Pagination;
}

export const fetchEventsData = async (page: number, pageSize: number): Promise<FetchEventsResult> => {
  try {
    const dynamicDataUrl = getDataUrl(page, pageSize);
    const response: AxiosResponse<EventsApiResponse> = await axios.get(dynamicDataUrl);
    const result = response.data;

    if (result.status === "OK" && result.data) {
      const records = result.data.records || [];
      const apiPagination = result.data.pagination;

      const ids = records.map(event => event.id);
      const mappedById = records.reduce((acc, event) => {
        acc[event.id] = event;
        return acc;
      }, {} as Record<number, EventType>);

      const hasMore = apiPagination ? apiPagination.currentPage < apiPagination.totalPages : false;
      const fetchedCount = records.length;

      return { ids, mappedById, hasMore, fetchedCount, paginationInfo: apiPagination };
    } else {
      throw new Error(result.message || "Failed to fetch events due to API status not OK or missing data");
    }
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      const errorMsg = error.response?.data?.message || error.message || "An unknown error occurred while fetching events";
      console.error("Axios error fetching events:", error.response?.data || error);
      throw new Error(errorMsg);
    } else {
      console.error("Non-Axios error fetching events:", error);
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
};
