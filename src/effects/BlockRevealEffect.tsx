import React, { useEffect, useState } from 'react';
import type {
  StreamingEffectOptions,
  StreamingEffectProps
} from '../core/types';
import { getNonNegativeNumber } from './options';

/** delay=出现前的等待时长(ms)，duration=淡入时长(ms)。 */
export interface BlockRevealEffectOptions extends StreamingEffectOptions {
  delay?: number;
  duration?: number;
}

const DEFAULT_DELAY = 350;
const DEFAULT_DURATION = 180;

// 整块淡入效果：内容先保持透明，delay 后淡入（耗时 duration），
// 淡入结束时 onFinish——保证下一块在本块完全显示后才开始播放。
export const BlockRevealEffect: React.FC<StreamingEffectProps> = ({
  content,
  onFinish,
  animation,
  options
}) => {
  const blockOptions = options as BlockRevealEffectOptions | undefined;
  const delay = getNonNegativeNumber(blockOptions?.delay, DEFAULT_DELAY);
  const duration = getNonNegativeNumber(blockOptions?.duration, DEFAULT_DURATION);
  const [visible, setVisible] = useState(!animation); // 关闭动画时首帧即可见

  useEffect(() => {
    if (!animation) {
      setVisible(true);
      onFinish();
      return;
    }

    setVisible(false);

    const revealTimer = window.setTimeout(() => {
      setVisible(true);
    }, delay);
    const finishTimer = window.setTimeout(onFinish, delay + duration);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(finishTimer);
    };
  }, [animation, content, delay, duration, onFinish]);

  return (
    <div
      style={{
        opacity: animation && !visible ? 0 : 1,
        transition: animation ? `opacity ${duration}ms ease` : undefined
      }}
    >
      {content}
    </div>
  );
};
