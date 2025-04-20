import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/core/graphql/schema.graphql',
  documents: ['src/**/*.{ts,tsx}'],
  ignoreNoDocuments: true, // for initial setup
  generates: {
    'src/core/graphql/generated/': {
      preset: 'client',
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-query'
      ],
      config: {
        fetcher: {
          endpoint: 'process.env.REACT_APP_GRAPHQL_ENDPOINT',
          fetchParams: {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        },
        reactQueryVersion: 5,
        addInfiniteQuery: true,
        exposeQueryKeys: true,
        exposeFetcher: true,
        withHooks: true,
        dedupeFragments: true,
      }
    },
    './graphql.schema.json': {
      plugins: ['introspection']
    }
  }
};

export default config; 