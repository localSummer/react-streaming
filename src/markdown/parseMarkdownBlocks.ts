// 把 Markdown 切成顶层块，供流式时只重绘最后一块。
// 围栏内不按空行切开，避免半截 code fence 被拆碎。

const OPEN_FENCE = /^( {0,3})(`{3,}|~{3,})/;
const CLOSE_FENCE = /^( {0,3})(`{3,}|~{3,})\s*$/;

const toFenceMarker = (token: string) => ({
  char: token[0],
  length: token.length
});

export const parseMarkdownBlocks = (markdown: string): string[] => {
  if (!markdown) return [];

  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let fence: { char: string; length: number } | null = null;

  const flush = () => {
    if (current.length === 0) return;
    blocks.push(current.join('\n'));
    current = [];
  };

  for (const line of lines) {
    if (fence) {
      current.push(line);
      const closer = line.match(CLOSE_FENCE);
      if (
        closer &&
        closer[2][0] === fence.char &&
        closer[2].length >= fence.length
      ) {
        fence = null;
        flush();
      }
      continue;
    }

    const opener = line.match(OPEN_FENCE);
    if (opener) {
      flush();
      current.push(line);
      fence = toFenceMarker(opener[2]);
      continue;
    }

    if (line.trim() === '') {
      flush();
      continue;
    }

    current.push(line);
  }

  flush();
  return blocks;
};
