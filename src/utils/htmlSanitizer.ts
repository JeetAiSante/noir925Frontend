/**
 * HTML Sanitization Utilities
 * Prevents XSS attacks by escaping user-controlled content before rendering in HTML
 */

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Use this function for all user-controlled data that will be rendered in HTML
 */
export const escapeHtml = (text: string | null | undefined): string => {
  if (text == null) return '';
  
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return String(text).replace(/[&<>"'`=/]/g, (char) => map[char]);
};

/**
 * Escapes HTML and preserves line breaks (for multi-line text)
 */
export const escapeHtmlWithLineBreaks = (text: string | null | undefined): string => {
  if (text == null) return '';
  return escapeHtml(text).replace(/\n/g, '<br />');
};

/**
 * Validates and sanitizes a URL, returning a safe URL or empty string
 * Only allows http, https, and mailto protocols
 */
export const sanitizeUrl = (url: string | null | undefined): string => {
  if (url == null || url.trim() === '') return '';
  
  try {
    const parsed = new URL(url);
    if (['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      return url;
    }
    return '';
  } catch {
    // If it's not a valid URL, escape it to prevent injection
    return '';
  }
};

/**
 * Validates that an email address has a valid format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitizes text for use as an HTML attribute value
 */
export const escapeAttribute = (value: string | null | undefined): string => {
  if (value == null) return '';
  return escapeHtml(value).replace(/"/g, '&quot;');
};
