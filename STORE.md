# Chrome Web Store Listing

This document contains the Chrome Web Store listing details for MailVeil.

## Store Metadata

### Extension Name
MailVeil - Email Alias Manager

### Short Description (132 characters max)
Create email aliases instantly with Nostr authentication. Protect your inbox from spam and tracking.

### Detailed Description (16,000 characters max)

MailVeil helps you protect your real email address by creating unlimited aliases that forward to your inbox.

🛡️ WHY USE EMAIL ALIASES?

Every time you share your email address, you risk:
• Spam and unwanted marketing
• Data breaches exposing your email
• Companies selling your information
• Difficulty tracking who leaked your data

With MailVeil, give every website a unique alias. If one gets compromised, simply disable it — your real email stays safe.

✨ KEY FEATURES

🔐 Nostr Authentication
Sign in securely with your Nostr identity. No passwords to remember or reset. Works with popular Nostr extensions like nos2x and Alby.

📧 Instant Aliases
Create random aliases with one click. Perfect for sign-up forms, newsletters, and anywhere you need a quick throwaway email.

🎨 Custom Aliases (Pro)
Create memorable aliases like "shopping@your-domain.io" for easy recognition and organization.

🏷️ Labels & Organization
Tag your aliases by website, category, or purpose. Easily find and manage hundreds of aliases.

📋 One-Click Copy
Copy any alias to your clipboard instantly. Paste it into any form without leaving the page.

🔄 Seamless Sync
Your session syncs automatically between the extension and mailveil.io. Log in once, access everywhere.

📱 HOW IT WORKS

1. Install the extension
2. Click the MailVeil icon in your toolbar
3. Sign in with your Nostr extension
4. Create an alias and copy it
5. Emails to your alias forward to your real inbox

🔒 PRIVACY FIRST

• We never read your emails — we only forward them
• No tracking or analytics in the extension
• Open source code you can audit
• Your Nostr keys never leave your browser

🆓 FREE PLAN INCLUDES

• Unlimited random aliases
• 5 verified destination emails
• Basic alias management

💎 PRO PLAN ADDS

• Custom aliases (choose your own prefix)
• Unlimited destinations
• Priority support

📚 PERMISSIONS EXPLAINED

• activeTab: Read the current tab URL for context
• storage: Save your session locally
• clipboardWrite: Copy aliases to clipboard
• Host permissions: Communicate with mailveil.io API

🌐 LEARN MORE

Website: https://mailveil.io
Documentation: https://github.com/typedcypher/mailveil-extension
Support: support@mailveil.io

### Category
Productivity

### Language
English

## Required Assets

### Icons
- [ ] icon16.png (16x16) ✓ Included
- [ ] icon48.png (48x48) ✓ Included  
- [ ] icon128.png (128x128) ✓ Included

### Screenshots (1280x800 or 640x400)
Required: 1-5 screenshots showing:
1. Extension popup - logged in state with alias creation
2. Extension popup - showing recent aliases list
3. Extension popup - Nostr login screen
4. Alias copied notification
5. Settings/configuration view

### Promotional Images (optional)
- Small tile: 440x280
- Marquee: 1400x560

## Privacy Policy

URL: https://mailveil.io/privacy

## Support URL

https://github.com/typedcypher/mailveil-extension/issues

## Review Notes for Google

This extension requires a Nostr browser extension (like nos2x or Alby) for authentication. Test accounts:

1. Install a Nostr extension (nos2x from Chrome Web Store)
2. Generate or import a Nostr key
3. Click "Login with Nostr" in MailVeil
4. Approve the signature request

The extension communicates only with:
- https://mailveil.io (production API)
- http://localhost:3000 (development only)
