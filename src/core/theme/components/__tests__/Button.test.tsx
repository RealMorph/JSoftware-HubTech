import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';
import { renderWithTheme } from '../../../test-utils';
import { mockTheme } from '../../../test-utils';

const hasEmotionClass = (element: HTMLElement) => {
  const classes = Array.from(element.classList);
  return classes.some(className => className.startsWith('css-'));
};

describe('Button', () => {
  it('renders with default props', async () => {
    await renderWithTheme(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(hasEmotionClass(button)).toBe(true);
  });

  it('renders with primary variant', async () => {
    await renderWithTheme(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button', { name: 'Primary Button' });
    expect(hasEmotionClass(button)).toBe(true);
  });

  it('renders with secondary variant', async () => {
    await renderWithTheme(<Button variant="secondary">Secondary Button</Button>);
    const button = screen.getByRole('button', { name: 'Secondary Button' });
    expect(hasEmotionClass(button)).toBe(true);
  });

  it('renders with outline variant', async () => {
    await renderWithTheme(<Button variant="outline">Outline Button</Button>);
    const button = screen.getByRole('button', { name: 'Outline Button' });
    expect(hasEmotionClass(button)).toBe(true);
  });

  it('renders with different sizes', async () => {
    const { rerender } = await renderWithTheme(<Button size="sm">Small Button</Button>);
    let button = screen.getByRole('button', { name: 'Small Button' });
    expect(hasEmotionClass(button)).toBe(true);

    await rerender(<Button size="md">Medium Button</Button>);
    button = screen.getByRole('button', { name: 'Medium Button' });
    expect(hasEmotionClass(button)).toBe(true);

    await rerender(<Button size="lg">Large Button</Button>);
    button = screen.getByRole('button', { name: 'Large Button' });
    expect(hasEmotionClass(button)).toBe(true);
  });

  it('renders with fullWidth prop', async () => {
    await renderWithTheme(<Button fullWidth>Full Width Button</Button>);
    const button = screen.getByRole('button', { name: 'Full Width Button' });
    expect(hasEmotionClass(button)).toBe(true);
  });

  it('handles click events', async () => {
    const handleClick = jest.fn();
    await renderWithTheme(<Button onClick={handleClick}>Click Button</Button>);
    const button = screen.getByRole('button', { name: 'Click Button' });
    await userEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles disabled state', async () => {
    const handleClick = jest.fn();
    await renderWithTheme(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );
    const button = screen.getByRole('button', { name: 'Disabled Button' });
    expect(button).toBeDisabled();
    await userEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('handles focus state', async () => {
    await renderWithTheme(<Button>Focus Button</Button>);
    const button = screen.getByRole('button', { name: 'Focus Button' });
    button.focus();
    expect(hasEmotionClass(button)).toBe(true);
  });
});
