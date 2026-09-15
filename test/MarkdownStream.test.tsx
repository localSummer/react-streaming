import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MarkdownStream, Streaming } from '../src';
import type { MarkdownBlockMeta, StreamingItem } from '../src';

const renderBlock = (block: string, meta: MarkdownBlockMeta) => (
  <div data-testid={`block-${meta.index}`} data-last={String(meta.isLast)}>
    {block}
  </div>
);

describe('MarkdownStream', () => {
  afterEach(cleanup);

  it('heals incomplete markdown before rendering blocks', () => {
    render(<MarkdownStream markdown="Hello **wor" render={renderBlock} />);

    expect(screen.getByTestId('block-0').textContent).toBe('Hello **wor**');
  });

  it('only updates the last block while earlier blocks stay mounted', () => {
    const renders = new Map<number, number>();
    const trackingRender = (block: string, meta: MarkdownBlockMeta) => {
      renders.set(meta.index, (renders.get(meta.index) ?? 0) + 1);
      return renderBlock(block, meta);
    };

    const { rerender } = render(
      <MarkdownStream markdown={'# Title\n\nHello'} render={trackingRender} />
    );

    expect(screen.getByTestId('block-0').textContent).toBe('# Title');
    expect(screen.getByTestId('block-1').textContent).toBe('Hello');
    expect(renders.get(0)).toBe(1);
    expect(renders.get(1)).toBe(1);

    rerender(
      <MarkdownStream markdown={'# Title\n\nHello **wor'} render={trackingRender} />
    );

    expect(screen.getByTestId('block-0').textContent).toBe('# Title');
    expect(screen.getByTestId('block-1').textContent).toBe('Hello **wor**');
    expect(renders.get(0)).toBe(1);
    expect(renders.get(1)).toBe(2);
  });

  it('renders inside Streaming as a single item', () => {
    const items: StreamingItem[] = [
      {
        key: 'markdown',
        content: (
          <MarkdownStream markdown={'# Title\n\nBody'} render={renderBlock} />
        )
      }
    ];

    render(<Streaming items={items} enabled effect={null} />);

    expect(screen.getByTestId('block-0').textContent).toBe('# Title');
    expect(screen.getByTestId('block-1').textContent).toBe('Body');
  });
});
