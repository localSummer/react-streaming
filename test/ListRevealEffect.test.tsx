import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ListRevealEffect } from '../src';

describe('ListRevealEffect', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('keeps direct children mounted while revealing them in order', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();

    render(
      <ListRevealEffect
        content={
          <ul data-testid="list">
            <li data-testid="first">First</li>
            <li data-testid="second">Second</li>
            <li data-testid="third">Third</li>
          </ul>
        }
        onFinish={onFinish}
        animation
        options={{ delay: 20, stagger: 30, duration: 40 }}
      />
    );

    const first = screen.getByTestId('first');
    const second = screen.getByTestId('second');
    const third = screen.getByTestId('third');
    expect(first.style.opacity).toBe('0');
    expect(second.style.opacity).toBe('0');
    expect(third.style.opacity).toBe('0');

    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(first.style.opacity).toBe('1');
    expect(second.style.opacity).toBe('0');

    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(second.style.opacity).toBe('1');
    expect(third.style.opacity).toBe('0');
    expect(onFinish).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(70);
    });
    expect(third.style.opacity).toBe('1');
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('renders all children and finishes immediately when animation is disabled', () => {
    const onFinish = vi.fn();

    render(
      <ListRevealEffect
        content={
          <div>
            <span data-testid="first">First</span>
            <span data-testid="second">Second</span>
          </div>
        }
        onFinish={onFinish}
        animation={false}
      />
    );

    expect(screen.getByTestId('first').style.opacity).toBe('');
    expect(screen.getByTestId('second').style.opacity).toBe('');
    expect(onFinish).toHaveBeenCalledTimes(1);
  });
});
