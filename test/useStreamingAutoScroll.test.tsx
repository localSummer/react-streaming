import React from 'react';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useStreamingAutoScroll } from '../src';

const setScrollMetrics = (
  element: HTMLElement,
  scrollHeight: number,
  clientHeight: number,
  scrollTop: number
) => {
  Object.defineProperty(element, 'scrollHeight', {
    configurable: true,
    value: scrollHeight
  });
  Object.defineProperty(element, 'clientHeight', {
    configurable: true,
    value: clientHeight
  });
  Object.defineProperty(element, 'scrollTop', {
    configurable: true,
    value: scrollTop,
    writable: true
  });
};

const resizeObserverWindow = window as Window & {
  ResizeObserver?: typeof ResizeObserver;
};

interface HarnessProps {
  tick: number;
  enabled?: boolean;
  text?: string;
  behavior?: ScrollBehavior;
}

const Harness: React.FC<HarnessProps> = ({
  tick,
  enabled = true,
  text = 'content',
  behavior = 'auto'
}) => {
  const { containerRef, bottomRef } = useStreamingAutoScroll({
    enabled,
    deps: [tick],
    behavior
  });

  return (
    <div ref={containerRef} data-testid="container">
      <span>{text}</span>
      <div ref={bottomRef} data-testid="bottom" />
    </div>
  );
};

describe('useStreamingAutoScroll', () => {
  const originalResizeObserver = resizeObserverWindow.ResizeObserver;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

  // Drive frames manually so the test checks animation behavior, not timer cadence.
  const mockAnimationFrame = () => {
    const callbacks = new Map<number, FrameRequestCallback>();
    let id = 0;

    window.requestAnimationFrame = vi.fn(callback => {
      id += 1;
      callbacks.set(id, callback);
      return id;
    });
    window.cancelAnimationFrame = vi.fn(frame => {
      callbacks.delete(frame);
    });

    return {
      step: (time: number) => {
        const nextCallbacks = Array.from(callbacks.values());
        callbacks.clear();
        nextCallbacks.forEach(callback => {
          callback(time);
        });
      }
    };
  };

  afterEach(() => {
    cleanup();
    vi.useRealTimers();

    if (originalResizeObserver) {
      resizeObserverWindow.ResizeObserver = originalResizeObserver;
    } else {
      delete resizeObserverWindow.ResizeObserver;
    }

    if (originalRequestAnimationFrame) {
      window.requestAnimationFrame = originalRequestAnimationFrame;
    } else {
      delete (window as Partial<Window>).requestAnimationFrame;
    }

    if (originalCancelAnimationFrame) {
      window.cancelAnimationFrame = originalCancelAnimationFrame;
    } else {
      delete (window as Partial<Window>).cancelAnimationFrame;
    }
  });

  it('scrolls to the bottom when dependencies change near the bottom', () => {
    const { rerender } = render(<Harness tick={0} />);
    const container = document.querySelector('[data-testid="container"]') as HTMLElement;

    setScrollMetrics(container, 1000, 300, 660);
    fireEvent.scroll(container);

    rerender(<Harness tick={1} />);

    expect(container.scrollTop).toBe(700);
  });

  it('does not auto-scroll after the user leaves the bottom', () => {
    const { rerender } = render(<Harness tick={0} />);
    const container = document.querySelector('[data-testid="container"]') as HTMLElement;

    setScrollMetrics(container, 1000, 300, 100);
    fireEvent.scroll(container);

    rerender(<Harness tick={1} />);

    expect(container.scrollTop).toBe(100);
  });

  it('resumes auto-scroll after the user returns to the bottom', () => {
    const { rerender } = render(<Harness tick={0} />);
    const container = document.querySelector('[data-testid="container"]') as HTMLElement;

    setScrollMetrics(container, 1000, 300, 100);
    fireEvent.scroll(container);
    setScrollMetrics(container, 1020, 300, 700);
    fireEvent.scroll(container);

    rerender(<Harness tick={1} />);

    expect(container.scrollTop).toBe(720);
  });

  it('follows content mutations while pinned to the bottom', async () => {
    delete resizeObserverWindow.ResizeObserver;
    const { rerender } = render(<Harness tick={0} text="first" />);
    const container = document.querySelector('[data-testid="container"]') as HTMLElement;

    setScrollMetrics(container, 1000, 300, 700);

    rerender(<Harness tick={0} text="second" />);
    setScrollMetrics(container, 1020, 300, 700);
    await act(async () => {
      await Promise.resolve();
    });

    expect(container.scrollTop).toBe(720);
  });

  it('smoothly animates toward the latest bottom position', () => {
    const animationFrame = mockAnimationFrame();
    const { rerender } = render(<Harness tick={0} behavior="smooth" />);
    const container = document.querySelector('[data-testid="container"]') as HTMLElement;

    setScrollMetrics(container, 1000, 300, 700);
    fireEvent.scroll(container);
    setScrollMetrics(container, 1100, 300, 700);

    rerender(<Harness tick={1} behavior="smooth" />);
    act(() => {
      animationFrame.step(0);
      animationFrame.step(40);
    });
    expect(container.scrollTop).toBeGreaterThan(700);
    expect(container.scrollTop).toBeLessThan(800);

    setScrollMetrics(container, 1200, 300, container.scrollTop);

    act(() => {
      animationFrame.step(160);
    });
    expect(container.scrollTop).toBe(900);
  });

  it('cancels smooth auto-scroll when the user starts scrolling', () => {
    const animationFrame = mockAnimationFrame();
    const { rerender } = render(<Harness tick={0} behavior="smooth" />);
    const container = document.querySelector('[data-testid="container"]') as HTMLElement;

    setScrollMetrics(container, 1000, 300, 700);
    fireEvent.scroll(container);
    setScrollMetrics(container, 1100, 300, 700);

    rerender(<Harness tick={1} behavior="smooth" />);
    act(() => {
      animationFrame.step(0);
      animationFrame.step(40);
    });
    const scrollTopAfterUserScroll = container.scrollTop;

    fireEvent.wheel(container);
    act(() => {
      animationFrame.step(160);
    });

    expect(container.scrollTop).toBe(scrollTopAfterUserScroll);
  });
});
