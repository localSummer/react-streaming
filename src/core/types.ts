// 流式渲染核心类型。
//
// 整体契约：内容按 items 顺序逐条放行，每条的进场动画由一个效果组件
// （StreamingEffect）负责播放；效果播完后必须调用 onFinish，
// useStreaming 才会放行下一条。

import type * as React from 'react';

/** 传给效果组件的自由参数（如打字机的 speed），由各效果组件自行解读。 */
export type StreamingEffectOptions = Record<string, unknown>;

/** 渲染器注入给效果组件的统一 props。 */
export interface StreamingEffectProps {
  content: React.ReactNode;
  onFinish: () => void;
  animation: boolean;
  options?: StreamingEffectOptions;
}

/** 效果组件类型。animation=false 时应跳过动画、直接渲染终态并立即 onFinish。 */
export type StreamingEffect = React.ComponentType<StreamingEffectProps>;

/**
 * 一条待流式展示的内容。
 * effect 传 null 表示本条禁用动画；不传（undefined）表示沿用全局效果。
 */
export interface StreamingItem {
  key: React.Key;
  content: React.ReactNode;
  effect?: StreamingEffect | null;
  effectOptions?: StreamingEffectOptions;
}

/** 已放行的条目：在 StreamingItem 基础上附加序号与 useStreaming 注入的专属 onFinish。 */
export interface VisibleStreamingItem extends StreamingItem {
  index: number;
  onFinish: () => void;
}

/** enabled=false 时直接全量渲染；resetKey 变化视为序列换代（如新一轮回答），从头回放。 */
export interface UseStreamingOptions {
  items: readonly StreamingItem[];
  enabled?: boolean;
  resetKey?: React.Key;
}

/** streamingIndex 为当前正在播放的条目下标；isStreaming 表示仍有内容未播完。 */
export interface UseStreamingResult {
  visibleItems: readonly VisibleStreamingItem[];
  streamingIndex: number;
  isStreaming: boolean;
  isComplete: boolean;
}
