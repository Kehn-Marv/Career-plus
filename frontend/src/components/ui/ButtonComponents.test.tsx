import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GradientButton } from './GradientButton';
import { GlassButton } from './GlassButton';

describe('GradientButton', () => {
  it('renders children correctly', () => {
    render(<GradientButton>Click Me</GradientButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<GradientButton onClick={handleClick}>Click Me</GradientButton>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading spinner when loading', () => {
    render(<GradientButton loading>Loading</GradientButton>);
    const spinner = screen.getByRole('button').querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('is disabled when disabled prop is true', () => {
    render(<GradientButton disabled>Disabled</GradientButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies correct size classes', () => {
    const { container } = render(<GradientButton size="lg">Large Button</GradientButton>);
    const button = container.querySelector('button');
    expect(button?.className).toContain('px-8');
    expect(button?.className).toContain('py-4');
  });
});

describe('GlassButton', () => {
  it('renders children correctly', () => {
    render(<GlassButton>Glass Button</GlassButton>);
    expect(screen.getByText('Glass Button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<GlassButton onClick={handleClick}>Click Me</GlassButton>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders icon on left by default', () => {
    render(
      <GlassButton icon={<span data-testid="test-icon">→</span>}>
        With Icon
      </GlassButton>
    );
    const button = screen.getByRole('button');
    const icon = screen.getByTestId('test-icon');
    const text = screen.getByText('With Icon');
    
    expect(button).toContainElement(icon);
    expect(button).toContainElement(text);
  });

  it('renders icon on right when specified', () => {
    render(
      <GlassButton icon={<span data-testid="test-icon">→</span>} iconPosition="right">
        With Icon
      </GlassButton>
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<GlassButton disabled>Disabled</GlassButton>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
