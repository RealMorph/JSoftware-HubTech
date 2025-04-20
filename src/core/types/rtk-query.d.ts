/**
 * Type declarations for Redux Toolkit Query
 * These declarations help TypeScript understand the structure
 * of RTK Query without needing the actual library
 */

declare module '@reduxjs/toolkit/query' {
  export interface FetchBaseQueryError {
    status: number;
    data: unknown;
  }

  export type FetchArgs = {
    url: string;
    method?: string;
    body?: any;
    params?: Record<string, any>;
    headers?: Record<string, any>;
    responseHandler?: 'json' | 'text' | ((response: Response) => Promise<any>);
    validateStatus?: (response: Response, body: any) => boolean;
    formData?: boolean;
  } | string;

  export type QueryReturnValue<T = unknown, E = FetchBaseQueryError, M = unknown> = {
    error: E;
    data?: undefined;
    meta?: M;
  } | {
    error?: undefined;
    data: T;
    meta?: M;
  };

  export type BaseQueryFn<
    Args = any,
    Result = unknown,
    Error = unknown,
    DefinitionExtraOptions = {},
    Meta = {}
  > = (
    args: Args,
    api: {
      dispatch: any;
      getState: () => any;
      extra: any;
      endpoint: string;
      type: 'query' | 'mutation';
      forced?: boolean;
    },
    extraOptions: DefinitionExtraOptions
  ) => Promise<QueryReturnValue<Result, Error, Meta>>;
}

declare module '@reduxjs/toolkit/query/react' {
  import { FetchBaseQueryError, BaseQueryFn, FetchArgs } from '@reduxjs/toolkit/query';

  export interface EndpointDefinitions {
    [endpointName: string]: any;
  }

  export interface ApiEndpointQuery<
    QueryArg,
    ResultType,
    ReducerPath extends string = string
  > {
    initiate: (arg: QueryArg) => any;
  }

  export interface ApiEndpointMutation<
    QueryArg,
    ResultType,
    ReducerPath extends string = string
  > {
    initiate: (arg: QueryArg) => any;
  }

  export type QueryDefinition<
    QueryArg,
    BaseQuery extends BaseQueryFn,
    TagTypes extends string = string,
    ResultType = unknown,
    ReducerPath extends string = string
  > = any;

  export type MutationDefinition<
    QueryArg,
    BaseQuery extends BaseQueryFn,
    TagTypes extends string = string,
    ResultType = unknown,
    ReducerPath extends string = string
  > = any;

  export type EndpointBuilder<
    BaseQuery extends BaseQueryFn,
    TagTypes extends string
  > = {
    query<ResultType, QueryArg>(
      definition: {
        query: (arg: QueryArg) => string | FetchArgs;
        transformResponse?: (baseQueryReturnValue: unknown, meta: unknown, arg: QueryArg) => ResultType;
        transformErrorResponse?: (baseQueryReturnValue: unknown) => unknown;
        providesTags?: (result: ResultType, error: unknown, arg: QueryArg) => ({ type: TagTypes; id?: string | number })[];
        keepUnusedDataFor?: number;
      }
    ): QueryDefinition<QueryArg, BaseQuery, TagTypes, ResultType>;
    mutation<ResultType, QueryArg>(
      definition: {
        query: (arg: QueryArg) => FetchArgs;
        transformResponse?: (baseQueryReturnValue: unknown, meta: unknown, arg: QueryArg) => ResultType;
        transformErrorResponse?: (baseQueryReturnValue: unknown) => unknown;
        invalidatesTags?: (result: ResultType, error: unknown, arg: QueryArg) => TagTypes[];
      }
    ): MutationDefinition<QueryArg, BaseQuery, TagTypes, ResultType>;
  };

  export function createApi<
    BaseQuery extends BaseQueryFn,
    Definitions extends EndpointDefinitions,
    ReducerPath extends string = 'api',
    TagTypes extends string = never
  >(
    options: {
      baseQuery: BaseQuery;
      reducerPath?: ReducerPath;
      tagTypes?: TagTypes[];
      endpoints: (builder: EndpointBuilder<BaseQuery, TagTypes>) => Definitions;
      keepUnusedDataFor?: number;
      refetchOnMountOrArgChange?: boolean | number;
      refetchOnFocus?: boolean;
      refetchOnReconnect?: boolean;
    }
  ): any;

  export function fetchBaseQuery(options: {
    baseUrl: string;
    prepareHeaders?: (headers: Headers | Record<string, string>, api: { getState: () => any }) => Headers | Record<string, string>;
    headers?: Record<string, string>;
    credentials?: RequestCredentials;
  }): BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;

  export function setupListeners(dispatch: any): () => void;
} 