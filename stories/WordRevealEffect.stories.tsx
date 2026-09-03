import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { WordRevealEffect } from '../src';

interface WordRevealDemoProps {
  animation: boolean;
  speed: number;
  time: number;
}

const frameStyle: React.CSSProperties = {
  width: 'min(680px, 100%)',
  padding: 24,
  border: '1px solid #d9dee7',
  borderRadius: 8,
  background: '#ffffff',
  boxShadow: '0 8px 24px rgba(31, 41, 55, 0.08)'
};

// content 引用保持稳定，避免 finished 状态刷新时把 effect 误触发为新一轮。
const wordRevealContent = (
  <p style={{ margin: '0 0 12px', fontSize: 18, lineHeight: 1.6 }}>
    WordRevealEffect reveals <strong>full words</strong> instead of
    individual characters, which keeps long prose easier to scan while
    it streams.
  </p>
);

const WordRevealDemo: React.FC<WordRevealDemoProps> = ({
  animation,
  speed,
  time
}) => {
  const [finished, setFinished] = useState(false);
  // options/onFinish 同样保持稳定，只在真实控制项变化时重播。
  const options = useMemo(() => ({ speed, time }), [speed, time]);
  const handleFinish = useCallback(() => {
    setFinished(true);
  }, []);

  useEffect(() => {
    setFinished(false);
  }, [animation, speed, time]);

  return (
    <div style={frameStyle}>
      <WordRevealEffect
        content={wordRevealContent}
        onFinish={handleFinish}
        animation={animation}
        options={options}
      />
      <small style={{ color: finished ? '#15803d' : '#6b7280' }}>
        {finished ? 'Finished' : 'Streaming words...'}
      </small>
    </div>
  );
};

const meta = {
  title: 'Effects/WordRevealEffect',
  component: WordRevealDemo,
  argTypes: {
    animation: {
      control: 'boolean'
    },
    speed: {
      control: { type: 'number', min: 20, max: 300, step: 10 }
    },
    time: {
      control: { type: 'number', min: 0, max: 2000, step: 100 }
    }
  }
} satisfies Meta<typeof WordRevealDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    animation: true,
    speed: 90,
    time: 0
  }
};

export const StartWithOffset: Story = {
  args: {
    ...Default.args,
    time: 500
  }
};

export const Immediate: Story = {
  args: {
    ...Default.args,
    animation: false
  }
};
