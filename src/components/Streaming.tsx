import React from 'react';
import { useStreaming } from '../hooks/useStreaming';
import type {
  StreamingEffect,
  StreamingEffectOptions,
  UseStreamingOptions
} from '../core/types';
import { StreamingRenderer } from './StreamingRenderer';

/** Streaming 的 props：useStreaming 的配置 + 渲染层参数（fallback、全局效果、动画开关）。 */
export interface StreamingProps extends UseStreamingOptions {
  fallback?: React.ReactNode;
  effect?: StreamingEffect | null;
  effectOptions?: StreamingEffectOptions;
  animation?: boolean;
}

// 对外主组件：把 useStreaming 的状态装配到 StreamingRenderer 上。
// 动画仅在 enabled 时生效；fallback 在流式未播完期间显示（可放加载占位）。
export const Streaming: React.FC<StreamingProps> = ({
  items,
  enabled = false,
  resetKey,
  fallback,
  effect,
  effectOptions,
  animation = true
}) => {
  const { visibleItems, isStreaming } = useStreaming({
    items,
    enabled,
    resetKey
  });

  return (
    <StreamingRenderer
      items={visibleItems}
      fallback={fallback}
      showFallback={isStreaming}
      effect={effect}
      effectOptions={effectOptions}
      animation={enabled && animation}
    />
  );
};
