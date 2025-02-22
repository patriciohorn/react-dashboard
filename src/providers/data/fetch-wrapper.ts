import { GraphQLFormattedError } from 'graphql';

type Error = {
  message: string;
  statusCode: string;
};

const customFetch = async (url: string, options: RequestInit) => {
  const accessToken = localStorage.getItem('access_token');

  const headers = options.headers as Record<string, string>;

  return await fetch(url, {
    ...options,
    headers: {
      ...headers,
      Authorization: headers?.Authorization || `Bearer ${accessToken}`,
      'Content-type': 'application/json',
      'Apollo-Require-Preflight': 'true'
    }
  });
};

// handle data errors from graphql queries
const getGraphQLErrors = (
  body: Record<'errors', GraphQLFormattedError[] | undefined>
): Error | null => {
  if (!body) {
    return {
      message: 'Unknown error',
      statusCode: 'INTERNAL_SERVER_CODE'
    };
  }

  //second check if the body has errors
  if ('errors' in body) {
    const errors = body?.errors;
    const messages = errors?.map((error) => error?.message).join('');
    const code = errors?.[0].extensions?.code;

    return {
      message: messages || JSON.stringify(errors),
      statusCode: code || 500
    };
  }
  // if we don't have errors we can simply return null
  return null;
};

export const fetchWrapper = async (url: string, options: RequestInit) => {
  const response = await customFetch(url, options);

  const responseClone = response.clone();
  const body = await responseClone.json();

  const error = getGraphQLErrors(body);

  if (error) {
    throw error;
  }

  return response;
};
