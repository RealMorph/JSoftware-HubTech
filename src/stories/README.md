# Component Documentation Guidelines

This directory contains documentation for our component library using Storybook. When documenting components, follow these guidelines to ensure comprehensive and consistent documentation.

## Documentation Structure

Each component should have its own story file following this naming convention:
```
ComponentName.stories.tsx
```

## Documentation Content

Component documentation should include:

1. **Overview**: A brief description of the component and its purpose
2. **Props/API**: Documentation of all props/parameters the component accepts
3. **Variants/Examples**: All possible variants or configurations
4. **Design Guidelines**: How and when to use the component
5. **Accessibility**: Accessibility features and considerations
6. **Theming**: How the component can be themed
7. **Related Components**: Links to related components

## Story Format

Follow this format for component stories:

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { ComponentName } from '../components/path/ComponentName';

/**
 * Component description and overview
 * 
 * ## Design Guidelines
 * 
 * - Guideline 1
 * - Guideline 2
 * 
 * ## Accessibility
 * 
 * - Accessibility feature 1
 * - Accessibility feature 2
 */
const meta: Meta<typeof ComponentName> = {
  title: 'Category/ComponentName',
  component: ComponentName,
  tags: ['autodocs'],
  argTypes: {
    // Document all props here
    propName: {
      description: 'Description of the prop',
      control: 'select', // or 'text', 'boolean', etc.
      options: ['option1', 'option2'], // if applicable
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ComponentName>;

/**
 * Description of this variant
 */
export const Default: Story = {
  args: {
    propName: 'value',
  },
};

// Include additional variants as needed
```

## Testing

When creating stories, consider how they can be used for testing:

1. **Visual Regression Testing**: Stories should represent all visual states
2. **Accessibility Testing**: Use the a11y addon to verify accessibility
3. **Interaction Testing**: Document expected interactions

## MDX Documentation

For complex components, consider using MDX format for more detailed documentation:

```mdx
import { Meta, Story, Canvas, ArgsTable } from '@storybook/addon-docs';
import { ComponentName } from '../components/path/ComponentName';

<Meta title="Category/ComponentName" component={ComponentName} />

# ComponentName

Detailed documentation goes here...

<ArgsTable of={ComponentName} />

## Examples

<Canvas>
  <Story name="Default">
    <ComponentName prop="value" />
  </Story>
</Canvas>
```

## Theme Documentation

Document how the component works with the theme system:

1. What theme tokens are used
2. How to customize the component with theme overrides
3. Examples of the component with different themes

## File Organization

Organize stories by component category:

- Base components: `Base/ComponentName`
- Layout components: `Layout/ComponentName`
- Navigation components: `Navigation/ComponentName`
- etc.

## Resources

- [Storybook Documentation](https://storybook.js.org/docs/react/writing-docs/introduction)
- [Component-Driven Development](https://www.componentdriven.org/)
- [WCAG Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/) 