import React, {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { ReactElement, ReactNode } from 'react';
import type {
  StreamingEffectOptions,
  StreamingEffectProps
} from '../core/types';
import { getNonNegativeNumber } from './options';

export interface ListRevealEffectOptions extends StreamingEffectOptions {
  delay?: number;
  stagger?: number;
  duration?: number;
}

const DEFAULT_DELAY = 0;
const DEFAULT_STAGGER = 80;
const DEFAULT_DURATION = 180;

type StylableElement = ReactElement<{
  children?: ReactNode;
  style?: React.CSSProperties;
}>;

const getElementChildren = (element: ReactElement) =>
  Children.toArray((element.props as { children?: ReactNode }).children);

// 只处理 content root 的直接子元素；嵌套结构保持完整，避免做 selector API。
const getRevealCount = (content: ReactNode) => {
  if (isValidElement(content)) {
    const children = getElementChildren(content);
    return children.length || 1;
  }

  return Children.toArray(content).length;
};

const revealChild = (
  child: ReactNode,
  index: number,
  visibleCount: number,
  duration: number,
  animation: boolean
) => {
  if (!animation) return child;

  const style: React.CSSProperties = {
    opacity: index < visibleCount ? 1 : 0,
    transition: `opacity ${duration}ms ease`
  };

  if (isValidElement(child)) {
    const element = child as StylableElement;
    // 子元素始终挂载，只改透明度，避免 grid/flex 在流式过程中反复重排。
    return cloneElement(element, {
      style: {
        ...element.props.style,
        ...style
      }
    });
  }

  return (
    <span key={index} style={style}>
      {child}
    </span>
  );
};

const renderRevealContent = (
  content: ReactNode,
  visibleCount: number,
  duration: number,
  animation: boolean
) => {
  if (isValidElement(content)) {
    const children = getElementChildren(content);

    if (children.length === 0) {
      return revealChild(content, 0, visibleCount, duration, animation);
    }

    return cloneElement(content as StylableElement, {
      children: children.map((child, index) =>
        revealChild(child, index, visibleCount, duration, animation)
      )
    });
  }

  return Children.toArray(content).map((child, index) =>
    revealChild(child, index, visibleCount, duration, animation)
  );
};

export const ListRevealEffect: React.FC<StreamingEffectProps> = ({
  content,
  onFinish,
  animation,
  options
}) => {
  const listOptions = options as ListRevealEffectOptions | undefined;
  const delay = getNonNegativeNumber(listOptions?.delay, DEFAULT_DELAY);
  const stagger = getNonNegativeNumber(listOptions?.stagger, DEFAULT_STAGGER);
  const duration = getNonNegativeNumber(listOptions?.duration, DEFAULT_DURATION);
  const revealCount = useMemo(() => getRevealCount(content), [content]);
  const [visibleCount, setVisibleCount] = useState(animation ? 0 : revealCount);

  useEffect(() => {
    if (!animation) {
      setVisibleCount(revealCount);
      onFinish();
      return;
    }

    if (revealCount === 0) {
      onFinish();
      return;
    }

    setVisibleCount(0);

    // 最后一个子元素淡入完成后再 onFinish，保证下一段 stream 不抢跑。
    const timers: ReturnType<typeof window.setTimeout>[] = [];
    for (let index = 0; index < revealCount; index += 1) {
      timers.push(
        window.setTimeout(() => {
          setVisibleCount(index + 1);
        }, delay + stagger * index)
      );
    }
    timers.push(window.setTimeout(onFinish, delay + stagger * (revealCount - 1) + duration));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [animation, content, delay, duration, onFinish, revealCount, stagger]);

  return <>{renderRevealContent(content, visibleCount, duration, animation)}</>;
};
