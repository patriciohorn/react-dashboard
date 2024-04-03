import graphqlDataProvider, {
  GraphQLClient,
  liveProvider as graphqlLiveProvider
} from '@refinedev/nestjs-query';
import { createClient } from 'graphql-ws';
import { fetchWrapper } from './fetch-wrapper';

export const API_BASE_URL = 'https:///api.crm.refine.dev';
export const API_URL = 'http://api.crm.refine.dev';
export const WS_URL = 'wss://api.crm.refine.dev/graphql';

export const client = new GraphQLClient(API_URL, {
  fetch: (url: string, options: RequestInit) => {
    try {
      return fetchWrapper(url, options);
    } catch (error) {
      return Promise.reject(error as Error);
    }
  }
});

// ws -> web socket
// if we have access to the window meaning we are in the web browser
export const wsClient =
  typeof window !== 'undefined'
    ? createClient({
        url: WS_URL,
        connectionParams: () => {
          const accessToken = localStorage.getItem('access_token');

          return {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          };
        }
      })
    : undefined;

export const dataProvider = graphqlDataProvider(client);

// undefined because maybe we don't have wsClient
export const liveProvider = wsClient ? graphqlLiveProvider(wsClient) : undefined;
