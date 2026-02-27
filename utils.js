// Utility functions for MailVeil extension

/**
 * Sanitize custom alias input
 * Only allows lowercase letters, numbers, and hyphens
 * @param {string} input
 * @returns {string}
 */
export function sanitizeAliasInput(input) {
  if (!input || typeof input !== 'string') {
    return ''
  }
  return input.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

/**
 * Truncate npub for display
 * Shows first 12 and last 8 characters
 * @param {string} npub
 * @returns {string}
 */
export function truncateNpub(npub) {
  if (!npub || typeof npub !== 'string') {
    return ''
  }
  if (npub.length <= 23) {
    return npub
  }
  return `${npub.slice(0, 12)}...${npub.slice(-8)}`
}

/**
 * Format alias for display
 * @param {string} alias
 * @param {string} domain
 * @returns {string}
 */
export function formatAliasEmail(alias, domain) {
  return `${alias}@${domain}`
}

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') {
    return false
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Show temporary feedback on a button (e.g., copy confirmation)
 * @param {HTMLElement} button
 * @param {string} tempText
 * @param {string} originalText
 * @param {number} duration - Duration in ms
 */
export function showButtonFeedback(button, tempText, originalText, duration = 2000) {
  button.textContent = tempText
  setTimeout(() => {
    button.textContent = originalText
  }, duration)
}

/**
 * Copy text to clipboard and show feedback
 * @param {string} text
 * @param {HTMLElement} button
 */
export async function copyToClipboard(text, button) {
  await navigator.clipboard.writeText(text)
  showButtonFeedback(button, '✓', '📋')
}
