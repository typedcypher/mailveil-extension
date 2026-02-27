/**
 * Utils module tests
 * Tests the actual exported functions (not reimplementations)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  sanitizeAliasInput,
  truncateNpub,
  formatAliasEmail,
  isValidEmail,
  showButtonFeedback
} from './utils.js'

describe('sanitizeAliasInput', () => {
  it('converts uppercase to lowercase', () => {
    expect(sanitizeAliasInput('MyAlias')).toBe('myalias')
    expect(sanitizeAliasInput('UPPERCASE')).toBe('uppercase')
  })

  it('allows lowercase letters', () => {
    expect(sanitizeAliasInput('hello')).toBe('hello')
  })

  it('allows numbers', () => {
    expect(sanitizeAliasInput('test123')).toBe('test123')
  })

  it('allows hyphens', () => {
    expect(sanitizeAliasInput('my-alias')).toBe('my-alias')
  })

  it('removes special characters', () => {
    expect(sanitizeAliasInput('test@123')).toBe('test123')
    expect(sanitizeAliasInput('hello!')).toBe('hello')
    expect(sanitizeAliasInput('a#b$c%d')).toBe('abcd')
  })

  it('removes spaces', () => {
    expect(sanitizeAliasInput('hello world')).toBe('helloworld')
    expect(sanitizeAliasInput(' spaces ')).toBe('spaces')
  })

  it('removes underscores', () => {
    expect(sanitizeAliasInput('my_alias')).toBe('myalias')
  })

  it('handles empty string', () => {
    expect(sanitizeAliasInput('')).toBe('')
  })

  it('handles null/undefined', () => {
    expect(sanitizeAliasInput(null)).toBe('')
    expect(sanitizeAliasInput(undefined)).toBe('')
  })

  it('handles non-string input', () => {
    expect(sanitizeAliasInput(123)).toBe('')
    expect(sanitizeAliasInput({})).toBe('')
  })
})

describe('truncateNpub', () => {
  it('truncates long npubs correctly', () => {
    const npub = 'npub1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'
    expect(truncateNpub(npub)).toBe('npub1qqqqqqq...qqqqqqqq')
  })

  it('returns short npubs unchanged', () => {
    const shortNpub = 'npub1short'
    expect(truncateNpub(shortNpub)).toBe('npub1short')
  })

  it('handles exactly 23 character npubs', () => {
    const exactNpub = 'npub1234567890abcdefgh'
    expect(truncateNpub(exactNpub)).toBe('npub1234567890abcdefgh')
  })

  it('handles empty string', () => {
    expect(truncateNpub('')).toBe('')
  })

  it('handles null/undefined', () => {
    expect(truncateNpub(null)).toBe('')
    expect(truncateNpub(undefined)).toBe('')
  })

  it('produces consistent length for long npubs', () => {
    const npub = 'npub1verylongnpubthatkeepsgoingandgoing1234567890abcdef'
    const result = truncateNpub(npub)
    expect(result.length).toBe(23) // 12 + 3 (...) + 8
  })
})

describe('formatAliasEmail', () => {
  it('formats alias and domain correctly', () => {
    expect(formatAliasEmail('myalias', 'mailveil.io')).toBe('myalias@mailveil.io')
  })

  it('handles special alias names', () => {
    expect(formatAliasEmail('swift-fox-42', 'mailveil.io')).toBe('swift-fox-42@mailveil.io')
  })
})

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true)
    expect(isValidEmail('test.user@domain.co.uk')).toBe(true)
    expect(isValidEmail('name+tag@gmail.com')).toBe(true)
    expect(isValidEmail('a@b.co')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('@missing.com')).toBe(false)
    expect(isValidEmail('missing@')).toBe(false)
    expect(isValidEmail('no@domain')).toBe(false)
    expect(isValidEmail('spaces in@email.com')).toBe(false)
  })

  it('handles empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })

  it('handles null/undefined', () => {
    expect(isValidEmail(null)).toBe(false)
    expect(isValidEmail(undefined)).toBe(false)
  })
})

describe('showButtonFeedback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('changes button text temporarily', () => {
    const button = { textContent: '📋' }
    
    showButtonFeedback(button, '✓', '📋', 2000)
    
    expect(button.textContent).toBe('✓')
    
    vi.advanceTimersByTime(2000)
    
    expect(button.textContent).toBe('📋')
  })

  it('respects custom duration', () => {
    const button = { textContent: 'Copy' }
    
    showButtonFeedback(button, 'Copied!', 'Copy', 500)
    
    expect(button.textContent).toBe('Copied!')
    
    vi.advanceTimersByTime(400)
    expect(button.textContent).toBe('Copied!')
    
    vi.advanceTimersByTime(100)
    expect(button.textContent).toBe('Copy')
  })
})
