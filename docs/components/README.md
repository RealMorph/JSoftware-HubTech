# UI Components

This directory contains documentation for the UI Component system, including component specifications, guidelines, and demo information.

## Component Demo System

The component demo system provides a way to showcase and test UI components in isolation. It's now integrated with the React Router system for improved organization and navigation.

### Demo Access

Component demos are accessible through the following routes:

- **Demo Home**: `/demos` - Lists all available component demos
- **Form Components**: `/demos/form` - Demonstrates form components
- **Data Display Components**: `/demos/data-display` - Demonstrates cards, lists, and tables

### Demo Structure

Each component type has:

1. **Component Implementation File**: Contains the actual component code
2. **Demo Component File**: Shows various configurations and usage examples
3. **Demo Page File**: Wraps the demo component in the page layout

### Adding New Demos

To add a new component demo:

1. Create the component in its appropriate directory
2. Create a corresponding Demo component to showcase variations
3. Add the demo to the router in `src/Router.tsx`
4. Add a link to the demo on the Demo Home page

### Component Organization

Components are organized into the following categories:

- **Base**: Foundational UI components
- **Data Display**: Components for displaying data
- **Form**: Input and form-related components
- **Feedback**: User feedback components
- **Navigation**: Navigation-related components

## Standards and Guidelines

All components should follow these guidelines:

- Use TypeScript for type safety
- Include comprehensive prop documentation
- Support theme integration
- Include accessibility features
- Have corresponding test files
- Include demo components

## Integration with Theme System

All components use the theme system for styling, ensuring consistent appearance and behavior across the application.

## Component Documentation

Each component should include:

- Prop documentation
- Usage examples
- Accessibility considerations
- Theme customization options

## Related Documentation

- [Component Architecture](TODO-architecture.md)
- [Component TODO List](TODO-components.md)
- [Routing Documentation](../routing/README.md) 