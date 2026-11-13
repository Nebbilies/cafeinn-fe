const graphemes = new Intl.Segmenter('vi', { granularity: 'grapheme' });

export function getAccountInitial(displayName: string): string {
  const first = graphemes.segment(displayName.trim())[Symbol.iterator]().next().value;
  return first?.segment.toLocaleUpperCase('vi') ?? '';
}
