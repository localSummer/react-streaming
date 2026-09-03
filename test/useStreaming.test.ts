import { act, renderHook } from '@testing-library/react-hooks';
import { describe, expect, it } from 'vitest';
import { useStreaming } from '../src';
import type { StreamingItem } from '../src';

const createItems = (keys: string[]): StreamingItem[] =>
  keys.map((key) => ({
    key,
    content: key
  }));

describe('useStreaming', () => {
  it('resets when the sequence key changes', () => {
    const { result, rerender } = renderHook(
      ({ items }) => useStreaming({ items, enabled: true }),
      { initialProps: { items: createItems(['first', 'second']) } }
    );
    const oldFinish = result.current.visibleItems[0].onFinish;

    act(() => {
      oldFinish?.();
    });
    expect(result.current.streamingIndex).toBe(1);

    rerender({ items: createItems(['new-first', 'new-second']) });
    expect(result.current.streamingIndex).toBe(0);
    expect(result.current.visibleItems).toHaveLength(1);

    act(() => {
      oldFinish?.();
    });
    expect(result.current.streamingIndex).toBe(0);
  });

  it('ignores callbacks from the non-streaming render after streaming starts', () => {
    const { result, rerender } = renderHook(
      ({ enabled }) => useStreaming({ items: createItems(['first', 'second']), enabled }),
      { initialProps: { enabled: false } }
    );
    const oldFinish = result.current.visibleItems[0].onFinish;

    rerender({ enabled: true });
    act(() => {
      oldFinish?.();
    });

    expect(result.current.streamingIndex).toBe(0);
    expect(result.current.visibleItems).toHaveLength(1);
  });
});
