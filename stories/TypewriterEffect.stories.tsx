import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TypewriterEffect } from '../src';

interface TypewriterDemoProps {
  animation: boolean;
  speed: number;
  time: number;
}

// content 引用保持稳定，避免 finished 状态刷新时把 effect 误触发为新一轮。
const typewriterContent = (
  <p>
    This standalone effect supports <strong>nested React content</strong>{' '}
    and keeps the original element structure.
  </p>
);

const TypewriterDemo: React.FC<TypewriterDemoProps> = ({
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
    <div
      style={{
        width: 'min(680px, 100%)',
        padding: 24,
        border: '1px solid #d9dee7',
        borderRadius: 8,
        background: '#ffffff',
        boxShadow: '0 8px 24px rgba(31, 41, 55, 0.08)'
      }}
    >
      <TypewriterEffect
        content={typewriterContent}
        onFinish={handleFinish}
        animation={animation}
        options={options}
      />
      <small style={{ color: finished ? '#15803d' : '#6b7280' }}>
        {finished ? 'Finished' : 'Typing...'}
      </small>
    </div>
  );
};

const meta = {
  title: 'Effects/TypewriterEffect',
  component: TypewriterDemo,
  argTypes: {
    animation: {
      control: 'boolean'
    },
    speed: {
      control: { type: 'number', min: 10, max: 200, step: 5 }
    },
    time: {
      control: { type: 'number', min: 0, max: 1000, step: 50 }
    }
  }
} satisfies Meta<typeof TypewriterDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    animation: true,
    speed: 40,
    time: 0
  }
};

export const StartWithOffset: Story = {
  args: {
    ...Default.args,
    time: 600
  }
};

export const Immediate: Story = {
  args: {
    ...Default.args,
    animation: false
  }
};
