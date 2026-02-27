# Changelog

All notable changes to the MailVeil Chrome Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] - 2024-02-27

### Changed
- Refactored to modular architecture following coding principles
- Separated concerns: config, session, API, utils modules
- Moved to standalone repository (typedcypher/mailveil-extension)

### Added
- Comprehensive test coverage (76 tests)
- ES modules support
- GitHub Actions CI/CD pipeline
- Build script for Chrome Web Store distribution

### Improved
- DRY: centralized URL/environment handling
- Better error handling in API layer
- Cleaner separation of UI and business logic

## [1.2.0] - 2024-02-15

### Changed
- Custom aliases now require Pro plan (free users get random aliases)
- Added upgrade prompt for free users attempting custom aliases

## [1.1.0] - 2024-02-10

### Added
- Destination email dropdown shows verified emails only
- Dev mode toggle for local development
- "No verified emails" prompt with link to settings

### Fixed
- Session sync reliability between extension and website

## [1.0.0] - 2024-02-01

### Added
- Initial release
- Login with Nostr (NIP-07)
- Create random and custom email aliases
- Label support for alias organization
- Quick copy to clipboard
- Recent aliases view
- Development mode for local testing

[1.3.0]: https://github.com/typedcypher/mailveil-extension/releases/tag/v1.3.0
[1.2.0]: https://github.com/typedcypher/mailveil-extension/releases/tag/v1.2.0
[1.1.0]: https://github.com/typedcypher/mailveil-extension/releases/tag/v1.1.0
[1.0.0]: https://github.com/typedcypher/mailveil-extension/releases/tag/v1.0.0
