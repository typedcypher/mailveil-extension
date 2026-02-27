# MailVeil Extension Testing Guide

## Issue #29: Auto-populate Label Feature Testing

### Overview
The auto-populate label feature extracts meaningful site names from the current webpage and suggests them as labels when creating email aliases.

### Manual Testing Checklist

#### 1. Extension Loading
- [ ] Load extension in Chrome Developer Mode
- [ ] Extension icon appears in toolbar
- [ ] No console errors on extension load
- [ ] Popup opens when clicking icon

#### 2. Auto-populate Functionality

**Test with E-commerce Sites:**
- [ ] Visit amazon.com → Label should suggest "amazon"
- [ ] Visit bestbuy.com → Label should suggest "bestbuy"  
- [ ] Visit "Product Page - eBay" → Label should suggest "eBay"

**Test with Social Media:**
- [ ] Visit facebook.com → Label should suggest "facebook"
- [ ] Visit "Home / Twitter" → Label should suggest appropriate name
- [ ] Visit linkedin.com → Label should suggest "linkedin"

**Test with Complex Titles:**
- [ ] Visit "GitHub - Where the world builds software" → Should suggest "GitHub"
- [ ] Visit "Stack Overflow - Where Developers Learn" → Should suggest appropriate name
- [ ] Visit pages with " | ", " - ", " :: " separators

**Test with Subdomains:**
- [ ] Visit mail.google.com → Should suggest "google"
- [ ] Visit docs.microsoft.com → Should suggest "microsoft"
- [ ] Visit store.apple.com → Should suggest "apple"

#### 3. Edge Cases

**Localhost/Development:**
- [ ] Visit localhost:3000 → Should suggest "localhost"
- [ ] Visit 127.0.0.1:3000 → Should handle gracefully

**Long Titles:**
- [ ] Visit pages with very long titles → Should truncate to 30 characters
- [ ] Should not break extension functionality

**No Title/Empty:**
- [ ] Visit pages with empty titles → Should fall back to domain
- [ ] Should still allow manual label entry

#### 4. User Override Behavior

**Preserve User Input:**
- [ ] Enter custom label → Auto-populate should NOT override
- [ ] Clear label field → Auto-populate should work on next form show
- [ ] Type in label field → Should accept user input normally

**Form Reset:**
- [ ] Click "Create Another" → Should auto-populate for new form
- [ ] Should clear previous label and suggest new one based on current tab

#### 5. Permissions and Security

**Extension Permissions:**
- [ ] Should work without requesting additional permissions
- [ ] Should use existing "activeTab" permission
- [ ] Should not access tabs user hasn't interacted with

**Error Handling:**
- [ ] Should work on chrome:// pages (may not populate but shouldn't break)
- [ ] Should work on extension pages
- [ ] Should handle permission denied gracefully

### Automated Testing

#### Run Unit Tests
```bash
cd /tmp/nostrmail
npx vitest run extension/webpage-utils.test.js
npx vitest run extension/auto-populate.test.js
```

#### Test Coverage Areas
- [x] Title extraction with various separators
- [x] Domain name extraction
- [x] Multi-part TLD handling (co.uk, com.au)
- [x] Subdomain handling
- [x] Edge case handling (empty, null, long titles)
- [x] Integration with popup functionality
- [x] Chrome extension API mocking
- [x] Error handling scenarios

### Performance Testing

**Extension Performance:**
- [ ] Extension popup opens quickly (<500ms)
- [ ] Auto-populate happens quickly (<200ms)
- [ ] No noticeable delay in form interaction
- [ ] Works smoothly when switching between tabs

### Browser Compatibility

**Chrome/Chromium:**
- [ ] Works in latest Chrome version
- [ ] Works in Chrome Canary
- [ ] Works in Brave browser
- [ ] Works in Edge (Chromium-based)

### Example Test Cases

#### Test Case 1: Amazon Shopping
1. Navigate to amazon.com (any product page)
2. Open MailVeil extension
3. Label field should show "amazon" or "Amazon"
4. User can edit or keep the suggestion

#### Test Case 2: GitHub Repository
1. Navigate to any GitHub repository page
2. Title typically: "username/repo-name - GitHub"
3. Open MailVeil extension
4. Label should suggest "GitHub"

#### Test Case 3: User Override
1. Navigate to any website
2. Open MailVeil extension
3. Manually type "CustomLabel" in label field
4. Switch to different tab and back
5. Label should still show "CustomLabel" (preserved)

#### Test Case 4: Create Another
1. Create an alias successfully
2. Click "Create Another"
3. Label should be auto-populated based on current tab
4. Should be different from previous label if on different site

### Debugging

**Console Logs:**
- Check browser console for any JavaScript errors
- Extension popup console should show debug info
- Background page console should be error-free

**Storage Inspection:**
- Check chrome.storage.local for session data
- Verify no conflicts with existing storage keys

**Network Monitoring:**
- Should not make additional network requests for tab info
- Should only use existing Chrome APIs

### Known Limitations

1. **Chrome-only URLs:** chrome://, about:, data: URLs may not provide useful labels
2. **Permission restrictions:** Only works on tabs user has interacted with
3. **Single-page apps:** May not update label if page title changes after popup opens
4. **Very dynamic titles:** Pages that change titles frequently might be inconsistent

### Success Criteria

- ✅ Auto-populates meaningful labels for common websites
- ✅ Preserves user input (doesn't override manually entered labels)  
- ✅ Handles edge cases gracefully without breaking extension
- ✅ Works across different types of websites
- ✅ Performance impact is negligible
- ✅ Maintains backwards compatibility
- ✅ Comprehensive test coverage (>95%)

### Rollback Plan

If issues arise:
1. Disable auto-populate by commenting out `await autoPopulateLabel()` calls
2. Extension will work exactly as before
3. No breaking changes to existing functionality