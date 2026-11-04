export function cleanText(text: string): string {
  return text
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
