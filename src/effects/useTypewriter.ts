import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import type { ReactElement, ReactNode } from 'react';

// 打字机核心逻辑：
// 1. parseNode 把任意 ReactNode 解析为 SegmentNode 段落树（文本按 unit 计长，
//    无法安全拆分的节点作为原子、各计 1 个 unit）；
// 2. 定时器每 tick 消费 1 个 unit，renderNode 在预算内重放段落树得到当前画面；
// 3. unit 消费完毕时 complete() 触发一次 onFinish。

// HTML 自闭合标签：无法向内部插入文字，作为原子整体出现。
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

export type TypewriterUnit = 'character' | 'word';

// 段落树节点；length = 消费该节点所需的 unit 数。
type SegmentNode =
  // 纯文本：可按 unit 截断
  | { type: 'text'; content: string; tokens?: string[]; length: number }
  // 原生容器元素：可深入子节点逐 unit 渲染
  | { type: 'element'; element: ReactElement; children: SegmentNode[]; length: number }
  // 自闭合标签（img/br 等）：原子出现
  | { type: 'void'; element: ReactElement; length: number }
  // 自定义组件：内部结构无法安全改写，原子出现
  | { type: 'component'; element: ReactElement; length: number };

export interface TypewriterOptions {
  /** 每个 unit 的间隔毫秒数，默认 50。 */
  speed?: number;
  /** 文本消费单位：character=逐字，word=逐词。 */
  unit?: TypewriterUnit;
  /** 全部 unit 消费完毕后的回调（只触发一次）。 */
  onFinish?: () => void;
}

/** animation=false 时跳过逐字过程，直接渲染完整内容。 */
export interface TypewriterStartOptions {
  animation?: boolean;
}

export interface UseTypewriterResult {
  /** 按当前进度截取后的内容。 */
  currentContent: ReactNode;
  /** 开始（或恢复）逐字播放。 */
  start: (options?: TypewriterStartOptions) => void;
  /** 装载内容并设定初始进度。 */
  initTypewriter: (content: ReactNode, time?: number) => void;
  /** 0~1 的播放进度。 */
  progress: number;
}

const isVoidElement = (element: ReactElement) =>
  typeof element.type === 'string' && VOID_ELEMENTS.has(element.type.toLowerCase());

const getWordTokens = (content: string) =>
  content.match(/\s*\S+\s*/g) ?? (content ? [content] : []);

const createTextSegment = (content: string, unit: TypewriterUnit): SegmentNode[] => {
  if (!content) return [];

  if (unit === 'word') {
    const tokens = getWordTokens(content);
    return tokens.length ? [{ type: 'text', content, tokens, length: tokens.length }] : [];
  }

  return [{ type: 'text', content, length: content.length }];
};

// ReactNode -> 段落树：文本按 unit 计长；原生元素递归求和子节点；
// 自闭合标签与自定义组件作为原子计 1，整体出现或消失。
const parseNode = (node: ReactNode, unit: TypewriterUnit): SegmentNode[] => {
  if (node === null || node === undefined || typeof node === 'boolean') {
    return [];
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return createTextSegment(String(node), unit);
  }

  if (Array.isArray(node)) {
    return node.reduce<SegmentNode[]>(
      (segments, child) => segments.concat(parseNode(child, unit)),
      []
    );
  }

  if (!isValidElement(node)) {
    return [];
  }

  if (isVoidElement(node)) {
    return [{ type: 'void', element: node, length: 1 }];
  }

  const children = Children.toArray(node.props.children);
  // 无子节点的自定义组件原子化出现，避免先渲染出一个空壳再填内容
  if (children.length === 0 && typeof node.type !== 'string') {
    return [{ type: 'component', element: node, length: 1 }];
  }

  const childSegments = children.reduce<SegmentNode[]>(
    (segments, child) => segments.concat(parseNode(child, unit)),
    []
  );
  const totalLength = childSegments.reduce((sum, segment) => sum + segment.length, 0);

  // 子内容不产生任何字符的组件（如纯图标）同样原子化
  if (totalLength === 0 && typeof node.type !== 'string') {
    return [{ type: 'component', element: node, length: 1 }];
  }

  return [
    {
      type: 'element',
      element: node,
      children: childSegments,
      length: totalLength
    }
  ];
};

