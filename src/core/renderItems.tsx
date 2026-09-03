import React from 'react';
import { useEffect } from 'react';
import type {
  StreamingEffect,
  StreamingEffectOptions,
  StreamingEffectProps,
  VisibleStreamingItem
} from './types';

// 无动画时的兜底效果：原样渲染内容并立即 onFinish，让流式流程继续推进。
const CompleteEffect: React.FC<StreamingEffectProps> = ({ content, onFinish }) => {
  useEffect(() => {
    onFinish();
  }, [onFinish]);

  return <>{content}</>;
};

interface StreamingItemViewProps {
  item: VisibleStreamingItem;
  effect?: StreamingEffect | null;
  effectOptions?: StreamingEffectOptions;
  animation: boolean;
}

// 单条目视图：解析本条最终使用哪个效果组件及其参数。
const StreamingItemView: React.FC<StreamingItemViewProps> = ({
  item,
  effect,
  effectOptions,
  animation
}) => {
  // 效果选择优先级：条目级 > 全局（显式 null 表示禁用）；关闭动画时统一退回 CompleteEffect。
  const selectedEffect = item.effect === undefined ? effect : item.effect;
  const selectedOptions =
    item.effectOptions === undefined ? effectOptions : item.effectOptions;
  const Effect = animation ? selectedEffect ?? CompleteEffect : CompleteEffect;

  return (
    <Effect
      content={item.content}
      onFinish={item.onFinish}
      animation={animation}
      options={selectedOptions}
    />
  );
};

export interface RenderItemsOptions {
  effect?: StreamingEffect | null;
  effectOptions?: StreamingEffectOptions;
  animation: boolean;
}

/** 将已放行条目渲染为效果组件列表；key 稳定，各条目动画状态互不串扰。 */
export const renderStreamingItems = (
  items: readonly VisibleStreamingItem[],
  options: RenderItemsOptions
) =>
  items.map((item) => (
    <StreamingItemView
      key={item.key}
      item={item}
      effect={options.effect}
      effectOptions={options.effectOptions}
      animation={options.animation}
    />
  ));
