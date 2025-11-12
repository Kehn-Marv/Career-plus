import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GlassCard } from './GlassCard';
import { GlassBadge } from './GlassBadge';

describe('GlassCard', () => {
  it('renders children correctly', () => {
    render(<GlassCard>Test Content</GlassCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies light variant by default', () => {
    const { container } = render(<GlassCard>Content</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain('bg-white/70');
  });

  it('applies dark variant when specified', () => {
    const { container } = render(<GlassCard variant="dark">Content</GlassCard>);
    const card = container.firstChild as HTMLElement;
    expect(card.className).toMatch(/bg-white\/5|bg-gray-900\/95/);
  });
});

describe('GlassBadge', () => {
  it('renders children correctly', () => {
    render(<GlassBadge>Badge Text</GlassBadge>);
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('renders with icon when provided', () => {
    render(
      <GlassBadge icon={<span data-testid="test-icon">🚀</span>}>
        With Icon
      </GlassBadge>
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('applies correct size classes', () => {
    const { container } = render(<GlassBadge size="lg">Large Badge</GlassBadge>);
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toContain('px-6');
    expect(badge.className).toContain('py-3');
  });
});
