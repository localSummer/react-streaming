import React, { useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  StreamingRenderer,
  TypewriterEffect,
  useStreaming,
  useStreamingAutoScroll
} from '../src';
import type { StreamingItem } from '../src';

interface AutoScrollDemoProps {
  enabled: boolean;
  animation: boolean;
  speed: number;
  resetKey: number;
  behavior: ScrollBehavior;
}

const frameStyle: React.CSSProperties = {
  width: 'min(720px, 100%)',
  padding: 24,
  border: '1px solid #d9dee7',
  borderRadius: 8,
  background: '#ffffff',
  boxShadow: '0 8px 24px rgba(31, 41, 55, 0.08)'
};

const scrollAreaStyle: React.CSSProperties = {
  height: 320,
  overflowY: 'auto',
  padding: 18,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#f9fafb'
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 18,
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#ffffff'
};

const createItems = (): StreamingItem[] =>
  Array.from({ length: 8 }, (_, index) => ({
    key: `section-${index}`,
    content: (
      <section style={sectionStyle}>
        <strong style={{ display: 'block', marginBottom: 8 }}>
          Stream section {index + 1}
        </strong>
        <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.6 }}>
          This paragraph is intentionally long enough to make the scroll area
          grow while TypewriterEffect is rendering text. When the viewport is
          already near the bottom, useStreamingAutoScroll keeps the latest
          streamed content in view.
        </p>
      </section>
    )
  }));

const AutoScrollDemo: React.FC<AutoScrollDemoProps> = ({
  enabled,
  animation,
  speed,
  resetKey,
  behavior
}) => {
  const items = useMemo(createItems, []);
  const effectOptions = useMemo(() => ({ speed }), [speed]);
  const { visibleItems, isStreaming, streamingIndex } = useStreaming({
    items,
    enabled,
    resetKey
  });
  const { containerRef, bottomRef } = useStreamingAutoScroll<HTMLDivElement>({
    enabled,
    deps: [visibleItems.length, streamingIndex, resetKey],
    behavior
  });

  return (
    <div style={frameStyle}>
      <div ref={containerRef} style={scrollAreaStyle}>
        <StreamingRenderer
          items={visibleItems}
          fallback={
            <p style={{ margin: 0, color: '#6b7280' }}>Loading next section...</p>
          }
          showFallback={isStreaming}
          effect={TypewriterEffect}
          effectOptions={effectOptions}
          animation={enabled && animation}
        />
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

const meta = {
  title: 'Hooks/useStreamingAutoScroll',
  component: AutoScrollDemo,
  argTypes: {
    enabled: {
      control: 'boolean'
    },
    animation: {
      control: 'boolean'
    },
    speed: {
      control: { type: 'number', min: 10, max: 120, step: 5 }
    },
    resetKey: {
      control: { type: 'number', min: 0, max: 20, step: 1 }
    },
    behavior: {
      control: 'select',
      options: ['smooth', 'auto']
    }
  }
} satisfies Meta<typeof AutoScrollDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    enabled: true,
    animation: true,
    speed: 18,
    resetKey: 0,
    behavior: 'smooth'
  }
};

export const Instant: Story = {
  args: {
    ...Default.args,
    animation: false,
    behavior: 'auto'
  }
};
