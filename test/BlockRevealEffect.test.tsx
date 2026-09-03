import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BlockRevealEffect } from '../src';

describe('BlockRevealEffect', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('keeps content mounted while delaying completion', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();

    render(
      <BlockRevealEffect
        content={<section data-testid="content">Dashboard block</section>}
        onFinish={onFinish}
        animation
        options={{ delay: 100, duration: 50 }}
      />
    );

    const content = screen.getByTestId('content');
    expect(content.textContent).toBe('Dashboard block');
    expect(content.parentElement?.style.opacity).toBe('0');
    expect(onFinish).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(content.parentElement?.style.opacity).toBe('1');
    expect(onFinish).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('renders and finishes immediately when animation is disabled', () => {
    const onFinish = vi.fn();

    render(
      <BlockRevealEffect
        content={<strong data-testid="content">complete</strong>}
        onFinish={onFinish}
        animation={false}
      />
    );

    expect(screen.getByTestId('content').textContent).toBe('complete');
    expect(screen.getByTestId('content').parentElement?.style.opacity).toBe('1');
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('falls back for invalid timing options', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();

    render(
      <BlockRevealEffect
        content={<span>timed</span>}
        onFinish={onFinish}
        animation
        options={{ delay: -1, duration: Number.NaN }}
      />
    );

    act(() => {
      vi.advanceTimersByTime(529);
    });
    expect(onFinish).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
