import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/base/Button';

/**
 * The Button component is a versatile interactive element used for triggering actions.
 * It supports different variants, sizes, and states to match various UI requirements.
 * 
 * ## Design Guidelines
 * 
 * - Use primary buttons for main actions
 * - Use secondary buttons for alternative actions
 * - Use ghost buttons for less prominent actions
 * - Keep button text concise and action-oriented
 * - Maintain consistent button usage patterns across the application
 * 
 * ## Accessibility
 * 
 * - Buttons use proper contrast ratios for all variants
 * - Focus states are clearly visible
 * - Loading states prevent multiple submissions
 * - Compatible with keyboard navigation
 * - Works properly with screen readers
 */
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      description: 'The visual style of the button',
      control: 'select',
      options: ['primary', 'secondary', 'accent', 'ghost'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'primary' },
      },
    },
    size: {
      description: 'The size of the button',
      control: 'select',
      options: ['sm', 'md', 'lg'],
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'md' },
      },
    },
    fullWidth: {
      description: 'Whether the button should take the full width of its container',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    loading: {
      description: 'Shows a loading indicator and disables the button',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    disabled: {
      description: 'Disables the button, preventing user interaction',
      control: 'boolean',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    onClick: {
      description: 'Function called when the button is clicked',
      action: 'clicked',
    },
    children: {
      description: 'The content to render inside the button',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

/**
 * The default primary button is used for main actions.
 */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

/**
 * Secondary buttons are used for alternative actions that are not the primary focus.
 */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

/**
 * Accent buttons are used to highlight important actions that are not the primary action.
 */
export const Accent: Story = {
  args: {
    variant: 'accent',
    children: 'Accent Button',
  },
};

/**
 * Ghost buttons are used for less prominent actions.
 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

/**
 * Small buttons are used in compact spaces or for less important actions.
 */
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

/**
 * Large buttons are used for prominent actions or to improve touch targets.
 */
export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

/**
 * Full width buttons expand to fill their container.
 */
export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
};

/**
 * A loading button shows a loading indicator and is disabled.
 */
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading Button',
  },
};

/**
 * Disabled buttons are visually muted and don't respond to interactions.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

/**
 * This example shows multiple variants and sizes together.
 */
export const ButtonGrid: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      <Button variant="primary" size="sm">Primary Small</Button>
      <Button variant="primary" size="md">Primary Medium</Button>
      <Button variant="primary" size="lg">Primary Large</Button>
      
      <Button variant="secondary" size="sm">Secondary Small</Button>
      <Button variant="secondary" size="md">Secondary Medium</Button>
      <Button variant="secondary" size="lg">Secondary Large</Button>
      
      <Button variant="accent" size="sm">Accent Small</Button>
      <Button variant="accent" size="md">Accent Medium</Button>
      <Button variant="accent" size="lg">Accent Large</Button>
      
      <Button variant="ghost" size="sm">Ghost Small</Button>
      <Button variant="ghost" size="md">Ghost Medium</Button>
      <Button variant="ghost" size="lg">Ghost Large</Button>
    </div>
  ),
}; 