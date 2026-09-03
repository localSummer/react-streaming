import React, { useEffect, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Streaming,
  TypewriterEffect
} from '../src';
import type { StreamingEffectProps, StreamingItem } from '../src';

interface StreamingDemoProps {
  enabled: boolean;
  animation: boolean;
  speed: number;
  time: number;
  resetKey: number;
  skipSecond: boolean;
}

const frameStyle: React.CSSProperties = {
  width: 'min(680px, 100%)',
  padding: 24,
  border: '1px solid #d9dee7',
  borderRadius: 8,
  background: '#ffffff',
  boxShadow: '0 8px 24px rgba(31, 41, 55, 0.08)'
};

const sectionStyle: React.CSSProperties = {
  padding: '16px 0',
  borderBottom: '1px solid #e5e7eb'
};

const createItems = (skipSecond: boolean): StreamingItem[] => [
  {
    key: 'summary',
    content: (
      <section style={sectionStyle}>
        <small>SUMMARY</small>
        <h2>Streaming reports reveal content in sequence</h2>
        <p>
          The first section is rendered before the next section becomes
          available.
        </p>
      </section>
    )
  },
  {
    key: 'analysis',
    content: (
      <section style={sectionStyle}>
        <small>ANALYSIS</small>
        <h2>Each item can use the shared effect</h2>
        <p>
          TypewriterEffect preserves nested React elements while revealing
          text one character at a time.
        </p>
      </section>
    ),
    effect: skipSecond ? null : undefined
  },
  {
    key: 'next-step',
    content: (
      <section style={{ ...sectionStyle, borderBottom: 0 }}>
        <small>NEXT STEP</small>
        <h2>Use resetKey to replay a sequence</h2>
        <p>Change resetKey in the Controls panel to start the sequence again.</p>
      </section>
    )
  }
];

const StreamingDemo: React.FC<StreamingDemoProps> = ({
  enabled,
  animation,
  speed,
  time,
  resetKey,
  skipSecond
}) => {
  const items = useMemo(() => createItems(skipSecond), [skipSecond]);

  return (
    <div style={frameStyle}>
      <Streaming
        items={items}
        enabled={enabled}
        resetKey={resetKey}
        effect={TypewriterEffect}
        effectOptions={{ speed, time }}
        animation={animation}
        fallback={
          <p style={{ color: '#6b7280', marginBottom: 0 }}>
            Loading next section...
          </p>
        }
      />
    </div>
  );
};

const DelayEffect: React.FC<StreamingEffectProps> = ({
  content,
  onFinish,
  animation
}) => {
  useEffect(() => {
    if (!animation) {
      onFinish();
      return;
    }

    const timer = window.setTimeout(onFinish, 450);
    return () => window.clearTimeout(timer);
  }, [animation, onFinish]);

  return <div style={{ opacity: animation ? 0.65 : 1 }}>{content}</div>;
};

const meta = {
  title: 'Components/Streaming',
  component: StreamingDemo,
  parameters: {
    docs: {
      description: {
        component:
          'Sequentially reveals StreamingItem content and optionally applies an effect to each item.'
      }
    }
  },
  argTypes: {
    enabled: {
      control: 'boolean',
      description: 'Only reveal one item at a time when enabled.'
    },
    animation: {
      control: 'boolean',
      description: 'Apply the selected effect while streaming.'
    },
    speed: {
      control: { type: 'number', min: 10, max: 200, step: 5 },
      description: 'Milliseconds per character for TypewriterEffect.'
    },
    time: {
      control: { type: 'number', min: 0, max: 1000, step: 50 },
      description: 'Initial elapsed time for the current item.'
    },
    resetKey: {
      control: { type: 'number', min: 0, max: 10, step: 1 },
      description: 'Change this value to restart the current sequence.'
    },
    skipSecond: {
      control: 'boolean',
      description: 'Complete the second item immediately with effect={null}.'
    }
  }
} satisfies Meta<typeof StreamingDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypewriterSequence: Story = {
  args: {
    enabled: true,
    animation: true,
    speed: 35,
    time: 0,
    resetKey: 0,
    skipSecond: false
  }
};

export const WithoutAnimation: Story = {
  args: {
    ...TypewriterSequence.args,
    animation: false
  }
};

export const AllContentWhenDisabled: Story = {
  args: {
    ...TypewriterSequence.args,
    enabled: false
  }
};

export const SkipEffectForOneItem: Story = {
  args: {
    ...TypewriterSequence.args,
    skipSecond: true
  }
};

export const CustomEffect: Story = {
  args: {
    ...TypewriterSequence.args
  },
  render: ({ enabled, animation, resetKey }) => (
    <div style={frameStyle}>
      <Streaming
        items={createItems(false)}
        enabled={enabled}
        resetKey={resetKey}
        effect={DelayEffect}
        animation={animation}
        fallback={
          <p style={{ color: '#6b7280', marginBottom: 0 }}>
            Waiting for the custom effect...
          </p>
        }
      />
    </div>
  )
};
