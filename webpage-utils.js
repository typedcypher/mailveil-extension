// Utility functions for extracting webpage information

/**
 * Extract a meaningful site name from page title
 * Removes common suffixes and cleans up the title
 * @param {string} title - The page title
 * @returns {string} - Cleaned site name
 */
export function extractSiteNameFromTitle(title) {
  if (!title || typeof title !== 'string') {
    return ''
  }

  const commonPageWords = /^(page|home|welcome|login|sign in|dashboard|account)$/i
  const separators = [' - ', ' | ', ' :: ', ' — ', ' – ', ': ', ' / ']
  let cleanTitle = title.trim()

  // Strip notification count prefixes like "(3) "
  cleanTitle = cleanTitle.replace(/^\(\d+\)\s*/, '')

  for (const separator of separators) {
    const index = cleanTitle.lastIndexOf(separator)
    if (index !== -1) {
      const afterSeparator = cleanTitle.substring(index + separator.length).trim()
      const beforeSeparator = cleanTitle.substring(0, index).trim()

      if (afterSeparator.length > 0 && commonPageWords.test(afterSeparator)) {
        cleanTitle = beforeSeparator
      } else if (beforeSeparator.length > 0 && commonPageWords.test(beforeSeparator)) {
        cleanTitle = afterSeparator
      } else if (afterSeparator.length > 0 && afterSeparator.length < beforeSeparator.length) {
        cleanTitle = afterSeparator
      } else if (beforeSeparator.length > 0 && beforeSeparator.length < afterSeparator.length) {
        cleanTitle = beforeSeparator
      } else if (afterSeparator.length > 0) {
        cleanTitle = afterSeparator
      } else {
        cleanTitle = beforeSeparator
      }
      break
    }
  }

  // Remove common prefixes/suffixes
  cleanTitle = cleanTitle
    .replace(/^(Welcome to |Sign in to |Login to |Home - |Dashboard - )/i, '')
    .replace(/ - (Home|Login|Sign in|Dashboard|Account)$/i, '')

  // If the result is just a common page word, it's not useful
  if (commonPageWords.test(cleanTitle)) {
    return ''
  }

  // Limit length and clean up
  return cleanTitle.length > 30 ? cleanTitle.substring(0, 30).trim() : cleanTitle
}

/**
 * Extract site name from domain
 * Removes www, subdomains, and TLD to get the main domain name
 * @param {string} hostname - The hostname/domain
 * @returns {string} - Extracted site name
 */
export function extractSiteNameFromDomain(hostname) {
  if (!hostname || typeof hostname !== 'string') {
    return ''
  }

  // Remove protocol if present
  let domain = hostname.replace(/^https?:\/\//, '')

  // Remove www. prefix
  domain = domain.replace(/^www\./, '')

  // Split by dots and handle different cases
  const parts = domain.split('.')
  
  if (parts.length === 1) {
    // Just domain name (like localhost)
    return parts[0]
  }

  if (parts.length === 2) {
    // Simple domain.tld
    return parts[0]
  }

  // For complex domains, try to get the main name
  // Handle cases like subdomain.domain.tld or domain.co.uk
  if (parts.length >= 3) {
    // Check if it's a known multi-part TLD
    const multiPartTlds = ['co.uk', 'com.au', 'co.jp', 'co.in', 'com.br']
    const lastTwoParts = parts.slice(-2).join('.')
    
    if (multiPartTlds.includes(lastTwoParts)) {
      // Take the part before the multi-part TLD
      return parts[parts.length - 3]
    } else {
      // Take the second-to-last part (before .tld)
      return parts[parts.length - 2]
    }
  }

  return domain
}

/**
 * Get a clean domain label from hostname
 * Strips www. prefix and port numbers, preserves other subdomains
 * @param {string} hostname - The hostname/domain
 * @returns {string} - Clean domain for use as label
 */
export function getDomainLabel(hostname) {
  if (!hostname || typeof hostname !== 'string') {
    return ''
  }

  let domain = hostname.trim()

  // Remove protocol if present
  domain = domain.replace(/^https?:\/\//, '')

  // Remove www. prefix
  domain = domain.replace(/^www\./, '')

  // Remove port numbers
  domain = domain.replace(/:\d+$/, '')

  // Remove trailing slashes and paths
  domain = domain.split('/')[0]

  // Truncate very long domains (50 chars max)
  if (domain.length > 50) {
    domain = domain.substring(0, 50)
  }

  return domain
}

/**
 * Get a suggested label for the current webpage
 * Uses domain as primary label (not page title)
 * @param {string} title - Page title (unused but kept for API compatibility)
 * @param {string} hostname - Page hostname
 * @returns {string} - Suggested label (domain)
 */
export function getSuggestedLabel(title, hostname) {
  // Domain is the primary label source
  const domainLabel = getDomainLabel(hostname)
  
  if (domainLabel && domainLabel.length > 0) {
    return domainLabel
  }

  return ''
}

/**
 * Get current tab information using Chrome APIs
 * @returns {Promise<{title: string, hostname: string}>}
 */
export async function getCurrentTabInfo() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tabs.length > 0) {
      const tab = tabs[0]
      const url = new URL(tab.url)
      return {
        title: tab.title || '',
        hostname: url.hostname || ''
      }
    }
  } catch (error) {
    console.error('Failed to get current tab info:', error)
  }
  
  return { title: '', hostname: '' }
}