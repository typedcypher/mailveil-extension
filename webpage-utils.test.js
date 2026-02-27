/**
 * Webpage utilities tests
 * Tests the webpage information extraction functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  extractSiteNameFromTitle,
  extractSiteNameFromDomain,
  getDomainLabel,
  getSuggestedLabel,
  getCurrentTabInfo
} from './webpage-utils.js'

describe('extractSiteNameFromTitle', () => {
  it('extracts site name from title with dash separator', () => {
    expect(extractSiteNameFromTitle('Welcome to our store - Amazon')).toBe('Amazon')
    expect(extractSiteNameFromTitle('Product Page - Best Buy')).toBe('Best Buy')
    expect(extractSiteNameFromTitle('Login - GitHub')).toBe('GitHub')
  })

  it('extracts site name from title with pipe separator', () => {
    expect(extractSiteNameFromTitle('Home Page | Netflix')).toBe('Netflix')
    expect(extractSiteNameFromTitle('Settings | Spotify')).toBe('Spotify')
  })

  it('extracts site name from title with other separators', () => {
    expect(extractSiteNameFromTitle('Dashboard :: Slack')).toBe('Slack')
    expect(extractSiteNameFromTitle('Profile — Twitter')).toBe('Twitter')
    expect(extractSiteNameFromTitle('Articles – Medium')).toBe('Medium')
    expect(extractSiteNameFromTitle('Search: Google')).toBe('Google')
  })

  it('prefers shorter, more site-like names', () => {
    expect(extractSiteNameFromTitle('Very Long Product Title With Details - eBay')).toBe('eBay')
    expect(extractSiteNameFromTitle('Complex Page Title Here | YouTube')).toBe('YouTube')
  })

  it('ignores common page names in site detection', () => {
    expect(extractSiteNameFromTitle('Netflix - Home')).toBe('Netflix')
    expect(extractSiteNameFromTitle('Gmail - Login')).toBe('Gmail')
    expect(extractSiteNameFromTitle('Facebook - Dashboard')).toBe('Facebook')
  })

  it('removes common prefixes', () => {
    expect(extractSiteNameFromTitle('Welcome to Netflix')).toBe('Netflix')
    expect(extractSiteNameFromTitle('Sign in to Google')).toBe('Google')
    expect(extractSiteNameFromTitle('Login to Facebook')).toBe('Facebook')
    expect(extractSiteNameFromTitle('Home - Amazon')).toBe('Amazon')
  })

  it('truncates very long titles', () => {
    const longTitle = 'This is a very long title that should be truncated because it is too long'
    const result = extractSiteNameFromTitle(longTitle)
    expect(result.length).toBeLessThanOrEqual(30)
    expect(result).toBe('This is a very long title that')
  })

  it('handles titles without separators', () => {
    expect(extractSiteNameFromTitle('Netflix')).toBe('Netflix')
    expect(extractSiteNameFromTitle('Google Search')).toBe('Google Search')
  })

  it('handles edge cases', () => {
    expect(extractSiteNameFromTitle('')).toBe('')
    expect(extractSiteNameFromTitle(null)).toBe('')
    expect(extractSiteNameFromTitle(undefined)).toBe('')
    expect(extractSiteNameFromTitle('   ')).toBe('')
  })

  it('handles non-string inputs', () => {
    expect(extractSiteNameFromTitle(123)).toBe('')
    expect(extractSiteNameFromTitle({})).toBe('')
    expect(extractSiteNameFromTitle([])).toBe('')
  })

  it('chooses better part of separator-split title', () => {
    expect(extractSiteNameFromTitle('Amazon - Very Long Product Description Here')).toBe('Amazon')
    expect(extractSiteNameFromTitle('Short | This is a much longer description')).toBe('Short')
  })
})

describe('extractSiteNameFromDomain', () => {
  it('extracts from simple domains', () => {
    expect(extractSiteNameFromDomain('google.com')).toBe('google')
    expect(extractSiteNameFromDomain('facebook.com')).toBe('facebook')
    expect(extractSiteNameFromDomain('amazon.com')).toBe('amazon')
  })

  it('removes www prefix', () => {
    expect(extractSiteNameFromDomain('www.google.com')).toBe('google')
    expect(extractSiteNameFromDomain('www.facebook.com')).toBe('facebook')
  })

  it('handles subdomains correctly', () => {
    expect(extractSiteNameFromDomain('mail.google.com')).toBe('google')
    expect(extractSiteNameFromDomain('store.apple.com')).toBe('apple')
    expect(extractSiteNameFromDomain('docs.microsoft.com')).toBe('microsoft')
  })

  it('handles multi-part TLDs', () => {
    expect(extractSiteNameFromDomain('amazon.co.uk')).toBe('amazon')
    expect(extractSiteNameFromDomain('google.com.au')).toBe('google')
    expect(extractSiteNameFromDomain('yahoo.co.jp')).toBe('yahoo')
  })

  it('handles complex subdomains with multi-part TLDs', () => {
    expect(extractSiteNameFromDomain('store.amazon.co.uk')).toBe('amazon')
    expect(extractSiteNameFromDomain('mail.google.com.au')).toBe('google')
  })

  it('handles localhost and single names', () => {
    expect(extractSiteNameFromDomain('localhost')).toBe('localhost')
    expect(extractSiteNameFromDomain('myapp')).toBe('myapp')
  })

  it('removes protocol if present', () => {
    expect(extractSiteNameFromDomain('https://google.com')).toBe('google')
    expect(extractSiteNameFromDomain('http://facebook.com')).toBe('facebook')
  })

  it('handles edge cases', () => {
    expect(extractSiteNameFromDomain('')).toBe('')
    expect(extractSiteNameFromDomain(null)).toBe('')
    expect(extractSiteNameFromDomain(undefined)).toBe('')
  })

  it('handles non-string inputs', () => {
    expect(extractSiteNameFromDomain(123)).toBe('')
    expect(extractSiteNameFromDomain({})).toBe('')
  })
})

describe('getDomainLabel', () => {
  it('returns the full domain with www. stripped', () => {
    expect(getDomainLabel('www.amazon.com')).toBe('amazon.com')
    expect(getDomainLabel('www.google.com')).toBe('google.com')
    expect(getDomainLabel('netflix.com')).toBe('netflix.com')
  })

  it('preserves subdomains (except www)', () => {
    expect(getDomainLabel('mail.google.com')).toBe('mail.google.com')
    expect(getDomainLabel('store.apple.com')).toBe('store.apple.com')
    expect(getDomainLabel('docs.github.com')).toBe('docs.github.com')
  })

  it('strips www from subdomains', () => {
    expect(getDomainLabel('www.shop.example.com')).toBe('shop.example.com')
  })

  it('handles multi-part TLDs correctly', () => {
    expect(getDomainLabel('amazon.co.uk')).toBe('amazon.co.uk')
    expect(getDomainLabel('www.google.com.au')).toBe('google.com.au')
    expect(getDomainLabel('bbc.co.uk')).toBe('bbc.co.uk')
  })

  it('handles localhost', () => {
    expect(getDomainLabel('localhost')).toBe('localhost')
    expect(getDomainLabel('localhost:3000')).toBe('localhost')
  })

  it('truncates very long domains', () => {
    const longDomain = 'this-is-a-very-long-subdomain.example-with-lots-of-characters.com'
    const result = getDomainLabel(longDomain)
    expect(result.length).toBeLessThanOrEqual(50)
  })

  it('handles edge cases', () => {
    expect(getDomainLabel('')).toBe('')
    expect(getDomainLabel(null)).toBe('')
    expect(getDomainLabel(undefined)).toBe('')
  })

  it('removes protocol if somehow present', () => {
    expect(getDomainLabel('https://amazon.com')).toBe('amazon.com')
    expect(getDomainLabel('http://www.google.com')).toBe('google.com')
  })

  it('removes port numbers', () => {
    expect(getDomainLabel('example.com:8080')).toBe('example.com')
    expect(getDomainLabel('localhost:3000')).toBe('localhost')
  })
})

describe('getSuggestedLabel', () => {
  it('returns domain as primary label (not title)', () => {
    expect(getSuggestedLabel('Shopping Cart - Amazon', 'www.amazon.com')).toBe('amazon.com')
    expect(getSuggestedLabel('Home | Netflix', 'netflix.com')).toBe('netflix.com')
    expect(getSuggestedLabel('Buy iPhone 15 Pro Max - Apple', 'www.apple.com')).toBe('apple.com')
  })

  it('returns domain for e-commerce sites', () => {
    expect(getSuggestedLabel('Cart - Best Buy', 'www.bestbuy.com')).toBe('bestbuy.com')
    expect(getSuggestedLabel('Shoes, Clothing & Accessories | Nike', 'nike.com')).toBe('nike.com')
    expect(getSuggestedLabel('Electronics & Appliances | Target', 'target.com')).toBe('target.com')
  })

  it('returns domain for social media sites', () => {
    expect(getSuggestedLabel('(3) Facebook', 'facebook.com')).toBe('facebook.com')
    expect(getSuggestedLabel('Home / Twitter', 'twitter.com')).toBe('twitter.com')
    expect(getSuggestedLabel('Instagram', 'www.instagram.com')).toBe('instagram.com')
  })

  it('preserves subdomains in the label', () => {
    expect(getSuggestedLabel('Gmail - Inbox', 'mail.google.com')).toBe('mail.google.com')
    expect(getSuggestedLabel('Docs', 'docs.google.com')).toBe('docs.google.com')
  })

  it('returns domain with multi-part TLDs', () => {
    expect(getSuggestedLabel('BBC News', 'www.bbc.co.uk')).toBe('bbc.co.uk')
    expect(getSuggestedLabel('Amazon UK', 'www.amazon.co.uk')).toBe('amazon.co.uk')
  })

  it('handles blank titles gracefully', () => {
    expect(getSuggestedLabel('', 'github.com')).toBe('github.com')
    expect(getSuggestedLabel('', 'www.stackoverflow.com')).toBe('stackoverflow.com')
  })

  it('returns empty string when hostname is invalid', () => {
    expect(getSuggestedLabel('Some Page', '')).toBe('')
    expect(getSuggestedLabel('', '')).toBe('')
  })

  it('handles localhost for development', () => {
    expect(getSuggestedLabel('Local Dev Server', 'localhost')).toBe('localhost')
    expect(getSuggestedLabel('Dev', 'localhost:3000')).toBe('localhost')
  })
})

describe('getCurrentTabInfo', () => {
  let mockChrome

  beforeEach(() => {
    mockChrome = {
      tabs: {
        query: vi.fn()
      }
    }
    global.chrome = mockChrome
  })

  it('returns current tab title and hostname', async () => {
    mockChrome.tabs.query.mockResolvedValue([{
      title: 'GitHub - Where the world builds software',
      url: 'https://github.com/'
    }])

    const result = await getCurrentTabInfo()
    expect(result).toEqual({
      title: 'GitHub - Where the world builds software',
      hostname: 'github.com'
    })

    expect(mockChrome.tabs.query).toHaveBeenCalledWith({ active: true, currentWindow: true })
  })

  it('handles tabs with no title', async () => {
    mockChrome.tabs.query.mockResolvedValue([{
      title: '',
      url: 'https://example.com/path'
    }])

    const result = await getCurrentTabInfo()
    expect(result).toEqual({
      title: '',
      hostname: 'example.com'
    })
  })

  it('handles localhost URLs', async () => {
    mockChrome.tabs.query.mockResolvedValue([{
      title: 'Local Dev Server',
      url: 'http://localhost:3000/dashboard'
    }])

    const result = await getCurrentTabInfo()
    expect(result).toEqual({
      title: 'Local Dev Server',
      hostname: 'localhost'
    })
  })

  it('returns empty values when no tabs found', async () => {
    mockChrome.tabs.query.mockResolvedValue([])

    const result = await getCurrentTabInfo()
    expect(result).toEqual({
      title: '',
      hostname: ''
    })
  })

  it('handles API errors gracefully', async () => {
    mockChrome.tabs.query.mockRejectedValue(new Error('No active tab'))

    const result = await getCurrentTabInfo()
    expect(result).toEqual({
      title: '',
      hostname: ''
    })
  })

  it('handles invalid URLs gracefully', async () => {
    mockChrome.tabs.query.mockResolvedValue([{
      title: 'Invalid URL Page',
      url: 'chrome://extensions/'
    }])

    // Should not throw, might return empty hostname for chrome:// URLs
    const result = await getCurrentTabInfo()
    expect(result.title).toBe('Invalid URL Page')
    // hostname could be empty or 'extensions' depending on URL parsing
  })
})