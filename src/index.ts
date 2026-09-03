// 包公共 API 出口：组件、hook、内置效果与全部公开类型。
export { Streaming } from './components/Streaming';
export type { StreamingProps } from './components/Streaming';
export { StreamingRenderer } from './components/StreamingRenderer';
export type { StreamingRendererProps } from './components/StreamingRenderer';
export { useStreaming } from './hooks/useStreaming';
export { useStreamingAutoScroll } from './hooks/useStreamingAutoScroll';
export { TypewriterEffect } from './effects/TypewriterEffect';
export { BlockRevealEffect } from './effects/BlockRevealEffect';
export { ListRevealEffect } from './effects/ListRevealEffect';
export { WordRevealEffect } from './effects/WordRevealEffect';
export type {
  StreamingEffect,
  StreamingEffectOptions,
  StreamingEffectProps,
  StreamingItem,
  UseStreamingOptions,
  UseStreamingResult,
  VisibleStreamingItem
} from './core/types';
export type {
  TypewriterUnit,
  TypewriterOptions,
  TypewriterStartOptions,
  UseTypewriterResult
} from './effects/useTypewriter';
export type { TypewriterEffectOptions } from './effects/TypewriterEffect';
export type { BlockRevealEffectOptions } from './effects/BlockRevealEffect';
export type { ListRevealEffectOptions } from './effects/ListRevealEffect';
export type { WordRevealEffectOptions } from './effects/WordRevealEffect';
export type {
  UseStreamingAutoScrollOptions,
  UseStreamingAutoScrollResult
} from './hooks/useStreamingAutoScroll';
