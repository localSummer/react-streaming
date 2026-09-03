import React, { useEffect } from 'react';
import { useTypewriter } from './useTypewriter';
import type {
  StreamingEffectOptions,
  StreamingEffectProps
} from '../core/types';
import { getNonNegativeNumber } from './options';

/** options 可覆盖：speed（ms/字，默认 50）、time（初始快进毫秒数，默认 0）。 */
export interface TypewriterEffectOptions extends StreamingEffectOptions {
  speed?: number;
  time?: number;
}

// 打字机效果适配器：把 StreamingEffectProps 桥接到 useTypewriter。
// 播完后由 useTypewriter 触发 onFinish，放行下一条内容。
export const TypewriterEffect: React.FC<StreamingEffectProps> = ({
  content,
  onFinish,
  animation,
  options
}) => {
  const typewriterOptions = options as TypewriterEffectOptions | undefined;
  const speed = getNonNegativeNumber(typewriterOptions?.speed, 50) || 50;
  const time = getNonNegativeNumber(typewriterOptions?.time, 0);
  const { currentContent, start, initTypewriter } = useTypewriter({
    speed,
    onFinish
  });

  // content/time/animation 变化即重新装载并开播；start 内部防重复计时器
  useEffect(() => {
    initTypewriter(content, time);
    start({ animation });
  }, [content, initTypewriter, start, time, animation]);

  // 动画开启时渲染逐字内容；关闭时直接给完整内容
  return <>{animation ? currentContent : content}</>;
};
