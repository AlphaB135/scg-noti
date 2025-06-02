// frontend/src/lib/api/timeline.ts
import axios from 'axios'
import api from '../api'

// Types for timeline events
export interface TimelineEvent {
  id: string
  type: 'notification' | 'approval'
  createdAt: string
  title: string
  message?: string
  status?: string
  priority?: string
  metadata?: Record<string, any>
}

export interface TimelineResponse {
  events: TimelineEvent[]
  nextCursor?: string
  hasMore: boolean
}

export interface FetchTimelineParams {
  pageParam?: string // cursor for pagination
  limit?: number
  types?: ('notification' | 'approval')[]
}

// Helper function to implement delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry a request with exponential backoff
const retryRequest = async <T>(
  request: () => Promise<T>, 
  maxRetries = 3, 
  initialDelay = 1000
): Promise<T> => {
  let attempts = 0;
  let lastError: unknown = new Error("Unknown error");
  
  while (attempts < maxRetries) {
    try {
      return await request();
    } catch (error: unknown) {
      lastError = error;
      // Check if it's an axios error with status 429
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        // Rate limited, let's wait before retrying
        const delayMs = initialDelay * Math.pow(2, attempts); // Exponential backoff
        console.log(`Rate limited. Retrying in ${delayMs}ms...`);
        await delay(delayMs);
        attempts++;
      } else {
        // For other errors, just throw them
        throw error;
      }
    }
  }
  
  // All retries failed
  console.error(`Failed after ${maxRetries} attempts`);
  throw lastError;
};

export const timelineApi = {
  // Fetch timeline events with cursor-based pagination
  async fetchTimeline({ pageParam, limit = 20, types }: FetchTimelineParams = {}): Promise<TimelineResponse> {
    return retryRequest(async () => {
      const params = new URLSearchParams();
      
      if (limit) {
        params.append('limit', limit.toString());
      }
      
      if (pageParam) {
        params.append('cursor', pageParam);
      }
      
      if (types && types.length > 0) {
        params.append('types', types.join(','));
      }
      
      const queryString = params.toString();
      const url = `/timeline${queryString ? `?${queryString}` : ''}`;
      
      const { data } = await api.get<TimelineResponse>(url);
      return data;
    });
  },
};

export default timelineApi;
