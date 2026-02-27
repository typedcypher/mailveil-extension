// MailVeil Extension Popup
// Main entry point - orchestrates UI and modules

import { getUrl, isDevMode, setDevMode, updateSyncConfig } from './config.js'
import { getSession, saveSession, clearSession } from './session.js'
import { fetchUserPlan, fetchDestinationEmails, fetchAliases, createAlias, logout } from './api.js'
import { sanitizeAliasInput, truncateNpub, formatAliasEmail, copyToClipboard } from './utils.js'
import { getCurrentTabInfo, getSuggestedLabel } from './webpage-utils.js'

// DOM elements
const elements = {
  loginView: document.getElementById('login-view'),
  mainView: document.getElementById('main-view'),
  successView: document.getElementById('success-view'),
  formSection: document.querySelector('.form-section'),
  errorDiv: document.getElementById('error'),
  userNpub: document.getElementById('user-npub'),
  aliasesList: document.getElementById('aliases-list'),
  destinationSelect: document.getElementById('destination'),
  labelInput: document.getElementById('label'),
  useCustomCheckbox: document.getElementById('use-custom'),
  customAliasRow: document.getElementById('custom-alias-row'),
  customAliasInput: document.getElementById('custom-alias'),
  createdAliasSpan: document.getElementById('created-alias'),
  noEmailsMsg: document.getElementById('no-emails-msg'),
  manageEmailsLink: document.getElementById('manage-emails-link'),
  addEmailLink: document.getElementById('add-email-link'),
  createBtn: document.getElementById('create-btn'),
  aliasesSection: document.getElementById('aliases-section'),
  customAliasSection: document.getElementById('custom-alias-section'),
  upgradeHint: document.getElementById('upgrade-hint'),
  devToggle: document.getElementById('dev-toggle'),
  loginHint: document.getElementById('login-hint')
}

// State
let session = null
let verifiedEmails = []
let isPro = false

// Initialize
document.addEventListener('DOMContentLoaded', initialize)

async function initialize() {
  await updateSyncConfig()
  
  session = await getSession()
  if (session) {
    await showMainView()
    await Promise.all([
      loadUserPlan(),
      loadDestinationEmails(),
      loadAliases()
    ])
  }
  
  setupEventListeners()
  await updateDevModeUI()
}

function setupEventListeners() {
  document.getElementById('login-btn').addEventListener('click', handleLogin)
  document.getElementById('logout-btn').addEventListener('click', handleLogout)
  elements.createBtn.addEventListener('click', handleCreate)
  document.getElementById('copy-btn').addEventListener('click', handleCopy)
  document.getElementById('create-another-btn').addEventListener('click', showForm)
  elements.devToggle.addEventListener('click', toggleDevMode)
  
  elements.manageEmailsLink.addEventListener('click', openEmailSettings)
  elements.addEmailLink.addEventListener('click', openEmailSettings)
  document.getElementById('upgrade-link').addEventListener('click', openPricingPage)
  
  elements.useCustomCheckbox.addEventListener('change', handleCustomCheckboxChange)
  elements.customAliasInput.addEventListener('input', handleAliasInput)
}

function handleCustomCheckboxChange() {
  elements.customAliasRow.classList.toggle('hidden', !elements.useCustomCheckbox.checked)
}

function handleAliasInput(event) {
  event.target.value = sanitizeAliasInput(event.target.value)
}

async function openEmailSettings(event) {
  event.preventDefault()
  const url = await getUrl('/settings/emails')
  chrome.tabs.create({ url })
  window.close()
}

async function openPricingPage(event) {
  event.preventDefault()
  const url = await getUrl('/pricing')
  chrome.tabs.create({ url })
  window.close()
}

async function handleLogin() {
  hideError()
  const loginUrl = await getUrl('/login?ext=1')
  chrome.tabs.create({ url: loginUrl })
  window.close()
}

async function handleLogout() {
  if (session?.token) {
    await logout(session.token)
  }
  
  session = null
  verifiedEmails = []
  isPro = false
  await clearSession()
  showLoginView()
}

async function loadUserPlan() {
  try {
    const userData = await fetchUserPlan(session.token)
    
    if (userData === null) {
      await handleLogout()
      return
    }
    
    isPro = userData.plan === 'pro'
    renderCustomAliasOption()
  } catch (error) {
    console.error('Failed to load user plan:', error)
  }
}

function renderCustomAliasOption() {
  if (isPro) {
    elements.customAliasSection.classList.remove('hidden')
    elements.upgradeHint.classList.add('hidden')
  } else {
    elements.customAliasSection.classList.add('hidden')
    elements.upgradeHint.classList.remove('hidden')
    elements.useCustomCheckbox.checked = false
    elements.customAliasRow.classList.add('hidden')
  }
}

async function loadDestinationEmails() {
  try {
    const emails = await fetchDestinationEmails(session.token)
    
    if (emails === null) {
      await handleLogout()
      return
    }
    
    verifiedEmails = emails
    renderDestinationSelect()
  } catch (error) {
    console.error('Failed to load destination emails:', error)
  }
}

