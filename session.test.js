/**
 * Session module tests
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
  }),
  remove: vi.fn(async (keys) => {
    if (Array.isArray(keys)) {
      keys.forEach(key => delete mockStorage.data[key])
    }
  })
}

global.chrome = {
  storage: {
    local: mockStorage
  }
}

// Import after mocking
import { getSession, saveSession, clearSession, isAuthenticated } from './session.js'

describe('Session module', () => {
  beforeEach(() => {
    mockStorage.data = {}
    vi.clearAllMocks()
  })

  describe('getSession', () => {
    it('returns null when no session stored', async () => {
      const session = await getSession()
      expect(session).toBeNull()
    })

    it('returns stored session', async () => {
      const storedSession = { token: 'abc123', npub: 'npub1test', pubkey: 'deadbeef' }
      mockStorage.data.session = storedSession

      const session = await getSession()
      
      expect(session).toEqual(storedSession)
    })
  })

  describe('saveSession', () => {
    it('saves valid session to storage', async () => {
      const session = { token: 'abc123', npub: 'npub1test', pubkey: 'deadbeef' }
      
      await saveSession(session)
      
      expect(mockStorage.set).toHaveBeenCalledWith({ session })
      expect(mockStorage.data.session).toEqual(session)
    })

    it('throws error for session without token', async () => {
      const invalidSession = { npub: 'npub1test' }
      
      await expect(saveSession(invalidSession)).rejects.toThrow('Invalid session: missing token or npub')
    })

    it('throws error for session without npub', async () => {
      const invalidSession = { token: 'abc123' }
      
      await expect(saveSession(invalidSession)).rejects.toThrow('Invalid session: missing token or npub')
    })

    it('throws error for null session', async () => {
      await expect(saveSession(null)).rejects.toThrow('Invalid session: missing token or npub')
    })

    it('throws error for undefined session', async () => {
      await expect(saveSession(undefined)).rejects.toThrow('Invalid session: missing token or npub')
    })
  })

  describe('clearSession', () => {
    it('removes session from storage', async () => {
      mockStorage.data.session = { token: 'abc', npub: 'npub1' }
      
      await clearSession()
      
      expect(mockStorage.remove).toHaveBeenCalledWith(['session'])
      expect(mockStorage.data.session).toBeUndefined()
    })
  })

  describe('isAuthenticated', () => {
    it('returns false when no session', async () => {
      const result = await isAuthenticated()
      expect(result).toBe(false)
    })

    it('returns true when session has token', async () => {
      mockStorage.data.session = { token: 'abc123', npub: 'npub1test' }
      
      const result = await isAuthenticated()
      
      expect(result).toBe(true)
    })

    it('returns false when session has empty token', async () => {
      mockStorage.data.session = { token: '', npub: 'npub1test' }
      
      const result = await isAuthenticated()
      
      expect(result).toBe(false)
    })
  })
})
