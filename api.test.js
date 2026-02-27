/**
 * API module tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Chrome storage API
const mockStorage = {
  data: {},
  get: vi.fn(async (keys) => {
    if (Array.isArray(keys)) {
      return keys.reduce((acc, key) => {
        if (mockStorage.data[key] !== undefined) {
          acc[key] = mockStorage.data[key]
        }
        return acc
      }, {})
    }
    return {}
  }),
  set: vi.fn(async (items) => {
    Object.assign(mockStorage.data, items)
  })
}

global.chrome = {
  storage: {
    local: mockStorage
  }
}

// Mock fetch
global.fetch = vi.fn()

// Import after mocking
import { apiRequest, fetchUserPlan, fetchDestinationEmails, fetchAliases, createAlias, logout } from './api.js'

describe('API module', () => {
  const mockToken = 'test-token-123'

  beforeEach(() => {
    mockStorage.data = { devMode: false }
    vi.clearAllMocks()
  })

  describe('apiRequest', () => {
    it('adds authorization header', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })

      await apiRequest('/test', mockToken)

      expect(fetch).toHaveBeenCalledWith(
        'https://mailveil.io/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123'
          })
        })
      )
    })

    it('stringifies body and sets content-type for objects', async () => {
      fetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) })

      await apiRequest('/test', mockToken, {
        method: 'POST',
        body: { foo: 'bar' }
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: '{"foo":"bar"}'
        })
      )
    })
  })

  describe('fetchUserPlan', () => {
    it('returns user data on success', async () => {
      const userData = { plan: 'pro', npub: 'npub1test' }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(userData)
      })

      const result = await fetchUserPlan(mockToken)

      expect(result).toEqual(userData)
    })

    it('returns null on 401 unauthorized', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      const result = await fetchUserPlan(mockToken)

      expect(result).toBeNull()
    })

    it('throws error on other failures', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      })

      await expect(fetchUserPlan(mockToken)).rejects.toThrow('Failed to fetch user plan: 500')
    })
  })

  describe('fetchDestinationEmails', () => {
    it('returns only verified emails', async () => {
      const emails = {
        destinationEmails: [
          { id: '1', email: 'verified@example.com', verified: true },
          { id: '2', email: 'unverified@example.com', verified: false },
          { id: '3', email: 'also-verified@example.com', verified: true }
        ]
      }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(emails)
      })

      const result = await fetchDestinationEmails(mockToken)

      expect(result).toHaveLength(2)
      expect(result.every(e => e.verified)).toBe(true)
    })

    it('returns null on 401', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      const result = await fetchDestinationEmails(mockToken)

      expect(result).toBeNull()
    })
  })

  describe('fetchAliases', () => {
    it('returns aliases limited to specified count', async () => {
      const aliases = {
        aliases: [
          { alias: 'a1', domain: 'mailveil.io' },
          { alias: 'a2', domain: 'mailveil.io' },
          { alias: 'a3', domain: 'mailveil.io' },
          { alias: 'a4', domain: 'mailveil.io' },
          { alias: 'a5', domain: 'mailveil.io' },
          { alias: 'a6', domain: 'mailveil.io' }
        ]
      }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(aliases)
      })

      const result = await fetchAliases(mockToken, 3)

      expect(result).toHaveLength(3)
    })

    it('defaults to limit of 5', async () => {
      const aliases = {
        aliases: Array(10).fill({ alias: 'x', domain: 'mailveil.io' })
      }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(aliases)
      })

      const result = await fetchAliases(mockToken)

      expect(result).toHaveLength(5)
    })

    it('returns null on 401', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      })

      const result = await fetchAliases(mockToken)

      expect(result).toBeNull()
    })
  })

  describe('createAlias', () => {
    it('creates alias with destination only', async () => {
      const createdAlias = { alias: 'swift-fox-42', domain: 'mailveil.io' }
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ alias: createdAlias })
      })

      const result = await createAlias(mockToken, { destination: 'user@example.com' })

      expect(result).toEqual(createdAlias)
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: '{"destination":"user@example.com"}'
        })
      )
    })

    it('includes label when provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ alias: { alias: 'test', domain: 'mailveil.io' } })
      })

      await createAlias(mockToken, {
        destination: 'user@example.com',
        label: 'My Newsletter'
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: '{"destination":"user@example.com","label":"My Newsletter"}'
        })
      )
    })

    it('includes custom alias when provided', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ alias: { alias: 'custom', domain: 'mailveil.io' } })
      })

      await createAlias(mockToken, {
        destination: 'user@example.com',
        alias: 'my-custom-alias'
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: '{"destination":"user@example.com","alias":"my-custom-alias"}'
        })
      )
    })

    it('trims whitespace from label and alias', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ alias: { alias: 'test', domain: 'mailveil.io' } })
      })

      await createAlias(mockToken, {
        destination: 'user@example.com',
        label: '  My Label  ',
        alias: '  my-alias  '
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: '{"destination":"user@example.com","label":"My Label","alias":"my-alias"}'
        })
      )
    })

    it('ignores empty label and alias', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ alias: { alias: 'test', domain: 'mailveil.io' } })
      })

      await createAlias(mockToken, {
        destination: 'user@example.com',
        label: '   ',
        alias: ''
      })

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: '{"destination":"user@example.com"}'
        })
      )
    })

    it('throws error with API error message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Alias already exists' })
      })

      await expect(createAlias(mockToken, { destination: 'user@example.com' }))
        .rejects.toThrow('Alias already exists')
    })

    it('throws generic error when no error message', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({})
      })

      await expect(createAlias(mockToken, { destination: 'user@example.com' }))
        .rejects.toThrow('Failed to create alias')
    })
  })

  describe('logout', () => {
    it('calls logout endpoint', async () => {
      fetch.mockResolvedValueOnce({ ok: true })

      await logout(mockToken)

      expect(fetch).toHaveBeenCalledWith(
        'https://mailveil.io/api/auth/logout',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token-123'
          })
        })
      )
    })

    it('does not throw on network error', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'))

      // Should not throw
      await expect(logout(mockToken)).resolves.toBeUndefined()
    })
  })
})
