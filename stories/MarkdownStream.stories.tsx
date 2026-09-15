import React, { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarkdownStream, Streaming } from '../src';
import type { StreamingItem } from '../src';

const source = [
  '# Streaming markdown',
  '',
  'Paragraph with **bold**, *italic*, ~~strike~~, `inline code`, and a [link](https://example.com).',
  '',
  '## Lists',
  '',
  '- Unordered item',
  '- Nested parent',
  '  - Nested child',
  '',
  '1. First',
  '2. Second',
  '',
  '- [x] Done',
  '- [ ] Open',
  '',
  '## Quote and code',
  '',
  '> Incomplete syntax is healed while tokens still arrive.',
  '',
  '```ts',
  'const ready = true;',
  '```',
  '',
  '## Table',
  '',
  '| Metric | Value |',
  '| --- | --- |',
  '| Latency | 32ms |',
  '| Tokens | 1.2k |',
  '',
  '---',
  '',
  'Closing paragraph.'
].join('\n');

const frameStyle: React.CSSProperties = {
  width: 'min(680px, 100%)',
  maxHeight: 560,
  overflowY: 'auto',
  padding: 24,
  border: '1px solid #d9dee7',
  borderRadius: 8,
  background: '#ffffff',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
};

const markdownStyle: React.CSSProperties = {
  fontSize: 15,
  lineHeight: 1.6,
  color: '#1f2937'
};

const renderMarkdownBlock = (block: string) => (
  <div className="rs-md" style={markdownStyle}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{block}</ReactMarkdown>
  </div>
);

interface MarkdownStreamDemoProps {
  enabled: boolean;
  speed: number;
  resetKey: number;
}

const MarkdownStreamDemo: React.FC<MarkdownStreamDemoProps> = ({
  enabled,
  speed,
  resetKey
}) => {
  const [markdown, setMarkdown] = useState(enabled ? '' : source);

  useEffect(() => {
    if (!enabled) {
      setMarkdown(source);
      return;
    }

    setMarkdown('');
    let index = 0;
    const timer = window.setInterval(() => {
      index += 1;
      setMarkdown(source.slice(0, index));
      if (index >= source.length) {
        window.clearInterval(timer);
      }
    }, speed);

    return () => window.clearInterval(timer);
  }, [enabled, resetKey, speed]);

  const items: StreamingItem[] = [
    {
      key: 'markdown',
      content: (
        <MarkdownStream markdown={markdown} render={renderMarkdownBlock} />
      ),
      effect: null
    }
  ];

  return (
    <div style={frameStyle}>
      <style>{`
        .rs-md h1, .rs-md h2 { margin: 0.8em 0 0.4em; }
        .rs-md p, .rs-md ul, .rs-md ol, .rs-md blockquote, .rs-md pre { margin: 0.5em 0; }
        .rs-md code { padding: 0.1em 0.35em; background: #f3f4f6; border-radius: 4px; font-size: 0.9em; }
        .rs-md pre { padding: 12px; background: #f3f4f6; border-radius: 6px; overflow: auto; }
        .rs-md pre code { padding: 0; background: none; }
        .rs-md blockquote { padding-left: 12px; border-left: 3px solid #d1d5db; color: #4b5563; }
        .rs-md table { border-collapse: collapse; width: 100%; margin: 0.6em 0; }
        .rs-md th, .rs-md td { border: 1px solid #d1d5db; padding: 6px 10px; text-align: left; }
        .rs-md th { background: #f9fafb; }
        .rs-md hr { border: 0; border-top: 1px solid #e5e7eb; margin: 1em 0; }
      `}</style>
      <Streaming items={items} enabled={enabled} resetKey={resetKey} />
    </div>
  );
};

const meta: Meta<typeof MarkdownStreamDemo> = {
  title: 'Components/Markdown stream',
  component: MarkdownStreamDemo,
  args: {
    enabled: true,
    speed: 18,
    resetKey: 0
  }
};

export default meta;

type Story = StoryObj<typeof MarkdownStreamDemo>;

export const GrowingMarkdown: Story = {};

export const CompletedMarkdown: Story = {
  args: { enabled: false }
};
