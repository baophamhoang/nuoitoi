/**
 * Strip HTML tags and trim input to prevent stored XSS.
 * React already escapes text on render, so we only need to prevent
 * HTML tags from being stored in the database.
 */
export function sanitizeInput(input: string, maxLength = 500): string {
  return input
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, maxLength);
}
