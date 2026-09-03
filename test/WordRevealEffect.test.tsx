import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WordRevealEffect } from '../src';

describe('WordRevealEffect', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('reveals nested content one word at a time', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();

    render(
      <WordRevealEffect
        content={
          <p data-testid="content">
            Hello <strong>streaming world</strong>
          </p>
        }
        onFinish={onFinish}
        animation
        options={{ speed: 10 }}
      />
    );

    expect(screen.queryByTestId('content')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(screen.getByTestId('content').textContent).toBe('Hello ');

    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(screen.getByTestId('content').textContent).toBe('Hello streaming world');
    expect(screen.getByText('streaming world').tagName).toBe('STRONG');
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('renders all content and finishes immediately when animation is disabled', () => {
    const onFinish = vi.fn();

    render(
      <WordRevealEffect
        content={<strong data-testid="content">complete now</strong>}
        onFinish={onFinish}
        animation={false}
      />
    );

    expect(screen.getByTestId('content').textContent).toBe('complete now');
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