// 在 maxChars 预算内渲染该节点，返回渲染结果与实际消费数。
// text 可截断；void/component 要么整体出现要么不出现；element 逐子消耗预算。
const renderNode = (
  node: SegmentNode,
  maxChars: number
): { node: ReactNode; consumedChars: number } => {
  if (maxChars <= 0) {
    return { node: null, consumedChars: 0 };
  }

  switch (node.type) {
    case 'text': {
      const take = Math.min(Math.floor(maxChars), node.length);
      return {
        node: node.tokens ? node.tokens.slice(0, take).join('') : node.content.substring(0, take),
        consumedChars: take
      };
    }

    case 'void':
    case 'component':
      return maxChars >= node.length
        ? { node: node.element, consumedChars: node.length }
        : { node: null, consumedChars: 0 };

    case 'element': {
      let consumed = 0;
      const children: ReactNode[] = [];

      for (const child of node.children) {
        if (consumed >= maxChars) break;

        const result = renderNode(child, maxChars - consumed);
        consumed += result.consumedChars;

        if (result.node !== null) {
          children.push(result.node);
        }
      }

      // 裁剪出的子元素可能没有 key，补 index key 以免 React 警告与错误复用
      const keyedChildren = children.map((child, index) =>
        isValidElement(child) && child.key == null
          ? cloneElement(child, { key: index })
          : child
      );

      return {
        node: cloneElement(node.element, {
          children: keyedChildren.length > 0 ? keyedChildren : null
        }),
        consumedChars: consumed
      };
    }
  }
};

// 同上：给顶层结果节点补齐缺失的 key。
const addMissingKeys = (nodes: ReactNode[]) =>
  nodes.map((node, index) =>
    isValidElement(node) && node.key == null
      ? cloneElement(node, { key: index })
      : node
  );

export const useTypewriter = ({
  speed = 50,
  unit = 'character',
  onFinish
}: TypewriterOptions = {}): UseTypewriterResult => {
  // speed 非法（NaN/负数/0）时回退默认 50ms/unit
  const interval = Number.isFinite(speed) && speed > 0 ? speed : 50;
  const [currentChars, setCurrentChars] = useState(0);
  const segmentNodesRef = useRef<SegmentNode[]>([]);
  const totalCharsRef = useRef(0);
  const progressRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  // 停表并把完成收敛为一次（幂等），防止重复触发 onFinish
  const complete = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!completedRef.current) {
      completedRef.current = true;
      onFinishRef.current?.();
    }
  }, []);

  // 装载新内容。time>0 表示预热：直接跳过 time/interval 对应的 unit 数，
  // 用于重播时快进或恢复已有进度。
  const initTypewriter = useCallback(
    (content: ReactNode, time = 0) => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      segmentNodesRef.current = parseNode(content, unit);
      totalCharsRef.current = segmentNodesRef.current.reduce(
        (sum, segment) => sum + segment.length,
        0
      );

      const initialChars = Math.min(
        totalCharsRef.current,
        Math.max(0, Math.floor(time / interval))
      );
      progressRef.current = initialChars;
      completedRef.current = false;
      setCurrentChars(initialChars);
    },
    [interval, unit]
  );

  // 逐 tick 消费 unit。重复调用安全：计时器已在跑或已播完时直接返回。
  const start = useCallback(
    ({ animation = true }: TypewriterStartOptions = {}) => {
      if (!animation) {
        progressRef.current = totalCharsRef.current;
        setCurrentChars(totalCharsRef.current);
        complete();
        return;
      }

      if (timerRef.current !== null || completedRef.current) {
        return;
      }

      if (progressRef.current >= totalCharsRef.current) {
        setCurrentChars(totalCharsRef.current);
        complete();
        return;
      }

      timerRef.current = setInterval(() => {
        progressRef.current = Math.min(
          progressRef.current + 1,
          totalCharsRef.current
        );
        setCurrentChars(progressRef.current);

        if (progressRef.current >= totalCharsRef.current) {
          complete();
        }
      }, interval);
    },
    [complete, interval]
  );

  // 卸载时清掉计时器，防止向已卸载组件 setState
  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    },
    []
  );

  // 每次进度变化，按 currentChars 预算重放段落树生成当前画面
  const currentContent = useMemo(() => {
    if (!segmentNodesRef.current.length || currentChars === 0) {
      return null;
    }

    let consumed = 0;
    const results: ReactNode[] = [];

    for (const node of segmentNodesRef.current) {
      if (consumed >= currentChars) break;

      const result = renderNode(node, currentChars - consumed);
      consumed += result.consumedChars;

      if (result.node !== null) {
        results.push(result.node);
      }
    }

    return addMissingKeys(results);
  }, [currentChars]);

  return {
    currentContent,
    start,
    initTypewriter,
    progress:
      totalCharsRef.current > 0
        ? Math.min(1, currentChars / totalCharsRef.current)
        : 0
  };
};
