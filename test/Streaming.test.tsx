import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { Streaming } from '../src';
import type { StreamingEffectProps, StreamingItem } from '../src';

const ManualEffect: React.FC<StreamingEffectProps> = ({ content, onFinish }) => (
  <button onClick={onFinish}>
    {content}
  </button>
);

const items: StreamingItem[] = ['first', 'second', 'third'].map((label) => ({
  key: label,
  content: <span data-testid={label}>{label}</span>
}));

describe('Streaming', () => {
  afterEach(cleanup);

  it('renders items sequentially and hides fallback after completion', () => {
    render(
      <Streaming
        items={items}
        enabled
        effect={ManualEffect}
        fallback={<span data-testid="fallback">loading</span>}
      />
    );

    expect(screen.getByTestId('first')).toBeTruthy();
    expect(screen.queryByTestId('second')).toBeNull();
    expect(screen.getByTestId('fallback')).toBeTruthy();

    fireEvent.click(screen.getByTestId('first'));
    expect(screen.getByTestId('second')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'first' }));
    expect(screen.queryByTestId('third')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'second' }));
    fireEvent.click(screen.getByRole('button', { name: 'third' }));
    expect(screen.queryByTestId('fallback')).toBeNull();
  });

  it('renders every item when disabled', () => {
    render(
      <Streaming
        items={items}
        fallback={<span data-testid="fallback">loading</span>}
      />
    );

    expect(screen.getByTestId('first')).toBeTruthy();
    expect(screen.getByTestId('second')).toBeTruthy();
    expect(screen.getByTestId('third')).toBeTruthy();
    expect(screen.queryByTestId('fallback')).toBeNull();
  });

  it('completes content items immediately without an effect', () => {
    render(
      <Streaming
        items={items}
        enabled
        fallback={<span data-testid="fallback">loading</span>}
      />
    );

    expect(screen.getByTestId('first')).toBeTruthy();
    expect(screen.getByTestId('second')).toBeTruthy();
    expect(screen.getByTestId('third')).toBeTruthy();
    expect(screen.queryByTestId('fallback')).toBeNull();
  });

  it('allows an item to disable the global effect', () => {
    const overriddenItems: StreamingItem[] = [
      items[0],
      { ...items[1], effect: null },
      items[2]
    ];

    render(
      <Streaming
        items={overriddenItems}
        enabled
        effect={ManualEffect}
        fallback={<span data-testid="fallback">loading</span>}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'first' }));

    expect(screen.getByTestId('second')).toBeTruthy();
    expect(screen.getByTestId('third')).toBeTruthy();
    expect(screen.getByTestId('fallback')).toBeTruthy();
  });
});
