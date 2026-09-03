import React, { useEffect } from 'react';
import { useTypewriter } from './useTypewriter';
import type {
  StreamingEffectOptions,
  StreamingEffectProps
} from '../core/types';
import { getNonNegativeNumber } from './options';

export interface WordRevealEffectOptions extends StreamingEffectOptions {
  speed?: number;
  time?: number;
}

// 逐词效果复用 useTypewriter 的 ReactNode 解析逻辑，只切换消费单位。
export const WordRevealEffect: React.FC<StreamingEffectProps> = ({
  content,
  onFinish,
  animation,
  options
}) => {
  const wordOptions = options as WordRevealEffectOptions | undefined;
  const speed = getNonNegativeNumber(wordOptions?.speed, 80) || 80;
  const time = getNonNegativeNumber(wordOptions?.time, 0);
  const { currentContent, start, initTypewriter } = useTypewriter({
    speed,
    unit: 'word',
    onFinish
  });

  useEffect(() => {
    initTypewriter(content, time);
    start({ animation });
  }, [content, initTypewriter, start, time, animation]);

  return <>{animation ? currentContent : content}</>;
};
