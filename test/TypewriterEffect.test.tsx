import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act } from 'react-dom/test-utils';
import { Streaming, TypewriterEffect } from '../src';
import type { StreamingItem } from '../src';

describe('TypewriterEffect', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('reveals nested React content one character at a time', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();

    render(
      <TypewriterEffect
        content={
          <p data-testid="content">
            你好<strong>世界</strong>
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
    expect(screen.getByTestId('content').textContent).toBe('你');

    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(screen.getByTestId('content').textContent).toBe('你好世界');
    expect(screen.getByText('世界').tagName).toBe('STRONG');
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('starts from the requested time offset', () => {
    vi.useFakeTimers();
    const onFinish = vi.fn();

    render(
      <TypewriterEffect
        content={<span data-testid="content">abcd</span>}
        onFinish={onFinish}
        animation
        options={{ speed: 10, time: 20 }}
      />
    );

    expect(screen.getByTestId('content').textContent).toBe('ab');

    act(() => {
      vi.advanceTimersByTime(20);
    });
    expect(screen.getByTestId('content').textContent).toBe('abcd');
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('renders all content and finishes immediately when animation is disabled', () => {
    const onFinish = vi.fn();

    render(
      <TypewriterEffect
        content={<strong data-testid="content">complete</strong>}
        onFinish={onFinish}
        animation={false}
      />
    );

    expect(screen.getByTestId('content').textContent).toBe('complete');
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('unlocks the next streaming item after typing completes', () => {
    vi.useFakeTimers();
    const items: StreamingItem[] = [
      {
        key: 'first',
        content: <span data-testid="first">abc</span>
      },
      {
        key: 'second',
        content: <span data-testid="second">done</span>
      }
    ];

    render(
      <Streaming
        items={items}
        enabled
        effect={TypewriterEffect}
        effectOptions={{ speed: 10 }}
        fallback={<span data-testid="fallback">loading</span>}
      />
    );

    expect(screen.queryByTestId('first')).toBeNull();
    expect(screen.queryByTestId('second')).toBeNull();
    expect(screen.getByTestId('fallback')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(screen.getByTestId('first').textContent).toBe('abc');
    expect(screen.queryByTestId('second')).toBeNull();

    act(() => {
      vi.advanceTimersByTime(40);
    });
    expect(screen.getByTestId('second').textContent).toBe('done');
  });
});
