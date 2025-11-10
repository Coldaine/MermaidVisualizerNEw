# Changelog

All notable changes to the Mermaid Visualizer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Full Chrome extension TypeScript implementation
- Native Tauri desktop application with file system access
- Theme customization UI
- Diagram history and versioning
- Collaborative editing features
- Auto-save and recovery
- Plugin system for custom diagram types

---

## [1.0.0] - 2025-01-10

### Added

#### Documentation
- ✨ Comprehensive README.md with setup, usage, and troubleshooting
- ✨ CONTRIBUTING.md with coding standards and PR process
- ✨ API.md with complete API documentation for all scripts and functions
- ✨ CHANGELOG.md for tracking version history

#### Test Infrastructure
- ✅ Automated diagram validator script (`tests/diagram-validator.js`)
- ✅ Beta features test suite (`tests/beta-features.test.js`)
- ✅ NPM test scripts with verbose mode and type filtering
- ✅ Comprehensive test coverage for all diagram types

#### Beta Diagram Support
- ⚡ Architecture diagrams (`architecture-beta`) with test file
- ⚡ Block diagrams (`block-beta`) with test file
- ⚡ Mindmap diagrams with test file
- ⚡ XY Chart diagrams (`xychart-beta`) with test file
- ⚡ Sankey diagrams (`sankey-beta`) with test file
- ⚡ Quadrant chart diagrams with test file
- ⚡ Treemap diagrams with test file (experimental)
- ⚡ Kanban diagrams with test file (experimental)

#### Desktop Application Enhancements
- 🎨 Updated example dropdown with beta diagram section
- 🎨 Lightning bolt (⚡) indicators for beta features
- 🎨 Visual separator between stable and beta diagrams
- 📝 Example code for all 6 beta diagram types
- 🔧 Fixed dropdown click handler to skip header items

#### Test Diagram Files
- `test-diagram-architecture.mmd` - Cloud infrastructure example
- `test-diagram-block.mmd` - System architecture with blocks
- `test-diagram-mindmap.mmd` - Project structure mindmap
- `test-diagram-xychart.mmd` - Sales revenue chart
- `test-diagram-sankey.mmd` - Traffic flow diagram
- `test-diagram-quadrant.mmd` - Feature priority matrix
- `test-diagram-treemap.mmd` - Budget hierarchy
- `test-diagram-kanban.mmd` - Task board example

#### Package Configuration
- 📦 Updated package.json with comprehensive scripts
- 📦 Added test:verbose, test:beta, test:all commands
- 📦 Added serve command for local development
- 📦 Set package type to "module" for ES6 support
- 📦 Added keywords for better discoverability

### Changed
- 🔄 Desktop app now loads Mermaid v11.x (latest) from CDN
- 🔄 Reorganized project structure with `docs/` and `tests/` directories
- 🔄 Enhanced status bar messages with better feedback
- 🔄 Improved error handling in diagram rendering

### Fixed
- 🐛 Dropdown menu now properly ignores header items without data-example
- 🐛 Export buttons properly disabled until diagram renders
- 🐛 Tab key in editor now inserts 4 spaces correctly

---

## [0.1.0] - 2024-11-09

### Added

#### Initial Release
- 🎉 Desktop application HTML (`index_1.html`)
- 🎉 Chrome extension demo/simulator (`index.html`)
- 🎉 Build script for Mermaid.js (`build-mermaid.js`)
- 🎉 Configuration files (manifest.json, tauri.conf.json)

#### Core Features
- ✏️ Split-pane editor with live preview
- 💾 SVG export functionality
- 🖼️ PNG export with 2x DPI support
- 📚 Example templates for 6 stable diagram types
- ⌨️ Keyboard shortcuts (Ctrl+Enter to render)
- 🎨 Professional UI with modern styling

#### Stable Diagram Support
- Flowchart diagrams
- Sequence diagrams
- Class diagrams
- State diagrams
- Entity-Relationship diagrams
- Gantt charts

#### Test Files (Stable)
- `test-diagram-flowchart.mmd`
- `test-diagram-sequence.mmd`
- `test-diagram-class.mmd`
- `test-diagram-state.mmd`
- `test-diagram-er.mmd`
- `test-diagram-gantt.mmd`

#### Documentation (Initial)
- `DELIVERABLES_SUMMARY.txt` - Project overview
- `implementation-notes.md` - Technical implementation details
- `quick-reference-commands.csv` - Command reference

#### Python Scripts
- `chart_script.py` - Chart generation utilities
- `script.py` through `script_6.py` - Various utility scripts

---

## Version History Summary

| Version | Release Date | Major Features |
|---------|--------------|----------------|
| 1.0.0   | 2025-01-10  | Beta diagram support, comprehensive testing, full documentation |
| 0.1.0   | 2024-11-09  | Initial release with desktop app and 6 stable diagram types |

---

## Migration Guides

### Migrating from 0.1.0 to 1.0.0

#### Breaking Changes
- None - fully backward compatible

#### New Features to Adopt
1. **Use new beta diagrams**:
   ```mermaid
   architecture-beta
       service web(server)[Web Server]
   ```

2. **Run automated tests**:
   ```bash
   pnpm test:all
   ```

3. **Use new NPM scripts**:
   ```bash
   pnpm run dev:desktop
   pnpm run test:beta
   ```

---

## Deprecations

### Version 1.0.0
- No deprecations in this release

### Future Deprecations
- ⚠️ Direct CDN loading may be replaced with bundled Mermaid in v2.0.0
- ⚠️ Some beta diagram syntax may change as features stabilize

---

## Security Updates

### Version 1.0.0
- No security issues identified
- Using Mermaid.js v11.12.0+ with latest security patches

---

## Contributors

### Version 1.0.0
- Initial comprehensive documentation and testing infrastructure
- Beta diagram support implementation
- Test automation framework

### Version 0.1.0
- Original project creation and core functionality
- Desktop application development
- Chrome extension simulator

---

## Links

- [GitHub Repository](https://github.com/your-username/MermaidVisualizerNEw)
- [Issue Tracker](https://github.com/your-username/MermaidVisualizerNEw/issues)
- [Mermaid.js Documentation](https://mermaid.js.org/)
- [Architecture Diagrams Guide](https://mermaid.js.org/syntax/architecture)

---

## Notes

### Versioning Strategy

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR** version when making incompatible API changes
- **MINOR** version when adding functionality in a backward compatible manner
- **PATCH** version when making backward compatible bug fixes

### Release Cadence

- **Major releases**: As needed for breaking changes
- **Minor releases**: Monthly or when significant features are ready
- **Patch releases**: Weekly or as needed for bug fixes

### Beta Features

Beta diagram types are marked with ⚡ in the UI and may have:
- Syntax changes in future Mermaid.js releases
- Limited browser support
- Performance considerations for large diagrams

Always test beta diagrams with the latest Mermaid.js version.

---

**Current Version:** 1.0.0
**Last Updated:** 2025-01-10
**Maintained By:** Project Team
