import React from 'react';
import { renderStreamingItems } from '../core/renderItems';
import type {
  StreamingEffect,
  StreamingEffectOptions,
  VisibleStreamingItem
} from '../core/types';

/** StreamingRenderer 的 props：已放行条目 + 展示配置（不含流式状态逻辑）。 */
export interface StreamingRendererProps {
  items: readonly VisibleStreamingItem[];
  fallback?: React.ReactNode;
  showFallback?: boolean;
  effect?: StreamingEffect | null;
  effectOptions?: StreamingEffectOptions;
  animation?: boolean;
}

// 纯展示层：渲染已放行条目与流式期间的 fallback，不持有状态，
// 可脱离 useStreaming 单独使用（自行喂入 visibleItems）。
export const StreamingRenderer: React.FC<StreamingRendererProps> = ({
  items,
  fallback,
  showFallback = false,
  effect,
  effectOptions,
  animation = true
}) => (
  <>
    {renderStreamingItems(items, {
      effect,
      effectOptions,
      animation
    })}
    {showFallback ? fallback : null}
  </>
);
