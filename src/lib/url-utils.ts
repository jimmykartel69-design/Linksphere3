/**
 * LinkSphere - URL Validation and Sanitization
 * Security utilities for handling user-submitted URLs
 */

import { z } from 'zod'
import { MAX_URL_LENGTH } from './constants'

/**
 * Blocked URL patterns (phishing, malware, etc.)
 * In production, this should be managed via database or external service
 */
const BLOCKED_PATTERNS = [
  // Malware/Phishing patterns
  /\.ru$/i,
  /\.tk$/i,
  /\.ml$/i,
  /\.ga$/i,
  /\.cf$/i,
  // Adult content (basic patterns)
  /porn/i,
  /xxx/i,
  /adult/i,
  /nsfw/i,
  // Gambling (basic patterns)
  /casino/i,
  /gambl/i,
  /betting/i,
  /poker/i,
  // Known malicious patterns
  /bit\.ly$/i,
  /tinyurl$/i,
]

/**
 * Blocked TLDs that are commonly used for spam
 */
const BLOCKED_TLDS = [
  '.xyz',
  '.top',
  '.loan',
  '.win',
  '.click',
  '.link',
  '.work',
  '.gq',
]

/**
 * URL validation schema using Zod
 */
export const urlSchema = z
  .string()
  .max(MAX_URL_LENGTH, `URL must be less than ${MAX_URL_LENGTH} characters`)
  .url('Must be a valid URL')
  .refine(
    (url) => url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  )
  .refine(
    (url) => !BLOCKED_PATTERNS.some(pattern => pattern.test(url)),
    'This URL pattern is not allowed'
  )
  .refine(
    (url) => !BLOCKED_TLDS.some(tld => url.toLowerCase().endsWith(tld)),
    'This domain extension is not allowed'
  )

/**
 * Optional URL schema (can be empty or valid)
 */
export const optionalUrlSchema = z
  .string()
  .max(MAX_URL_LENGTH)
  .optional()
  .or(z.literal(''))
  .refine(
    (url) => !url || url.startsWith('http://') || url.startsWith('https://'),
    'URL must start with http:// or https://'
  )

/**
 * Validate a URL and return result
 */
export function validateUrl(url: string): {
  valid: boolean
  error?: string
  sanitized?: string
} {
  try {
    const result = urlSchema.safeParse(url)
    
    if (!result.success) {
      return {
        valid: false,
        error: result.error.issues[0]?.message || 'Invalid URL',
      }
    }
    
    return {
      valid: true,
      sanitized: sanitizeUrl(url),
    }
  } catch {
    return {
      valid: false,
      error: 'URL validation failed',
    }
  }
}

/**
 * Sanitize URL by removing dangerous components
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    
    // Remove any credentials from URL
    parsed.username = ''
    parsed.password = ''
    
    // Remove tracking parameters (basic)
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'ref', 'referrer',
    ]
    
    trackingParams.forEach(param => {
      parsed.searchParams.delete(param)
    })
    
    return parsed.toString()
  } catch {
    return url
  }
}

/**
 * Check if URL is from an allowed domain
 * Useful for restricting uploads, etc.
 */
export function isAllowedDomain(url: string, allowedDomains: string[]): boolean {
  try {
    const parsed = new URL(url)
    return allowedDomains.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    )
  } catch {
    return false
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url)
    return parsed.hostname
  } catch {
    return null
  }
}

/**
 * Check if URL appears to be a legitimate business website
 * Basic heuristics - not foolproof
 */
export function appearsLegitimate(url: string): boolean {
  try {
    const parsed = new URL(url)
    
    // Check for SSL
    if (parsed.protocol !== 'https:') {
      return false
    }
    
    // Check for suspicious patterns in hostname
    const suspiciousPatterns = [
      /\d{5,}/, // Long number sequences
      /-+/,     // Multiple dashes
      /.{30,}/, // Very long domain names
    ]
    
    if (suspiciousPatterns.some(p => p.test(parsed.hostname))) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Generate a safe display URL (truncate, remove protocol)
 */
export function getDisplayUrl(url: string, maxLength: number = 50): string {
  try {
    const parsed = new URL(url)
    let display = parsed.hostname + parsed.pathname
    
    // Remove www prefix
    if (display.startsWith('www.')) {
      display = display.slice(4)
    }
    
    // Truncate if too long
    if (display.length > maxLength) {
      display = display.slice(0, maxLength - 3) + '...'
    }
    
    return display
  } catch {
    return url.slice(0, maxLength)
  }
}

/**
 * Check if URL is likely an image
 */
export function isImageUrl(url: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']
  const lowerUrl = url.toLowerCase()
  
  return imageExtensions.some(ext => lowerUrl.endsWith(ext)) ||
    lowerUrl.includes('image') ||
    lowerUrl.includes('img')
}

/**
 * Security headers to check for outbound links
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  }
}
