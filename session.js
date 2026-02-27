// Session management for MailVeil extension

/**
 * @typedef {Object} Session
 * @property {string} token - JWT token
 * @property {string} npub - User's npub
 * @property {string} pubkey - User's public key hex
 */

/**
 * Get the stored session
 * @returns {Promise<Session | null>}
 */
export async function getSession() {
  const stored = await chrome.storage.local.get(['session'])
  return stored.session || null
}

/**
 * Save session to storage
 * @param {Session} session
 */
export async function saveSession(session) {
  if (!session?.token || !session?.npub) {
    throw new Error('Invalid session: missing token or npub')
  }
  await chrome.storage.local.set({ session })
}

/**
 * Clear session from storage
 */
export async function clearSession() {
  await chrome.storage.local.remove(['session'])
}

/**
 * Check if user is authenticated
 * @returns {Promise<boolean>}
 */
export async function isAuthenticated() {
  const session = await getSession()
  return session !== null && Boolean(session.token)
}
