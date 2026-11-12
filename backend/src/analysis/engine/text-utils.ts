/** Collapses line breaks and repeated whitespace into single spaces. */
export function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanText(text: string): string {
  return normalizeWhitespace(text).toLowerCase();
}
