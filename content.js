// Content script for MailVeil - runs on mailveil.io and localhost
// Syncs session from website to extension

(function() {
  const hostname = window.location.hostname
  const isMailVeil = hostname.includes('mailveil.io')
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  
  // Only run on mailveil.io or localhost
  if (!isMailVeil && !isLocalhost) {
    return
  }
  
  // Set dev mode flag if on localhost
  if (isLocalhost) {
    chrome.storage.local.set({ devMode: true })
  } else {
    chrome.storage.local.set({ devMode: false })
  }

  // Check for session in localStorage and sync to extension
  function syncSession() {
    try {
      const sessionData = localStorage.getItem('mailveil_session')
      if (sessionData) {
        const session = JSON.parse(sessionData)
        chrome.storage.local.set({ session })
        console.log('MailVeil: Session synced to extension')
        
        // If this was an extension login redirect, close the tab
        if (window.location.search.includes('ext=1')) {
          window.close()
        }
      }
    } catch (e) {
      console.error('MailVeil: Failed to sync session', e)
    }
  }

  // Sync on page load
  syncSession()

  // Watch for localStorage changes (login/logout)
  window.addEventListener('storage', (e) => {
    if (e.key === 'mailveil_session') {
      syncSession()
    }
  })

  // Also sync when the page sets the session (for SPA)
  const originalSetItem = localStorage.setItem
  localStorage.setItem = function(key, value) {
    originalSetItem.call(this, key, value)
    if (key === 'mailveil_session') {
      syncSession()
    }
  }
})();
