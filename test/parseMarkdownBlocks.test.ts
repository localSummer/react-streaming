import { describe, expect, it } from 'vitest';
import { parseMarkdownBlocks } from '../src/markdown/parseMarkdownBlocks';

describe('parseMarkdownBlocks', () => {
  it('returns no blocks for empty input', () => {
    expect(parseMarkdownBlocks('')).toEqual([]);
  });

  it('splits a heading and a following paragraph', () => {
    expect(parseMarkdownBlocks('# Title\n\nBody')).toEqual(['# Title', 'Body']);
  });

  it('splits multiple paragraphs on blank lines', () => {
    expect(parseMarkdownBlocks('# Title\n\nFirst\n\nSecond')).toEqual([
      '# Title',
      'First',
      'Second'
    ]);
  });

  it('keeps fenced code as one block, including inner blank lines', () => {
    const markdown = ['Intro', '', '```js', 'const a = 1;', '', 'const b = 2;', '```', '', 'Outro'].join(
      '\n'
    );

    expect(parseMarkdownBlocks(markdown)).toEqual([
      'Intro',
      '```js\nconst a = 1;\n\nconst b = 2;\n```',
      'Outro'
    ]);
  });

  it('keeps an unterminated fence in the last block', () => {
    expect(parseMarkdownBlocks('```ts\nconst x =')).toEqual(['```ts\nconst x =']);
  });
});