function renderDestinationSelect() {
  elements.destinationSelect.innerHTML = ''
  
  if (verifiedEmails.length === 0) {
    elements.destinationSelect.classList.add('hidden')
    elements.manageEmailsLink.classList.add('hidden')
    elements.noEmailsMsg.classList.remove('hidden')
    elements.createBtn.disabled = true
  } else {
    elements.destinationSelect.classList.remove('hidden')
    elements.manageEmailsLink.classList.remove('hidden')
    elements.noEmailsMsg.classList.add('hidden')
    elements.createBtn.disabled = false
    
    verifiedEmails.forEach(email => {
      const option = document.createElement('option')
      option.value = email.email
      option.textContent = email.email
      elements.destinationSelect.appendChild(option)
    })
  }
}

async function handleCreate() {
  hideError()
  
  const destination = elements.destinationSelect.value
  if (!destination) {
    showError('Please select a destination email')
    return
  }
  
  elements.createBtn.disabled = true
  elements.createBtn.textContent = 'Creating...'
  
  try {
    const params = { destination }
    
    const label = elements.labelInput.value.trim()
    if (label) {
      params.label = label
    }
    
    if (elements.useCustomCheckbox.checked) {
      const customAlias = elements.customAliasInput.value.trim()
      if (customAlias) {
        params.alias = customAlias
      }
    }
    
    const alias = await createAlias(session.token, params)
    showSuccess(alias)
    await loadAliases()
  } catch (error) {
    showError(error.message)
  } finally {
    elements.createBtn.disabled = false
    elements.createBtn.textContent = 'Create Alias'
  }
}

async function handleCopy() {
  const aliasEmail = elements.createdAliasSpan.textContent
  const copyBtn = document.getElementById('copy-btn')
  await copyToClipboard(aliasEmail, copyBtn)
}

async function loadAliases() {
  try {
    const aliases = await fetchAliases(session.token, 5)
    
    if (aliases === null) {
      await handleLogout()
      return
    }
    
    renderAliases(aliases)
  } catch (error) {
    console.error('Failed to load aliases:', error)
  }
}

function renderAliases(aliases) {
  if (aliases.length === 0) {
    elements.aliasesSection.classList.add('hidden')
    return
  }
  
  elements.aliasesSection.classList.remove('hidden')
  elements.aliasesList.innerHTML = aliases.map(alias => {
    const email = formatAliasEmail(alias.alias, alias.domain)
    return `
      <li>
        <div>
          <span class="alias-name">${email}</span>
          ${alias.label ? `<span class="alias-label"> • ${alias.label}</span>` : ''}
        </div>
        <button class="btn-icon" data-alias="${email}" title="Copy">📋</button>
      </li>
    `
  }).join('')
  
  elements.aliasesList.querySelectorAll('.btn-icon').forEach(button => {
    button.addEventListener('click', async () => {
      await copyToClipboard(button.dataset.alias, button)
    })
  })
}

function showLoginView() {
  elements.loginView.classList.remove('hidden')
  elements.mainView.classList.add('hidden')
}

async function showMainView() {
  elements.loginView.classList.add('hidden')
  elements.mainView.classList.remove('hidden')
  elements.successView.classList.add('hidden')
  elements.formSection.classList.remove('hidden')
  
  elements.userNpub.textContent = truncateNpub(session?.npub || '')
  
  // Auto-populate label from current webpage
  await autoPopulateLabel()
}

async function showForm() {
  elements.successView.classList.add('hidden')
  elements.formSection.classList.remove('hidden')
  elements.labelInput.value = ''
  elements.customAliasInput.value = ''
  elements.useCustomCheckbox.checked = false
  elements.customAliasRow.classList.add('hidden')
  await loadDestinationEmails()
  renderCustomAliasOption()
  
  // Auto-populate label from current webpage
  await autoPopulateLabel()
}

function showSuccess(alias) {
  elements.formSection.classList.add('hidden')
  elements.successView.classList.remove('hidden')
  elements.createdAliasSpan.textContent = formatAliasEmail(alias.alias, alias.domain)
}

function showError(message) {
  elements.errorDiv.textContent = message
  elements.errorDiv.classList.remove('hidden')
}

function hideError() {
  elements.errorDiv.classList.add('hidden')
}

async function toggleDevMode() {
  const currentMode = await isDevMode()
  await setDevMode(!currentMode)
  await updateSyncConfig()
  await updateDevModeUI()
}

async function updateDevModeUI() {
  const devMode = await isDevMode()
  
  if (devMode) {
    elements.devToggle.textContent = '🔧 Dev mode ON'
    elements.devToggle.classList.add('active')
    elements.loginHint.textContent = 'Opens localhost:3000 to sign in'
  } else {
    elements.devToggle.textContent = '🔧 Dev mode'
    elements.devToggle.classList.remove('active')
    elements.loginHint.textContent = 'Opens the website to sign in with your Nostr extension'
  }
}

/**
 * Auto-populate label based on current webpage
 * Gets current tab info and suggests a label based on site name
 */
async function autoPopulateLabel() {
  // Only populate if label input is empty (don't override user input)
  if (elements.labelInput.value.trim()) {
    return
  }

  try {
    const { title, hostname } = await getCurrentTabInfo()
    const suggestedLabel = getSuggestedLabel(title, hostname)
    
    if (suggestedLabel) {
      elements.labelInput.value = suggestedLabel
      // Add a subtle indicator that this was auto-populated
      elements.labelInput.placeholder = `Auto-suggested: ${suggestedLabel} (editable)`
    }
  } catch (error) {
    console.error('Failed to auto-populate label:', error)
    // Fail silently - this is a convenience feature
  }
}

// Listen for session updates from website
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'SESSION_UPDATE' && message.session) {
    session = message.session
    saveSession(session)
  }
})
