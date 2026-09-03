import { useCallback, useEffect, useRef } from 'react';
import type * as React from 'react';

export interface UseStreamingAutoScrollOptions {
  enabled?: boolean;
  deps?: React.DependencyList;
  behavior?: ScrollBehavior;
  threshold?: number;
}

export interface UseStreamingAutoScrollResult<
  ContainerElement extends HTMLElement = HTMLDivElement,
  BottomElement extends HTMLElement = HTMLDivElement
> {
  containerRef: React.RefObject<ContainerElement>;
  bottomRef: React.RefObject<BottomElement>;
  isPinnedToBottom: () => boolean;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
}

const DEFAULT_THRESHOLD = 48;
const SMOOTH_SCROLL_DURATION_MS = 160;

const getThreshold = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : DEFAULT_THRESHOLD;

const getBottomScrollTop = (container: HTMLElement) =>
  Math.max(0, container.scrollHeight - container.clientHeight);

export const useStreamingAutoScroll = <
  ContainerElement extends HTMLElement = HTMLDivElement,
  BottomElement extends HTMLElement = HTMLDivElement
>({
  enabled = true,
  deps = [],
  behavior = 'smooth',
  threshold
}: UseStreamingAutoScrollOptions = {}): UseStreamingAutoScrollResult<
  ContainerElement,
  BottomElement
> => {
  const containerRef = useRef<ContainerElement>(null);
  // Kept for existing sentinel markup; scrolling is controlled on the container.
  const bottomRef = useRef<BottomElement>(null);
  const enabledRef = useRef(enabled);
  const pinnedRef = useRef(true);
  const frameRef = useRef<number | null>(null);
  const resolvedThreshold = getThreshold(threshold);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const isPinnedToBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return true;

    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      resolvedThreshold
    );
  }, [resolvedThreshold]);

  const cancelAnimation = useCallback(() => {
    if (frameRef.current === null) return;

    window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const scrollToBottom = useCallback(
    (nextBehavior: ScrollBehavior = behavior) => {
      const container = containerRef.current;
      if (!container) return;

      const target = getBottomScrollTop(container);
      if (
        nextBehavior === 'auto' ||
        Math.abs(container.scrollTop - target) <= 1 ||
        typeof window.requestAnimationFrame !== 'function'
      ) {
        cancelAnimation();
        container.scrollTop = target;
        pinnedRef.current = true;
        return;
      }

      if (frameRef.current !== null) return;

      const startTop = container.scrollTop;
      let startAt: number | null = null;

      const step = (time: number) => {
        const nextContainer = containerRef.current;
        if (!nextContainer || !enabledRef.current || !pinnedRef.current) {
          frameRef.current = null;
          return;
        }

        // Re-read the target every frame so growing streaming content stays followed.
        const nextTarget = getBottomScrollTop(nextContainer);
        if (startAt === null) {
          startAt = time;
        }
        const progress = Math.min(
          1,
          (time - startAt) / SMOOTH_SCROLL_DURATION_MS
        );
        const eased = 1 - Math.pow(1 - progress, 3);

        nextContainer.scrollTop = startTop + (nextTarget - startTop) * eased;

        if (progress < 1 && Math.abs(nextContainer.scrollTop - nextTarget) > 1) {
          frameRef.current = window.requestAnimationFrame(step);
          return;
        }

        nextContainer.scrollTop = nextTarget;
        pinnedRef.current = true;
        frameRef.current = null;
      };

      frameRef.current = window.requestAnimationFrame(step);
    },
    [behavior, cancelAnimation]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updatePinnedState = () => {
      if (frameRef.current !== null) {
        pinnedRef.current = true;
        return;
      }

      pinnedRef.current = isPinnedToBottom();
    };
    // Any direct user scroll intent should stop smooth following immediately.
    const stopProgrammaticScroll = () => {
      cancelAnimation();
      pinnedRef.current = isPinnedToBottom();
    };

    container.addEventListener('scroll', updatePinnedState, { passive: true });
    container.addEventListener('wheel', stopProgrammaticScroll, { passive: true });
    container.addEventListener('touchstart', stopProgrammaticScroll, {
      passive: true
    });
    container.addEventListener('pointerdown', stopProgrammaticScroll, {
      passive: true
    });
    return () => {
      container.removeEventListener('scroll', updatePinnedState);
      container.removeEventListener('wheel', stopProgrammaticScroll);
      container.removeEventListener('touchstart', stopProgrammaticScroll);
      container.removeEventListener('pointerdown', stopProgrammaticScroll);
    };
  }, [cancelAnimation, isPinnedToBottom]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const requestScroll = () => {
      if (enabledRef.current && pinnedRef.current) {
        scrollToBottom(behavior);
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    const observeChildren = () => {
      if (!resizeObserver) return;

      // Child sizes change during streaming even when the container box is stable.
      resizeObserver.disconnect();
      Array.from(container.children).forEach(child => {
        resizeObserver?.observe(child);
      });
    };

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(requestScroll);
      observeChildren();
    }

    let mutationObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(records => {
        const hasChildListChange = records.some(
          record => record.type === 'childList'
        );

        if (hasChildListChange) {
          observeChildren();
          requestScroll();
          return;
        }

        // ResizeObserver handles text growth; mutation fallback is only for older browsers.
        if (!resizeObserver) {
          requestScroll();
        }
      });
      mutationObserver.observe(container, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }

    return () => {
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [behavior, scrollToBottom]);

  useEffect(() => {
    if (enabledRef.current && pinnedRef.current) {
      scrollToBottom(behavior);
    }
  }, [enabled, behavior, scrollToBottom, ...deps]);

  useEffect(
    () => () => {
      cancelAnimation();
    },
    [cancelAnimation]
  );

  return {
    containerRef,
    bottomRef,
    isPinnedToBottom,
    scrollToBottom
  };
};
