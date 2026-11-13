/**
 * Collapses line breaks and repeated whitespace into single spaces. Also
 * joins letters some PDFs split in two ("u" + "¨" becomes "ü").
 */
export function normalizeWhitespace(text: string): string {
  return text
    .normalize('NFC')
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Lowercases for matching. The Turkish capital "İ" becomes a plain "i": the
 * default lowercasing turns it into two characters ("i" + a combining dot),
 * so "SÜREKLİ" would not match "sürekli". Keeps the length the same.
 */
export function toMatchCase(text: string): string {
  return text.replace(/İ/g, 'i').toLowerCase();
}

export function cleanText(text: string): string {
  return toMatchCase(normalizeWhitespace(text));
}
