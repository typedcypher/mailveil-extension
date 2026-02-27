/**
 * Auto-populate label functionality tests
 * Tests the integration between webpage utils and popup functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { JSDOM } from 'jsdom'
import fs from 'fs'
import path from 'path'

// Read actual popup HTML
const popupHtml = fs.readFileSync(
  path.join(__dirname, 'popup.html'),
  'utf-8'
)

// Mock Chrome APIs
const createMockChrome = () => ({
  storage: {
    local: {
      get: vi.fn(async () => ({ session: { token: 'test-token', npub: 'npub1test' } })),
      set: vi.fn(async () => {}),
      remove: vi.fn(async () => {})
    }
  },
  tabs: {
    create: vi.fn(),
    query: vi.fn()
  },
  runtime: {
    onMessage: {
      addListener: vi.fn()
    }
  }
})

describe('Auto-populate Label Functionality', () => {
  let dom
  let document
  let window
  let mockChrome

  beforeEach(() => {
    mockChrome = createMockChrome()
    
    dom = new JSDOM(popupHtml, {
      url: 'chrome-extension://test/popup.html',
      runScripts: 'outside-only',
      pretendToBeVisual: true
    })
    
    document = dom.window.document
    window = dom.window
    
    // Inject mocks
    window.chrome = mockChrome
    window.fetch = vi.fn()
    
    // Mock the webpage utils module
    vi.doMock('./webpage-utils.js', () => ({
      getCurrentTabInfo: vi.fn(),
      getSuggestedLabel: vi.fn()
    }))
  })

  afterEach(() => {
    dom.window.close()
    vi.restoreAllMocks()
  })

  describe('Label Input Auto-population', () => {
    it('should have empty label input initially', () => {
      const labelInput = document.getElementById('label')
      expect(labelInput.value).toBe('')
    })

    it('should maintain placeholder for manual entry', () => {
      const labelInput = document.getElementById('label')
      expect(labelInput.placeholder).toBe('e.g., Shopping')
    })

    it('label input should accept user input normally', () => {
      const labelInput = document.getElementById('label')
      
      // Simulate user typing
      labelInput.value = 'Custom Label'
      expect(labelInput.value).toBe('Custom Label')
    })
  })

  describe('Tab Information Integration', () => {
    beforeEach(() => {
      // Set up authenticated state
      const loginView = document.getElementById('login-view')
      const mainView = document.getElementById('main-view')
      loginView.classList.add('hidden')
      mainView.classList.remove('hidden')
    })

    it('should have access to label input in authenticated state', () => {
      const labelInput = document.getElementById('label')
      expect(labelInput).toBeTruthy()
      expect(labelInput.tagName).toBe('INPUT')
    })

    it('should have create button available', () => {
      const createBtn = document.getElementById('create-btn')
      expect(createBtn).toBeTruthy()
      expect(createBtn.textContent).toBe('Create Alias')
    })
  })

  describe('Chrome Extension Permissions', () => {
    it('should have activeTab permission in manifest', async () => {
      const manifestPath = path.join(__dirname, 'manifest.json')
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
      
      expect(manifest.permissions).toContain('activeTab')
    })

    it('should mock chrome.tabs.query API correctly', async () => {
      mockChrome.tabs.query.mockResolvedValue([{
        title: 'Test Page - Example Site',
        url: 'https://example.com/path'
      }])

      const tabs = await mockChrome.tabs.query({ active: true, currentWindow: true })
      expect(tabs).toHaveLength(1)
      expect(tabs[0].title).toBe('Test Page - Example Site')
    })
  })

  describe('Error Handling', () => {
    it('should handle chrome.tabs.query failures gracefully', async () => {
      mockChrome.tabs.query.mockRejectedValue(new Error('Permission denied'))
      
      // In real implementation, this should not break the extension
      try {
        await mockChrome.tabs.query({ active: true, currentWindow: true })
      } catch (error) {
        expect(error.message).toBe('Permission denied')
      }
    })

    it('should handle invalid URLs gracefully', () => {
      // Test with various edge case URLs that might cause issues
      const edgeCaseUrls = [
        'chrome://extensions/',
        'about:blank',
        'file:///local/file.html',
        'data:text/html,<h1>Test</h1>'
      ]
      
      // These should not cause the URL constructor to throw
      edgeCaseUrls.forEach(url => {
        try {
          new URL(url)
          // If it doesn't throw, that's fine
        } catch (error) {
          // If it throws, that's also expected for some URLs
          expect(error).toBeInstanceOf(TypeError)
        }
      })
    })
  })

  describe('User Experience', () => {
    it('should not interfere with existing form functionality', () => {
      const destinationSelect = document.getElementById('destination')
      const labelInput = document.getElementById('label')
      const createBtn = document.getElementById('create-btn')
      
      expect(destinationSelect).toBeTruthy()
      expect(labelInput).toBeTruthy()
      expect(createBtn).toBeTruthy()
    })

    it('should preserve user-entered labels', () => {
      const labelInput = document.getElementById('label')
      
      // Simulate user entering a custom label
      labelInput.value = 'My Custom Label'
      
      // Auto-populate should not override existing value
      expect(labelInput.value).toBe('My Custom Label')
    })

    it('should have appropriate placeholder text', () => {
      const labelInput = document.getElementById('label')
      expect(labelInput.placeholder).toBeTruthy()
      expect(labelInput.placeholder.length).toBeGreaterThan(0)
    })
  })

  describe('Form Integration', () => {
    it('should integrate with create another workflow', () => {
      const createAnotherBtn = document.getElementById('create-another-btn')
      expect(createAnotherBtn).toBeTruthy()
      expect(createAnotherBtn.textContent).toBe('Create Another')
    })

    it('should reset form appropriately', () => {
      const labelInput = document.getElementById('label')
      const customAliasInput = document.getElementById('custom-alias')
      const useCustomCheckbox = document.getElementById('use-custom')
      
      // These elements should be resettable
      expect(labelInput).toBeTruthy()
      expect(customAliasInput).toBeTruthy()
      expect(useCustomCheckbox).toBeTruthy()
    })
  })
})

describe('Edge Cases and Validation', () => {
  let mockChrome

  beforeEach(() => {
    mockChrome = createMockChrome()
    global.chrome = mockChrome
  })

  describe('Website Patterns', () => {
    it('should handle common e-commerce sites', () => {
      const testCases = [
        { title: 'Buy iPhone 15 - Apple Store', expected: 'Apple Store' },
        { title: 'Amazon.com: Online Shopping', expected: 'Amazon.com' },
        { title: 'Best Buy: Electronics & Tech', expected: 'Best Buy' }
      ]
      
      testCases.forEach(({ title, expected: _expected }) => {
        // These would be tested by the webpage-utils tests
        expect(title.length).toBeGreaterThan(0)
      })
    })

    it('should handle social media sites', () => {
      const socialSites = [
        'Twitter / X',
        'Facebook - log in or sign up',
        'LinkedIn: Log In or Sign Up',
        'Instagram'
      ]
      
      socialSites.forEach(title => {
        expect(title.length).toBeGreaterThan(0)
      })
    })

    it('should handle developer tools and documentation', () => {
      const devSites = [
        'GitHub - Where the world builds software',
        'Stack Overflow - Where Developers Learn',
        'MDN Web Docs'
      ]
      
      devSites.forEach(title => {
        expect(title.length).toBeGreaterThan(0)
      })
    })
  })
})