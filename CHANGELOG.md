# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/)
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Per-part color options for flags (`shortFlagStyle`, `longFlagStyle`, `typeAnnotationStyle`) and the usage line (`titleStyle`, `usageStyle`)
- Export `Style` and `StyleSpec` types

### Changed

- `Style` type now accepts all ANSI styles from `node:util` instead of a fixed subset
- Support compound styles via arrays (e.g. `["white", "bold"]`)

## [0.1.0] - 2026-07-21

### Added

- Style Commander.js help output with boxen borders and configurable ANSI colors
- Export border types derived from boxen

[Unreleased]: https://github.com/jeffzi/epaulettes/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/jeffzi/epaulettes/releases/tag/v0.1.0
