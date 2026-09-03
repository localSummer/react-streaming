import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListRevealEffect } from '../src';

interface ListRevealDemoProps {
  animation: boolean;
  delay: number;
  stagger: number;
  duration: number;
}

const frameStyle: React.CSSProperties = {
  width: 'min(760px, 100%)',
  padding: 24,
  border: '1px solid #d9dee7',
  borderRadius: 8,
  background: '#ffffff',
  boxShadow: '0 8px 24px rgba(31, 41, 55, 0.08)'
};

const cardStyle: React.CSSProperties = {
  minWidth: 0,
  padding: 16,
  border: '1px solid #e5e7eb',
  borderRadius: 8,
  background: '#f9fafb'
};

const items = [
  ['Pipeline health', 'Qualified volume is up 18% this week.'],
  ['Response speed', 'Median first touch is down to 4m 12s.'],
  ['Watch list', 'Twenty-three accounts need a recovery pass.']
];

// content 引用保持稳定，避免 finished 状态刷新时把 effect 误触发为新一轮。
const listRevealContent = (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 12,
      marginBottom: 12
    }}
  >
    {items.map(([title, copy]) => (
      <article key={title} style={cardStyle}>
        <strong style={{ display: 'block', marginBottom: 8 }}>{title}</strong>
        <p style={{ margin: 0, color: '#6b7280', lineHeight: 1.5 }}>{copy}</p>
      </article>
    ))}
  </div>
);

const ListRevealDemo: React.FC<ListRevealDemoProps> = ({
  animation,
  delay,
  stagger,
  duration
}) => {
  const [finished, setFinished] = useState(false);
  // options/onFinish 同样保持稳定，只在真实控制项变化时重播。
  const options = useMemo(() => ({ delay, stagger, duration }), [delay, stagger, duration]);
  const handleFinish = useCallback(() => {
    setFinished(true);
  }, []);

  useEffect(() => {
    setFinished(false);
  }, [animation, delay, stagger, duration]);

  return (
    <div style={frameStyle}>
      <ListRevealEffect
        content={listRevealContent}
        onFinish={handleFinish}
        animation={animation}
        options={options}
      />
      <small style={{ color: finished ? '#15803d' : '#6b7280' }}>
        {finished ? 'Finished' : 'Revealing items...'}
      </small>
    </div>
  );
};

const meta = {
  title: 'Effects/ListRevealEffect',
  component: ListRevealDemo,
  argTypes: {
    animation: {
      control: 'boolean'
    },
    delay: {
      control: { type: 'number', min: 0, max: 1200, step: 50 }
    },
    stagger: {
      control: { type: 'number', min: 0, max: 500, step: 20 }
    },
    duration: {
      control: { type: 'number', min: 0, max: 1200, step: 20 }
    }
  }
} satisfies Meta<typeof ListRevealDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    animation: true,
    delay: 0,
    stagger: 90,
    duration: 180
  }
};

export const Delayed: Story = {
  args: {
    ...Default.args,
    delay: 300
  }
};

export const Immediate: Story = {
  args: {
    ...Default.args,
    animation: false
  }
};
