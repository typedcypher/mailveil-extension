# MailVeil Chrome Extension

<p align="center">
  <img src="icons/icon128.png" alt="MailVeil Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Create email aliases instantly with Nostr authentication</strong>
</p>

<p align="center">
  <a href="https://github.com/typedcypher/mailveil-extension/actions"><img src="https://github.com/typedcypher/mailveil-extension/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/typedcypher/mailveil-extension/releases"><img src="https://img.shields.io/github/v/release/typedcypher/mailveil-extension" alt="Release"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
</p>

---

## What is MailVeil?

MailVeil is a privacy-focused email aliasing service that lets you create unlimited email aliases that forward to your real inbox. Sign up forms, newsletters, online shopping — use a unique alias everywhere and protect your real email address.

This browser extension provides quick access to create and manage aliases directly from your browser toolbar.

## Features

- 🔐 **Login with Nostr** - Passwordless authentication using NIP-07 browser extensions (nos2x, Alby, etc.)
- 📧 **Instant Aliases** - Generate random aliases with one click (free plan)
- ✨ **Custom Aliases** - Create memorable aliases like `shopping@yourdomain.io` (Pro plan)
- 🏷️ **Labels** - Organize aliases by website, category, or purpose
- 📋 **Quick Copy** - Copy aliases to clipboard instantly
- 🕐 **Recent Aliases** - Access your most recently created aliases
- 🔄 **Auto-Sync** - Session syncs between extension and mailveil.io

## Installation

### From Chrome Web Store (Recommended)

_Coming soon - pending Chrome Web Store review_

### Manual Installation (Developer Mode)

1. Download the latest release from [Releases](https://github.com/typedcypher/mailveil-extension/releases)
2. Extract the ZIP file
3. Open Chrome and navigate to `chrome://extensions/`
4. Enable **Developer mode** (toggle in top-right)
5. Click **Load unpacked**
6. Select the extracted folder

### From Source

```bash
# Clone the repository
git clone https://github.com/typedcypher/mailveil-extension.git
cd mailveil-extension

# Install dependencies
npm install

# Build the extension
npm run build

# Load the 'dist' folder as an unpacked extension in Chrome
```

## Usage

1. Click the MailVeil icon in your browser toolbar
2. Click **Login with Nostr** and approve the signature request
3. Select a verified destination email from the dropdown
4. (Optional) Add a label to organize your alias
5. Click **Create Alias**
6. Click the copy icon to copy the alias to your clipboard

## Development

### Prerequisites

- Node.js 18 or later
- npm

### Setup

```bash
# Clone and install
git clone https://github.com/typedcypher/mailveil-extension.git
cd mailveil-extension
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linter
npm run lint

# Build for distribution
npm run build:zip
```

### Local Development with MailVeil Server

The extension automatically detects localhost vs production environments:

1. Start the local MailVeil server: `cd /path/to/nostrmail && npm run dev`
2. Load the extension in Chrome (Developer mode → Load unpacked)
3. Visit `http://localhost:3000` in any tab — this enables dev mode
4. The extension will now use `localhost:3000` for all API calls

To switch back to production, visit `https://mailveil.io` in any tab.

### Project Structure

```
mailveil-extension/
├── manifest.json      # Chrome extension manifest (v3)
├── popup.html         # Extension popup UI
├── popup.css          # Popup styles
├── popup.js           # Popup logic and event handlers
├── content.js         # Content script for session sync
├── config.js          # Environment and URL configuration
├── session.js         # Chrome storage session management
├── api.js             # API communication layer
├── utils.js           # Pure utility functions
├── webpage-utils.js   # Web page interaction utilities
├── icons/             # Extension icons (16, 48, 128px)
├── screenshots/       # Chrome Web Store screenshots
├── scripts/           # Build scripts
└── *.test.js          # Test files
```

### Architecture

The extension follows modular design principles:

- **config.js** - Centralizes URL handling, dev mode, environment detection
- **session.js** - Chrome storage wrapper for session persistence
- **api.js** - All API calls with error handling
- **utils.js** - Pure, testable utility functions
- **popup.js** - UI orchestration (imports other modules)
- **content.js** - Syncs session between website and extension

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- utils.test.js
```

Test coverage includes:
- Input sanitization and validation
- API request/response handling
- Session management
- Environment configuration
- UI interactions (E2E tests with jsdom)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Write tests for your changes
4. Ensure all tests pass (`npm test`)
5. Ensure linting passes (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## Related Projects

- [MailVeil Website](https://mailveil.io) - Create your account

## License

MIT License - see [LICENSE](LICENSE) for details.

## Version History

See [CHANGELOG.md](CHANGELOG.md) for release notes.
