// lib/security/sanitization.ts
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Initialize DOMPurify for server-side
const window = new JSDOM("").window;
const purify = DOMPurify(window);

/**
 * Sanitize HTML content (for user-generated content)
 */
export function sanitizeHTML(html: string): string {
  if (!html) return "";
  
  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "strike", "blockquote",
      "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
      "a", "img", "code", "pre", "span", "div"
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "target", "rel", "class", "id"
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
    FORBID_ATTR: ["onclick", "onerror", "onload", "onmouseover", "onfocus"],
  });
}

/**
 * Sanitize text content (strip all HTML)
 */
export function sanitizeText(text: string): string {
  if (!text) return "";
  
  // Remove all HTML tags
  const stripped = text.replace(/<[^>]*>/g, "");
  
  // Decode HTML entities
  const decoded = stripped
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Remove potential script injections
  return decoded.replace(/javascript:/gi, "").replace(/vbscript:/gi, "");
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;
  
  try {
    const parsed = new URL(url);
    
    // Only allow http, https, mailto
    const allowedProtocols = ["http:", "https:", "mailto:"];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize user input for database storage
 */
export function sanitizeInput(input: string, options?: {
  maxLength?: number;
  allowHTML?: boolean;
  trim?: boolean;
}): string {
  if (!input) return "";
  
  let sanitized = input;
  
  // Trim whitespace
  if (options?.trim !== false) {
    sanitized = sanitized.trim();
  }
  
  // Enforce max length
  if (options?.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.slice(0, options.maxLength);
  }
  
  // Sanitize based on type
  if (options?.allowHTML) {
    sanitized = sanitizeHTML(sanitized);
  } else {
    sanitized = sanitizeText(sanitized);
  }
  
  return sanitized;
}

/**
 * Sanitize object with multiple fields
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, { allowHTML?: boolean; maxLength?: number }>
): T {
  const sanitized = { ...obj };
  
  for (const [key, config] of Object.entries(schema)) {
    if (obj[key] && typeof obj[key] === "string") {
      sanitized[key as keyof T] = sanitizeInput(obj[key], config) as T[keyof T];
    }
  }
  
  return sanitized;
}

/**
 * React component for safe HTML rendering
 */
export function SafeHTML({ html, className }: { html: string; className?: string }) {
  const sanitized = sanitizeHTML(html);
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string | null {
  if (!email) return null;
  
  const trimmed = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return null;
  }
  
  return trimmed;
}

/**
 * Sanitize file name (prevent path traversal)
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path components
  const sanitized = fileName.replace(/[/\\?%*:|"<>]/g, "-");
  
  // Limit length
  return sanitized.slice(0, 255);
}