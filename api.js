// API module for MailVeil extension
// Handles all API communication (Separation of Concerns)

import { getApiUrl } from './config.js'

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint (e.g., '/aliases')
 * @param {string} token - Auth token
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiRequest(endpoint, token, options = {}) {
  const url = await getApiUrl(endpoint)
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  }
  
  if (options.body && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }
  
  return fetch(url, { ...options, headers })
}

/**
 * Fetch the current user's plan info
 * @param {string} token
 * @returns {Promise<{plan: string, npub: string} | null>}
 */
export async function fetchUserPlan(token) {
  const response = await apiRequest('/auth/me', token)
  
  if (!response.ok) {
    if (response.status === 401) {
      return null // Session expired
    }
    throw new Error(`Failed to fetch user plan: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Fetch verified destination emails
 * @param {string} token
 * @returns {Promise<Array<{id: string, email: string, verified: boolean}> | null>}
 */
export async function fetchDestinationEmails(token) {
  const response = await apiRequest('/destination-emails', token)
  
  if (!response.ok) {
    if (response.status === 401) {
      return null // Session expired
    }
    throw new Error(`Failed to fetch emails: ${response.status}`)
  }
  
  const data = await response.json()
  return data.destinationEmails.filter(email => email.verified)
}

/**
 * Fetch user's aliases
 * @param {string} token
 * @param {number} limit - Max aliases to return
 * @returns {Promise<Array<{alias: string, domain: string, label?: string}> | null>}
 */
export async function fetchAliases(token, limit = 5) {
  const response = await apiRequest('/aliases', token)
  
  if (!response.ok) {
    if (response.status === 401) {
      return null // Session expired
    }
    throw new Error(`Failed to fetch aliases: ${response.status}`)
  }
  
  const data = await response.json()
  return data.aliases.slice(0, limit)
}

/**
 * Create a new alias
 * @param {string} token
 * @param {Object} params
 * @param {string} params.destination - Destination email
 * @param {string} [params.label] - Optional label
 * @param {string} [params.alias] - Optional custom alias (Pro only)
 * @returns {Promise<{alias: string, domain: string}>}
 */
export async function createAlias(token, { destination, label, alias }) {
  const body = { destination }
  
  if (label?.trim()) {
    body.label = label.trim()
  }
  
  if (alias?.trim()) {
    body.alias = alias.trim()
  }
  
  const response = await apiRequest('/aliases', token, {
    method: 'POST',
    body
  })
  
  if (!response.ok) {
    const data = await response.json()
    throw new Error(data.error || 'Failed to create alias')
  }
  
  const data = await response.json()
  return data.alias
}

/**
 * Logout the user
 * @param {string} token
 */
export async function logout(token) {
  try {
    await apiRequest('/auth/logout', token, { method: 'POST' })
  } catch (error) {
    // Ignore logout errors - we're clearing local state anyway
    console.warn('Logout request failed:', error.message)
  }
}
