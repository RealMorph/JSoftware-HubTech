# Routing System

The Routing System provides navigation and view management for the application, using React Router as its foundation.

## Overview

The routing system is built on React Router v6, providing a declarative way to define routes and navigation within the application. It supports component demos, application views, and integrates with the theme system.

## Key Features

- **Centralized Route Management**: All routes are defined in a single `Router.tsx` file
- **Consistent Navigation**: Standard patterns for navigation between pages
- **Theme Integration**: All routes maintain theme context
- **Component Demo Navigation**: Dedicated routes for component demos
- **Layout Consistency**: Common layouts applied to related routes

## Implementation Details

### Router Component

The main router component is located at `src/Router.tsx` and contains:

- BrowserRouter configuration
- Routes definition
- ThemeProvider integration
- Layout components

```tsx
// Example of the Router structure
const AppRouter = () => {
  return (
    <BrowserRouter>
      <ThemeProvider themeService={inMemoryThemeService}>
        <Routes>
          <Route path="/" element={<DemoHome />} />
          <Route path="/demos" element={<DemoHome />} />
          <Route path="/demos/form" element={
            <DemoLayout>
              <FormDemo />
            </DemoLayout>
          } />
          <Route path="/demos/data-display" element={
            <DemoLayout>
              <DataDisplayDemo />
            </DemoLayout>
          } />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
};
```

### Demo Home Component

The demo home component provides a central location to browse and access component demos:

- Lists available component categories
- Provides links to individual demos
- Maintains consistent styling

### Demo Layout

A common layout wrapper applied to all demo pages:

- Includes back navigation to the demo home
- Provides consistent padding and structure
- Maintains theme context

## Route Structure

The application uses the following route patterns:

- `/` - Home/demo page listing
- `/demos` - Component demo home
- `/demos/[component-type]` - Specific component demo (e.g., `/demos/form`)

## Integration Points

### Theme System Integration

The routing system integrates with the theme system by:

1. Wrapping all routes in the ThemeProvider
2. Ensuring theme context is available to all components
3. Maintaining theme state during navigation

### Future Integration Points

- Tab Management: Support for opening routes in tabs
- Authorization: Protected routes and role-based access
- State Management: Preserving state during navigation

## Usage

### Adding New Routes

To add a new route:

1. Import the component to be rendered
2. Add a new Route element to the Routes component in `src/Router.tsx`
3. If it's a demo, update the DemoHome component to include a link

```tsx
// Example of adding a new route
<Route path="/demos/new-component" element={
  <DemoLayout>
    <NewComponentDemo />
  </DemoLayout>
} />
```

### Navigating Between Routes

Use the `Link` component from React Router to navigate between routes:

```tsx
import { Link } from 'react-router-dom';

// Example of a navigation link
<Link to="/demos/form">Form Demo</Link>
```

## Future Enhancements

See the [TODO-routing.md](TODO-routing.md) file for planned enhancements.

## Demo Pages
The application includes several demo pages showcasing different components:

- `/demos/button` - Button component demos
- `/demos/textfield` - TextField component demos
- `/demos/card` - Card component demos
- `/demos/list` - List component demos
- `/demos/datepicker` - DatePicker component demos
  - Single date selection
  - Date range selection
  - Multiple date selection
  - Validation examples
  - Theme integration

Each demo page follows a consistent structure:
1. Page container with theme integration
2. Component demo with various configurations
3. Code examples
4. Result displays 