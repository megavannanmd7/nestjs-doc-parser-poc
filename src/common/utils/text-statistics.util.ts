export interface TextStatistics {
  characters: number;
  words: number;
  lines: number;
  paragraphs: number;
  emptyLines: number;
}

export function countCharacters(text: string): number {
  return text.length;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter((word) => word.length > 0).length;
}

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

export function countParagraphs(text: string): number {
  if (!text.trim()) return 0;
  return text
    .split(/\n\s*\n/)
    .filter((paragraph) => paragraph.trim().length > 0).length;
}

export function countEmptyLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').filter((line) => line.trim().length === 0).length;
}

export function getTextStatistics(text: string): TextStatistics {
  return {
    characters: countCharacters(text),
    words: countWords(text),
    lines: countLines(text),
    paragraphs: countParagraphs(text),
    emptyLines: countEmptyLines(text),
  };
}
