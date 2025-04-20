# React Query Implementation

This document outlines the React Query implementation in our application, explaining the approach, structure, benefits, and usage examples.

## Overview

We've implemented [TanStack Query](https://tanstack.com/query) (React Query) to manage server state within our application. React Query provides a robust caching layer, optimistic updates, and a clean abstraction for data fetching, which helps improve performance and user experience.

## Implementation Structure

Our implementation follows a modular approach with several key components:

1. **QueryProvider**: A central provider that configures the QueryClient with default settings and provides the React Query context to the application.

2. **Custom Hooks**: Abstraction layer over React Query that provides a clean API for our services.
   - `useReactQuery.ts`: Core utilities that wrap React Query's hooks with enhanced functionality
   - `useContactQuery.ts`: Contact-specific query hooks
   - `useDealQuery.ts`: Deal-specific query hooks

3. **Query Keys**: A structured system for organizing query keys to prevent key collisions and provide a consistent pattern.

## Key Files

- `src/core/providers/QueryProvider.tsx`: The main provider component that configures React Query
- `src/core/hooks/useReactQuery.ts`: Custom hooks for React Query operations
- `src/core/query/queryKeys.ts`: Centralized query key definitions
- `src/core/hooks/useContactQuery.ts`: Contact-specific React Query hooks
- `src/core/hooks/useDealQuery.ts`: Deal-specific React Query hooks
- `src/pages/ContactsListPage.tsx`: Example component using React Query

## Benefits

React Query provides several benefits to our application:

1. **Automatic Caching**: Data is cached and reused across components, reducing unnecessary network requests.

2. **Background Refetching**: Data is automatically refreshed in the background to ensure freshness.

3. **Loading & Error States**: Built-in tracking of loading, error, and success states.

4. **Optimistic Updates**: Improve user experience by updating the UI before the server response.

5. **Automatic Refetching**: Queries are automatically refetched when the component is remounted or window is refocused.

6. **Pagination & Infinite Scrolling Support**: Built-in utilities for handling complex data fetching patterns.

7. **DevTools**: React Query includes DevTools for debugging and inspecting cache state.

## Usage Examples

### Basic Query Example

```tsx
import { useContactQuery } from '../core/hooks/useContactQuery';

const ContactsList = () => {
  const { useContacts } = useContactQuery();
  const { data: contacts, isLoading, error } = useContacts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {contacts.map(contact => (
        <div key={contact.id}>{contact.firstName} {contact.lastName}</div>
      ))}
    </div>
  );
};
```

### Mutation Example

```tsx
import { useContactQuery } from '../core/hooks/useContactQuery';

const ContactForm = () => {
  const { useCreateContact } = useContactQuery();
  const { mutate, isPending } = useCreateContact();

  const handleSubmit = (data) => {
    mutate(data, {
      onSuccess: (newContact) => {
        toast.success('Contact created successfully!');
        navigate(`/contacts/${newContact.id}`);
      },
      onError: (error) => {
        toast.error(`Failed to create contact: ${error.message}`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Contact'}
      </button>
    </form>
  );
};
```

### Filtered Query Example

```tsx
import { useContactQuery } from '../core/hooks/useContactQuery';

const FilteredContacts = ({ status }) => {
  const { useContactsByStatus } = useContactQuery();
  const { data: contacts, isLoading } = useContactsByStatus(status);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h2>{status} Contacts</h2>
      {contacts.map(contact => (
        <div key={contact.id}>{contact.firstName} {contact.lastName}</div>
      ))}
    </div>
  );
};
```

## Extending the Implementation

To add React Query support for a new entity:

1. Define query keys in `src/core/query/queryKeys.ts`
2. Create a custom hook in `src/core/hooks/use[Entity]Query.ts`
3. Implement queries and mutations based on the service methods
4. Use the hook in your components

## Best Practices

1. **Use Query Keys Consistently**: Always use the centralized query keys to ensure proper cache invalidation.

2. **Handle Loading and Error States**: Always account for loading and error states in components.

3. **Optimistic Updates**: For better UX, use optimistic updates where possible.

4. **Avoid Over-fetching**: Disable queries when data isn't needed (e.g., based on component visibility).

5. **Cache Invalidation**: Be strategic about cache invalidation to avoid unnecessary refetches.

6. **DevTools in Development**: Use React Query DevTools during development to debug cache issues.

## Future Enhancements

Future enhancements for our React Query implementation:

1. **GraphQL Integration**: Integrating React Query with GraphQL via urql or Apollo
2. **Infinite Queries**: Implementing infinite scroll patterns for large datasets
3. **Persistence**: Adding persistence layer for offline capabilities
4. **Server-Side Rendering**: Enhancing with server-side rendering support 