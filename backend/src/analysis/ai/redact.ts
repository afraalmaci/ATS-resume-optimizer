const EMAIL = /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu;

// Links with a scheme or "www.", and profile URLs written without one.
// Bare dotted words are left alone so "Node.js" and "ASP.NET" survive.
const LINK =
  /\b(?:https?:\/\/|www\.)\S+|\b(?:linkedin\.com|github\.com|gitlab\.com|behance\.net)\/\S*/giu;

// A run of digits with optional +, spaces, dots, dashes or brackets.
const PHONE_CANDIDATE = /(?:\+|\(\s*)?\d[\d\s().-]{6,}\d/g;
const MIN_PHONE_DIGITS = 9;

/**
 * Removes email addresses, phone numbers and links from resume text before it
 * is sent to an external AI service. Skills do not need them.
 */
export function redactContactDetails(text: string): string {
  return text
    .replace(EMAIL, '[email]')
    .replace(LINK, (match) => {
      // Keep trailing punctuation that belongs to the sentence.
      const trailing = /[.,;:)]+$/.exec(match)?.[0] ?? '';
      return `[link]${trailing}`;
    })
    .replace(PHONE_CANDIDATE, (match) => {
      const digits = match.replace(/\D/g, '').length;
      return digits >= MIN_PHONE_DIGITS ? '[phone]' : match;
    });
}
