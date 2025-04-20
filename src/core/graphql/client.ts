import { GraphQLClient } from 'graphql-request';

// Initialize a GraphQL client
export const getGraphQLClient = (token?: string) => {
  const endpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT || '/graphql';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if provided
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return new GraphQLClient(endpoint, { headers });
};

// Generic fetcher function for React Query
export const gqlFetcher = <TData, TVariables extends Record<string, unknown>>(
  query: string, 
  variables?: TVariables, 
  token?: string
): (() => Promise<TData>) => {
  return async () => {
    const client = getGraphQLClient(token);
    return client.request<TData>(query, variables);
  };
};

// Helper function to create a fetcher with authentication from context
export const createAuthenticatedFetcher = (token: string | undefined) => {
  return <TData, TVariables extends Record<string, unknown>>(
    query: string, 
    variables?: TVariables
  ): (() => Promise<TData>) => {
    return gqlFetcher<TData, TVariables>(query, variables, token);
  };
}; 