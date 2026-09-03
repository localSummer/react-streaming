# @liepin/react-streaming

React components and hooks for sequential streaming effects.

## Install

```bash
npm install @liepin/react-streaming
```

React is a peer dependency and is not bundled.

## Usage

Each item supplies a stable key and a React node. `Streaming` shows items in
order, while an effect controls how each item is revealed.

```tsx
import React from 'react';
import { Streaming, TypewriterEffect } from '@liepin/react-streaming';
import type { StreamingItem } from '@liepin/react-streaming';

const items: StreamingItem[] = [
  {
    key: 'summary',
    content: (
      <section>
        <h2>Summary</h2>
        <p>The summary is typed out first.</p>
      </section>
    )
  },
  {
    key: 'analysis',
    content: (
      <section>
        <h2>Analysis</h2>
        <p>The analysis follows after the summary.</p>
      </section>
    )
  }
];

export const Report = ({ streaming }: { streaming: boolean }) => (
  <Streaming
    items={items}
    enabled={streaming}
    effect={TypewriterEffect}
    effectOptions={{ speed: 30 }}
    fallback={<div>Loading next section...</div>}
  />
);
```

## Effects

Effects are React components that receive `content`, `onFinish`, `animation`,
and optional `options`.

Built-in effects:

- `TypewriterEffect`: reveals text character by character.
- `WordRevealEffect`: reveals text word by word.
- `BlockRevealEffect`: delays and fades in the whole content block.
- `ListRevealEffect`: fades in the direct children of the content root in order.

```tsx
const FadeEffect: React.FC<StreamingEffectProps> = ({
  content,
  onFinish
}) => {
  React.useEffect(() => {
    const timer = window.setTimeout(onFinish, 300);
    return () => window.clearTimeout(timer);
  }, [onFinish]);

  return <>{content}</>;
};
```

Pass an effect to `Streaming` for the default, or set `effect` on one item to
override it. Use `effect={null}` to complete an item immediately.

`useStreamingAutoScroll` can keep a scroll container pinned to the latest
streamed content:

```tsx
const { containerRef, bottomRef } = useStreamingAutoScroll({
  enabled: streaming,
  deps: [visibleItems.length],
  behavior: 'smooth'
});
```

## Storybook

Run the interactive component demos locally:

```bash
npm run storybook
```

Build the static Storybook site:

```bash
npm run storybook:build
```

The `Components/Streaming dashboard` story demonstrates a longer mixed
sequence with prose, metric cards, a local image, chart-like UI, a table, a
quote, and action cards.
