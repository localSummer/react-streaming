import type * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { StreamingItem, UseStreamingOptions, UseStreamingResult } from '../core/types';

// useStreaming 状态机：维护「当前放行到第几条」（streamingIndex）。
// 可见条目 = 已完成的前若干条 + 正在播放动画的当前条；当前条的效果组件
// 调用 onFinish 后索引 +1，下一条随之出现。enabled=false 时全部直接可见。

// 序列签名 = resetKey + 各条目 key。内容换代（新会话/新一轮回答）时签名变化，据此从头回放。
const getSequenceSignature = (items: readonly StreamingItem[], resetKey?: React.Key) =>
  JSON.stringify([resetKey, items.map(({ key }) => key)]);

export const useStreaming = ({
  items,
  enabled = false,
  resetKey
}: UseStreamingOptions): UseStreamingResult => {
  const [streamingIndex, setStreamingIndex] = useState(0);
  const itemCount = items.length;
  const sequenceSignature = useMemo(
    () => getSequenceSignature(items, resetKey),
    [items, resetKey]
  );
  const callbackSignature = `${sequenceSignature}:${enabled}`;
  const previousSequenceSignature = useRef(sequenceSignature);
  const previousEnabled = useRef(enabled);
  const sequenceChanged = previousSequenceSignature.current !== sequenceSignature;
  const enteringStreaming = enabled && !previousEnabled.current;
  // 渲染期兜底：序列换代或刚切入流式时直接按 0 取值，
  // 避免下方 reset effect 提交前用旧进度闪一帧。
  const effectiveStreamingIndex =
    sequenceChanged || enteringStreaming ? 0 : Math.min(streamingIndex, itemCount);

  // 渲染期已按新序列取值，下面两个 effect 负责把 state 同步过来，三者保持一致。
  useEffect(() => {
    if (previousSequenceSignature.current !== sequenceSignature) {
      previousSequenceSignature.current = sequenceSignature;
      setStreamingIndex(0);
    }
  }, [sequenceSignature]);

  useEffect(() => {
    if (enabled && !previousEnabled.current) {
      setStreamingIndex(0);
    }
    previousEnabled.current = enabled;
  }, [enabled]);

  // 完成回调。callbackSignature 校验用于丢弃上一轮序列迟到的 onFinish，
  // 防止旧动画误推进新一轮；index 须等于当前值，忽略重复/乱序回调。
  const finishRef = useRef<(index: number, signature: string) => void>(() => undefined);
  const finish = useCallback(
    (index: number, signature: string) => {
      if (!enabled || signature !== callbackSignature) return;

      setStreamingIndex((currentIndex) => {
        if (index !== currentIndex) return currentIndex;
        return Math.min(currentIndex + 1, itemCount);
      });
    },
    [callbackSignature, enabled, itemCount]
  );
  finishRef.current = finish;

  // 每条一个稳定回调（绑定各自下标），经 finishRef 读取最新的 finish 闭包，
  // 这样只在序列变化时重建，避免动画组件因 props 频繁变化而重启动画。
  const finishCallbacks = useMemo(
    () =>
      items.map((_, index) => () => {
        finishRef.current(index, callbackSignature);
      }),
    [callbackSignature, itemCount]
  );

  // 当前条一出现就开始播动画，因此可见数 = streamingIndex + 1（封顶 itemCount）。
  const visibleCount = enabled ? Math.min(effectiveStreamingIndex + 1, itemCount) : itemCount;
  const visibleItems = useMemo(
    () =>
      items.slice(0, visibleCount).map((item, index) => ({
        ...item,
        index,
        onFinish: finishCallbacks[index]
      })),
    [items, visibleCount, finishCallbacks]
  );

  // 未启用流式、空列表或索引越界，均视为播放完毕。
  const isComplete = !enabled || itemCount === 0 || effectiveStreamingIndex >= itemCount;

  return {
    visibleItems,
    streamingIndex: enabled ? effectiveStreamingIndex : itemCount,
    isStreaming: enabled && !isComplete,
    isComplete
  };
};
