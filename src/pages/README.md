# Pages Directory

This directory contains individual page components that render content for different routes in the application.

## Migration to React Router

The application has been transitioned to use React Router for navigation. The components in this directory are now integrated into the router system defined in `src/Router.tsx`.

### Current Organization

- **FormDemoPage.tsx**: Page component for the Form demo. Now accessible via the `/demos/form` route.

- **DataDisplayPage.tsx**: Page component for the Data Display demo. Now accessible via the `/demos/data-display` route.

- **index.ts**: Exports page components for use in the application.

### Routing Structure

The routing system now follows a consistent pattern:

```
/                   → Demo Home (lists all component demos)
/demos              → Demo Home
/demos/form         → Form Demo page
/demos/data-display → Data Display Demo page
```

### Page Component Structure

Each page component follows a similar structure:

```tsx
import React from 'react';
import { ComponentDemo } from '../components/path/ComponentDemo';

export const ComponentDemoPage: React.FC = () => {
  return (
    <div className="page-container">
      <ComponentDemo />
    </div>
  );
};

export default ComponentDemoPage;
```

### Navigation Between Pages

React Router's `Link` component is used for navigation:

```tsx
import { Link } from 'react-router-dom';

<Link to="/demos/form">View Form Demo</Link>
```

## Adding New Pages

To add a new page component:

1. Create a new `.tsx` file in this directory following the naming pattern `[ComponentName]Page.tsx`
2. Import the component to display in the page
3. Export the page component as default
4. Add the page component to `index.ts`
5. Add the route to `src/Router.tsx`
6. Add a link to the page on the Demo Home component

## Additional Resources

- [React Router Documentation](https://reactrouter.com/en/main)
- [Routing System Documentation](../../docs/routing/README.md)
- [Component Demo Documentation](../../docs/components/README.md) 