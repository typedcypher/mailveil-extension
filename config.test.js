/**
 * Config module tests
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

// Import after mocking
import { isDevMode, setDevMode, getBaseUrl, getUrl, getApiUrl, updateSyncConfig, syncConfig } from './config.js'

describe('Config module', () => {
  beforeEach(() => {
    mockStorage.data = {}
    vi.clearAllMocks()
  })

  describe('isDevMode', () => {
    it('returns false when devMode not set', async () => {
      const result = await isDevMode()
      expect(result).toBe(false)
    })

    it('returns false when devMode is false', async () => {
      mockStorage.data.devMode = false
      const result = await isDevMode()
      expect(result).toBe(false)
    })

    it('returns true when devMode is true', async () => {
      mockStorage.data.devMode = true
      const result = await isDevMode()
      expect(result).toBe(true)
    })
  })

  describe('setDevMode', () => {
    it('sets devMode to true', async () => {
      await setDevMode(true)
      expect(mockStorage.set).toHaveBeenCalledWith({ devMode: true })
      expect(mockStorage.data.devMode).toBe(true)
    })

    it('sets devMode to false', async () => {
      await setDevMode(false)
      expect(mockStorage.set).toHaveBeenCalledWith({ devMode: false })
      expect(mockStorage.data.devMode).toBe(false)
    })
  })

  describe('getBaseUrl', () => {
    it('returns production URL when not in dev mode', async () => {
      mockStorage.data.devMode = false
      const url = await getBaseUrl()
      expect(url).toBe('https://mailveil.io')
    })

    it('returns localhost when in dev mode', async () => {
      mockStorage.data.devMode = true
      const url = await getBaseUrl()
      expect(url).toBe('http://localhost:3000')
    })
  })

  describe('getUrl', () => {
    it('builds full URL with path in production', async () => {
      mockStorage.data.devMode = false
      const url = await getUrl('/login')
      expect(url).toBe('https://mailveil.io/login')
    })

    it('builds full URL with path in dev mode', async () => {
      mockStorage.data.devMode = true
      const url = await getUrl('/settings/emails')
      expect(url).toBe('http://localhost:3000/settings/emails')
    })

    it('handles paths with query params', async () => {
      mockStorage.data.devMode = false
      const url = await getUrl('/login?ext=1')
      expect(url).toBe('https://mailveil.io/login?ext=1')
    })
  })

  describe('getApiUrl', () => {
    it('returns API base URL when no endpoint given', async () => {
      mockStorage.data.devMode = false
      const url = await getApiUrl()
      expect(url).toBe('https://mailveil.io/api')
    })

    it('returns full API URL with endpoint', async () => {
      mockStorage.data.devMode = false
      const url = await getApiUrl('/aliases')
      expect(url).toBe('https://mailveil.io/api/aliases')
    })

    it('uses localhost in dev mode', async () => {
      mockStorage.data.devMode = true
      const url = await getApiUrl('/auth/me')
      expect(url).toBe('http://localhost:3000/api/auth/me')
    })
  })

  describe('updateSyncConfig', () => {
    it('updates syncConfig for production', async () => {
      mockStorage.data.devMode = false
      await updateSyncConfig()
      expect(syncConfig.baseUrl).toBe('https://mailveil.io')
      expect(syncConfig.apiBase).toBe('https://mailveil.io/api')
    })

    it('updates syncConfig for development', async () => {
      mockStorage.data.devMode = true
      await updateSyncConfig()
      expect(syncConfig.baseUrl).toBe('http://localhost:3000')
      expect(syncConfig.apiBase).toBe('http://localhost:3000/api')
    })
  })
})
