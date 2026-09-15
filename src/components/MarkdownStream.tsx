import React, { memo, useMemo } from 'react';
import remend from 'remend';
import { parseMarkdownBlocks } from '../markdown/parseMarkdownBlocks';

export interface MarkdownBlockMeta {
  index: number;
  isLast: boolean;
}

export interface MarkdownStreamProps {
  markdown: string;
  render: (block: string, meta: MarkdownBlockMeta) => React.ReactNode;
}

interface MarkdownBlockViewProps {
  markdown: string;
  meta: MarkdownBlockMeta;
  render: MarkdownStreamProps['render'];
}

const MarkdownBlockView = memo(
  ({ markdown, meta, render }: MarkdownBlockViewProps) => (
    <>{render(markdown, meta)}</>
  ),
  (previous, next) =>
    previous.markdown === next.markdown &&
    previous.meta.index === next.meta.index &&
    previous.meta.isLast === next.meta.isLast
);

MarkdownBlockView.displayName = 'MarkdownBlockView';

// remend 修残后按块 memo。样式由 render 负责。
export const MarkdownStream: React.FC<MarkdownStreamProps> = ({
  markdown,
  render
}) => {
  const blocks = useMemo(
    () => parseMarkdownBlocks(remend(markdown)),
    [markdown]
  );
  const lastIndex = blocks.length - 1;

  return (
    <>
      {blocks.map((block, index) => (
        <MarkdownBlockView
          key={index}
          markdown={block}
          meta={{ index, isLast: index === lastIndex }}
          render={render}
        />
      ))}
    </>
  );
};
