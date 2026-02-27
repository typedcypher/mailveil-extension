// Configuration module for MailVeil extension
// Centralizes URL/environment handling (DRY principle)

const PRODUCTION_BASE = 'https://mailveil.io'
const DEVELOPMENT_BASE = 'http://localhost:3000'

/**
 * Get the current development mode setting
 * @returns {Promise<boolean>}
 */
export async function isDevMode() {
  const stored = await chrome.storage.local.get(['devMode'])
  return Boolean(stored.devMode)
}

/**
 * Set development mode
 * @param {boolean} enabled
 */
export async function setDevMode(enabled) {
  await chrome.storage.local.set({ devMode: enabled })
}

/**
 * Get the base URL for the current environment
 * @returns {Promise<string>}
 */
export async function getBaseUrl() {
  const devMode = await isDevMode()
  return devMode ? DEVELOPMENT_BASE : PRODUCTION_BASE
}

/**
 * Get a full URL for a given path
 * @param {string} path - Path starting with /
 * @returns {Promise<string>}
 */
export async function getUrl(path) {
  const base = await getBaseUrl()
  return `${base}${path}`
}

/**
 * Get the API base URL
 * @returns {Promise<string>}
 */
export async function getApiUrl(endpoint = '') {
  const base = await getBaseUrl()
  return `${base}/api${endpoint}`
}

// For synchronous access (legacy support) - updated via updateSyncConfig()
export const syncConfig = {
  baseUrl: PRODUCTION_BASE,
  apiBase: `${PRODUCTION_BASE}/api`
}

/**
 * Update synchronous config from storage
 * Call this on extension load
 */
export async function updateSyncConfig() {
  const devMode = await isDevMode()
  const base = devMode ? DEVELOPMENT_BASE : PRODUCTION_BASE
  syncConfig.baseUrl = base
  syncConfig.apiBase = `${base}/api`
}
